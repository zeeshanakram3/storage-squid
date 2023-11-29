import {
  ChannelMetadata,
  IChannelMetadata,
  ILicense,
  IMediaType,
  IPublishedBeforeJoystream,
  ISubtitleMetadata,
  IVideoMetadata,
  PublishedBeforeJoystream,
  SubtitleMetadata,
  VideoMetadata,
} from '@joystream/metadata-protobuf'
import { AnyMetadataClass, DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import {
  integrateMeta,
  isEmptyObject,
  isSet,
  isValidLanguageCode,
} from '@joystream/metadata-protobuf/utils'
import {
  Channel,
  License,
  StorageDataObject,
  Video,
  VideoMediaEncoding,
  VideoMediaMetadata,
  VideoSubtitle,
} from '../../model'
import { Block } from '../../processor'
import { EntityManagerOverlay, Flat } from '../../utils/overlay'
import { invalidMetadata } from '../utils'
import { ASSETS_MAP, AsDecoded, EntityAssetProps, EntityAssetsMap, MetaNumberProps } from './utils'
export async function processChannelMetadata(
  overlay: EntityManagerOverlay,
  block: Block,
  channel: Flat<Channel>,
  meta: DecodedMetadataObject<IChannelMetadata>,
  newAssetIds: bigint[]
) {
  const dataObjectRepository = overlay.getRepository(StorageDataObject)
  const assets = await Promise.all(
    newAssetIds.map((id) => dataObjectRepository.getByIdOrFail(id.toString()))
  )

  integrateMeta(channel, meta, ['title', 'description', 'isPublic'])

  await processAssets(overlay, block, assets, channel, ChannelMetadata, meta, ASSETS_MAP.channel)

  // prepare language if needed
  if (isSet(meta.language)) {
    processLanguage(ChannelMetadata, channel, meta.language)
  }
}

export async function processVideoMetadata(
  overlay: EntityManagerOverlay,
  block: Block,
  indexInBlock: number,
  video: Flat<Video>,
  meta: DecodedMetadataObject<IVideoMetadata>,
  newAssetIds: bigint[]
): Promise<void> {
  const dataObjectRepository = overlay.getRepository(StorageDataObject)
  const assets = await Promise.all(
    newAssetIds.map((id) => dataObjectRepository.getByIdOrFail(id.toString()))
  )

  integrateMeta(video, meta, ['title', 'description', 'duration', 'isExplicit', 'isPublic'])

  await processAssets(overlay, block, assets, video, VideoMetadata, meta, ASSETS_MAP.video)

  // prepare media meta information if needed
  if (
    isSet(meta.video) ||
    isSet(meta.mediaType) ||
    isSet(meta.mediaPixelWidth) ||
    isSet(meta.mediaPixelHeight)
  ) {
    // prepare video file size if poosible
    const videoSize = extractVideoSize(assets)
    await processVideoMediaMetadata(overlay, block, indexInBlock, video.id, meta, videoSize)
  }

  // prepare license if needed
  if (isSet(meta.license)) {
    await processVideoLicense(overlay, block, indexInBlock, video, meta.license)
  }

  // prepare language if needed
  if (isSet(meta.language)) {
    processLanguage(VideoMetadata, video, meta.language)
  }

  // prepare subtitles if needed
  const subtitles = meta.clearSubtitles ? [] : meta.subtitles
  if (isSet(subtitles)) {
    await processVideoSubtitles(overlay, block, video, assets, subtitles)
  }

  if (isSet(meta.publishedBeforeJoystream)) {
    processPublishedBeforeJoystream(video, meta.publishedBeforeJoystream)
  }
}

function extractVideoSize(assets: Flat<StorageDataObject>[]): bigint | undefined {
  const mediaAsset = assets.find((a) => a.type?.isTypeOf === 'DataObjectTypeVideoMedia')
  return mediaAsset ? mediaAsset.size : undefined
}

async function processVideoMediaEncoding(
  overlay: EntityManagerOverlay,
  mediaMetadata: Flat<VideoMediaMetadata>,
  metadata: DecodedMetadataObject<IMediaType>
): Promise<void> {
  const metadataRepository = overlay.getRepository(VideoMediaEncoding)
  // TODO: Make it one-to-many w/ video media?
  // Or perhaps just jsonb?
  const encoding =
    (await metadataRepository.getById(mediaMetadata.id)) ||
    metadataRepository.new({
      id: mediaMetadata.id,
    })

  // integrate media encoding-related data
  integrateMeta(encoding, metadata, ['codecName', 'container', 'mimeMediaType'])
  mediaMetadata.encodingId = encoding.id
}

async function processVideoMediaMetadata(
  overlay: EntityManagerOverlay,
  block: Block,
  indexInBlock: number,
  videoId: string,
  metadata: DecodedMetadataObject<IVideoMetadata>,
  videoSize: bigint | undefined
): Promise<void> {
  const metadataRepository = overlay.getRepository(VideoMediaMetadata)
  const videoMediaMetadata =
    (await metadataRepository.getOneByRelation('videoId', videoId)) ||
    metadataRepository.new({
      // TODO: Re-think backward-compatibility
      id: `${block.height}-${indexInBlock}`, // videoId,
      createdInBlock: block.height,
      videoId,
    })

  // integrate media-related data
  const mediaMetadataUpdate = {
    size: isSet(videoSize) ? videoSize : undefined,
    pixelWidth: metadata.mediaPixelWidth,
    pixelHeight: metadata.mediaPixelHeight,
  }
  integrateMeta(videoMediaMetadata, mediaMetadataUpdate, ['pixelWidth', 'pixelHeight', 'size'])
  if (metadata.mediaType) {
    await processVideoMediaEncoding(overlay, videoMediaMetadata, metadata.mediaType)
  }
}

async function processVideoLicense(
  overlay: EntityManagerOverlay,
  block: Block,
  indexInBlock: number,
  video: Flat<Video>,
  licenseMetadata: DecodedMetadataObject<ILicense>
): Promise<void> {
  const licenseRepository = overlay.getRepository(License)
  if (!isEmptyObject(licenseMetadata)) {
    // license is meant to be created/updated
    // TODO: Make it one-to-many w/ video?
    const videoLicense =
      (await licenseRepository.getById(video.licenseId || '')) ||
      licenseRepository.new({
        // TODO: Re-think backward-compatibility
        id: `${block.height}-${indexInBlock}`, // videoId,
      })
    integrateMeta(videoLicense, licenseMetadata, ['attribution', 'code', 'customText'])
    video.licenseId = videoLicense.id
  } else {
    // license is meant to be unset/removed
    if (video.licenseId) {
      licenseRepository.remove(video.licenseId)
    }
    video.licenseId = null
  }
}

async function processVideoSubtitles(
  overlay: EntityManagerOverlay,
  block: Block,
  video: Flat<Video>,
  assets: Flat<StorageDataObject>[],
  subtitlesMeta: DecodedMetadataObject<ISubtitleMetadata>[]
): Promise<void> {
  const dataObjectRepository = overlay.getRepository(StorageDataObject)
  const subtitlesRepository = overlay.getRepository(VideoSubtitle)
  const currentSubtitles = await subtitlesRepository.getManyByRelation('videoId', video.id)
  dataObjectRepository.remove(...currentSubtitles.flatMap((s) => (s.assetId ? [s.assetId] : [])))
  subtitlesRepository.remove(...currentSubtitles)
  for (const subtitleMeta of subtitlesMeta) {
    const subtitleId = `${video.id}-${subtitleMeta.type}-${subtitleMeta.language}`
    const subtitle = subtitlesRepository.new({
      id: subtitleId,
      type: subtitleMeta.type,
      videoId: video.id,
      mimeType: subtitleMeta.mimeType,
    })
    processLanguage(SubtitleMetadata, subtitle, subtitleMeta.language)
    await processAssets(
      overlay,
      block,
      assets,
      subtitle,
      SubtitleMetadata,
      subtitleMeta,
      ASSETS_MAP.subtitle
    )
  }
}

function processPublishedBeforeJoystream(
  video: Flat<Video>,
  metadata: DecodedMetadataObject<IPublishedBeforeJoystream>
): void {
  if (!metadata.isPublished) {
    // Property is beeing unset
    video.publishedBeforeJoystream = null
    return
  }

  // try to parse timestamp from publish date
  const timestamp = isSet(metadata.date) ? Date.parse(metadata.date) : NaN

  // ensure date is valid
  if (isNaN(timestamp)) {
    invalidMetadata(PublishedBeforeJoystream, `Invalid date provided`, {
      decodedMessage: metadata,
    })
    return
  }

  // set new date
  video.publishedBeforeJoystream = new Date(timestamp)
}

async function processAssets<E, M extends AnyMetadataClass<unknown>>(
  overlay: EntityManagerOverlay,
  block: Block,
  assets: Flat<StorageDataObject>[],
  entity: { [K in EntityAssetProps<E>]?: string | null | undefined },
  metadataClass: M,
  meta: { [K in MetaNumberProps<AsDecoded<M>>]?: number | null | undefined },
  entityAssetsMap: EntityAssetsMap<E, AsDecoded<M>>
): Promise<void> {
  for (const { metaProperty, entityProperty, createDataObjectType } of entityAssetsMap) {
    const newAssetIndex: number | undefined = meta[metaProperty] ?? undefined
    const currentAssetId = entity[entityProperty]
    const currentAsset = currentAssetId
      ? await overlay.getRepository(StorageDataObject).getById(currentAssetId)
      : null
    if (isSet(newAssetIndex)) {
      const newAsset = findAssetByIndex(metadataClass, assets, newAssetIndex)
      if (newAsset) {
        if (currentAsset) {
          currentAsset.unsetAt = new Date(block.timestamp || '')
        }
        entity[entityProperty] = newAsset.id
        newAsset.type = createDataObjectType(entity as E)
      }
    }
  }
}

function findAssetByIndex(
  metaClass: AnyMetadataClass<unknown>,
  assets: Flat<StorageDataObject>[],
  index: number
): Flat<StorageDataObject> | null {
  if (assets[index]) {
    return assets[index]
  }

  invalidMetadata<unknown>(metaClass, `Non-existing asset index`, {
    numberOfAssets: assets.length,
    requestedAssetIndex: index,
  })

  return null
}

function processLanguage(
  metaClass: AnyMetadataClass<unknown>,
  entity: Flat<Video> | Flat<Channel> | Flat<VideoSubtitle>,
  iso: string
) {
  // ensure language string is valid
  if (!isValidLanguageCode(iso)) {
    invalidMetadata<unknown>(metaClass, `Invalid language ISO-639-1 provided`, { iso })
    return
  }

  entity.language = iso
}
