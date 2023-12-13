import { ISubtitleMetadata, IVideoMetadata, SubtitleMetadata } from '@joystream/metadata-protobuf'
import { AnyMetadataClass, DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import { isSet } from '@joystream/metadata-protobuf/utils'
import { StorageDataObject, VideoSubtitle } from '../../model'
import { uniqueId } from '../../utils/misc'
import { EntityManagerOverlay, Flat } from '../../utils/overlay'
import { invalidMetadata } from '../utils'
import { ASSETS_MAP, AsDecoded, EntityAssetProps, EntityAssetsMap, MetaNumberProps } from './utils'

export async function processVideoMetadata(
  overlay: EntityManagerOverlay,
  meta: DecodedMetadataObject<IVideoMetadata>,
  newAssetIds: bigint[]
): Promise<void> {
  const dataObjectRepository = overlay.getRepository(StorageDataObject)
  const assets = await Promise.all(
    newAssetIds.map((id) => dataObjectRepository.getByIdOrFail(id.toString()))
  )

  // prepare subtitles if needed
  const subtitles = meta.clearSubtitles ? [] : meta.subtitles
  if (isSet(subtitles)) {
    await processVideoSubtitles(overlay, assets, subtitles)
  }
}

async function processVideoSubtitles(
  overlay: EntityManagerOverlay,
  assets: Flat<StorageDataObject>[],
  subtitlesMeta: DecodedMetadataObject<ISubtitleMetadata>[]
): Promise<void> {
  const subtitlesRepository = overlay.getRepository(VideoSubtitle)
  for (const subtitleMeta of subtitlesMeta) {
    const subtitleId = uniqueId()
    const subtitle = subtitlesRepository.new({
      id: subtitleId,
      mimeType: subtitleMeta.mimeType,
    })

    await processAssets(assets, subtitle, SubtitleMetadata, subtitleMeta, ASSETS_MAP.subtitle)
  }
}

async function processAssets<E, M extends AnyMetadataClass<unknown>>(
  assets: Flat<StorageDataObject>[],
  entity: { [K in EntityAssetProps<E>]?: string | null | undefined },
  metadataClass: M,
  meta: { [K in MetaNumberProps<AsDecoded<M>>]?: number | null | undefined },
  entityAssetsMap: EntityAssetsMap<E, AsDecoded<M>>
): Promise<void> {
  for (const { metaProperty, entityProperty, createDataObjectType } of entityAssetsMap) {
    const newAssetIndex: number | undefined = meta[metaProperty] ?? undefined

    if (isSet(newAssetIndex)) {
      const newAsset = findAssetByIndex(metadataClass, assets, newAssetIndex)
      if (newAsset) {
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
