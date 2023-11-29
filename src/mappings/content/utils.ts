import {
  AppAction,
  IAppAction,
  IChannelMetadata,
  ISubtitleMetadata,
  IVideoMetadata,
} from '@joystream/metadata-protobuf'
import { DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import { integrateMeta } from '@joystream/metadata-protobuf/utils'
import { createType } from '@joystream/types'
import { ed25519Verify } from '@polkadot/util-crypto'
import { assertNotNull } from '@subsquid/substrate-processor'
import BN from 'bn.js'
import {
  App,
  Channel,
  DataObjectType,
  DataObjectTypeChannelAvatar,
  DataObjectTypeChannelCoverPhoto,
  DataObjectTypeVideoMedia,
  DataObjectTypeVideoSubtitle,
  DataObjectTypeVideoThumbnail,
  License as LicenseEntity,
  Video,
  VideoMediaEncoding,
  VideoMediaMetadata,
  VideoSubtitle,
} from '../../model'
import { StorageAssetsRecord } from '../../types/v1000'
import { EntityManagerOverlay, Flat } from '../../utils/overlay'
import { invalidMetadata } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsDecoded<MetaClass> = MetaClass extends { create: (props?: infer I) => any }
  ? DecodedMetadataObject<I>
  : never

export type PropertyOfWithType<E, T> = {
  [K in keyof E]: [E[K]] extends [T | null | undefined] ? ([T] extends [E[K]] ? K : never) : never
}[keyof E] &
  string &
  keyof E

export type EntityAssetProps<E> = PropertyOfWithType<E, string | null>
export type MetaNumberProps<M> = PropertyOfWithType<M, number>

export type EntityAssetsMap<
  E,
  M,
  OTC extends { new (): DataObjectType } = { new (): DataObjectType }
> = {
  DataObjectTypeConstructor: OTC
  entityProperty: EntityAssetProps<E>
  metaProperty: MetaNumberProps<M>
  createDataObjectType: (e: Flat<E>) => InstanceType<OTC>
}[]

export type AssetsMap = {
  channel: EntityAssetsMap<
    Channel,
    IChannelMetadata,
    { new (): DataObjectType & { channel: string } }
  >
  video: EntityAssetsMap<Video, IVideoMetadata, { new (): DataObjectType & { video: string } }>
  subtitle: EntityAssetsMap<
    VideoSubtitle,
    ISubtitleMetadata,
    { new (): DataObjectType & { subtitle: string } }
  >
}

export const ASSETS_MAP: AssetsMap = {
  channel: [
    {
      DataObjectTypeConstructor: DataObjectTypeChannelAvatar,
      entityProperty: 'avatarPhotoId',
      metaProperty: 'avatarPhoto',
      createDataObjectType: (e) => new DataObjectTypeChannelAvatar({ channel: e.id }),
    },
    {
      DataObjectTypeConstructor: DataObjectTypeChannelCoverPhoto,
      entityProperty: 'coverPhotoId',
      metaProperty: 'coverPhoto',
      createDataObjectType: (e) => new DataObjectTypeChannelCoverPhoto({ channel: e.id }),
    },
  ],
  video: [
    {
      DataObjectTypeConstructor: DataObjectTypeVideoMedia,
      entityProperty: 'mediaId',
      metaProperty: 'video',
      createDataObjectType: (e) => new DataObjectTypeVideoMedia({ video: e.id }),
    },
    {
      DataObjectTypeConstructor: DataObjectTypeVideoThumbnail,
      entityProperty: 'thumbnailPhotoId',
      metaProperty: 'thumbnailPhoto',
      createDataObjectType: (e) => new DataObjectTypeVideoThumbnail({ video: e.id }),
    },
  ],
  subtitle: [
    {
      DataObjectTypeConstructor: DataObjectTypeVideoSubtitle,
      entityProperty: 'assetId',
      metaProperty: 'newAsset',
      createDataObjectType: (e) =>
        new DataObjectTypeVideoSubtitle({ video: assertNotNull(e.videoId), subtitle: e.id }),
    },
  ],
}

export async function deleteChannel(overlay: EntityManagerOverlay, channelId: bigint) {
  overlay.getRepository(Channel).remove(channelId.toString())
}

export async function deleteVideo(overlay: EntityManagerOverlay, videoId: bigint) {
  const videoRepository = overlay.getRepository(Video)
  const licenseRepository = overlay.getRepository(LicenseEntity)
  const mediaMetadataRepository = overlay.getRepository(VideoMediaMetadata)
  const mediaEncodingRepository = overlay.getRepository(VideoMediaEncoding)
  const subtitlesRepository = overlay.getRepository(VideoSubtitle)
  const em = overlay.getEm()

  const video = await videoRepository.getByIdOrFail(videoId.toString())
  const mediaMetadata = await mediaMetadataRepository.getOneByRelation('videoId', video.id)
  const mediaEncoding = await mediaEncodingRepository.getById(mediaMetadata?.encodingId || '')
  const subtitles = await subtitlesRepository.getManyByRelation('videoId', video.id)

  if (video.licenseId) {
    licenseRepository.remove(video.licenseId)
  }
  if (mediaMetadata?.id) {
    mediaMetadataRepository.remove(mediaMetadata.id)
  }
  if (mediaEncoding?.id) {
    mediaEncodingRepository.remove(mediaEncoding.id)
  }
  subtitlesRepository.remove(...subtitles)
  videoRepository.remove(video)
}

export async function getChannelOwnerMemberByVideoId(
  overlay: EntityManagerOverlay,
  videoId: string
): Promise<string | undefined> {
  const video = await overlay.getRepository(Video).getByIdOrFail(videoId)
  if (video.channelId) {
    return getChannelOwnerMemberByChannelId(overlay, video.channelId)
  }
}

export async function getChannelOwnerMemberByChannelId(
  overlay: EntityManagerOverlay,
  channelId: string
): Promise<string | undefined> {
  const channel = await overlay.getRepository(Channel).getByIdOrFail(channelId)
  return channel.ownerMemberId ?? undefined
}

async function validateAndGetApp(
  overlay: EntityManagerOverlay,
  expectedSignedCommitment: string,
  appAction: DecodedMetadataObject<IAppAction>
): Promise<Flat<App> | undefined> {
  // If one is missing we cannot verify the signature
  if (!appAction.appId || !appAction.signature) {
    invalidMetadata(AppAction, 'Missing action fields to verify app', { decodedMessage: appAction })
    return undefined
  }

  const app = await overlay.getRepository(App).getById(appAction.appId)

  if (!app) {
    invalidMetadata(AppAction, 'No app of given id found', { decodedMessage: appAction })
    return undefined
  }

  if (!app.authKey) {
    invalidMetadata(AppAction, 'The provided app has no auth key assigned', {
      decodedMessage: appAction,
      app,
    })
    return undefined
  }

  try {
    const isSignatureValid = ed25519Verify(
      expectedSignedCommitment,
      appAction.signature,
      app.authKey
    )

    if (!isSignatureValid) {
      invalidMetadata(AppAction, 'Invalid app action signature', { decodedMessage: appAction })
    }

    return isSignatureValid ? app : undefined
  } catch (e) {
    invalidMetadata(AppAction, `Could not verify signature: ${(e as Error)?.message}`, {
      decodedMessage: appAction,
    })
    return undefined
  }
}

export async function processAppActionMetadata<
  T extends { entryAppId?: string | null | undefined }
>(
  overlay: EntityManagerOverlay,
  entity: T,
  meta: DecodedMetadataObject<IAppAction>,
  expectedSignedCommitment: string,
  entityMetadataProcessor: (entity: T) => Promise<void>
): Promise<void> {
  const app = await validateAndGetApp(overlay, expectedSignedCommitment, meta)
  if (!app) {
    return entityMetadataProcessor(entity)
  }

  integrateMeta(entity, { entryAppId: app.id }, ['entryAppId'])

  return entityMetadataProcessor(entity)
}

export function encodeAssets(assets: StorageAssetsRecord | undefined): Uint8Array {
  return createType(
    'Option<PalletContentStorageAssetsRecord>',
    assets
      ? {
          expectedDataSizeFee: new BN(assets.expectedDataSizeFee.toString()),
          objectCreationList: assets.objectCreationList.map((o) => ({
            size_: new BN(o.size.toString()),
            ipfsContentId: o.ipfsContentId,
          })),
        }
      : null
  ).toU8a()
}
