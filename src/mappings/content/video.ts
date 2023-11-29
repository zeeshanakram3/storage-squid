import { generateAppActionCommitment } from '@joystream/js/utils'
import {
  AppAction,
  AppActionMetadata,
  ContentMetadata,
  IVideoMetadata,
} from '@joystream/metadata-protobuf'
import { DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import { integrateMeta } from '@joystream/metadata-protobuf/utils'
import { Channel, Video } from '../../model'
import { EventHandlerContext } from '../../processor'
import { deserializeMetadata, deserializeMetadataStr, u8aToBytes } from '../utils'
import { processVideoMetadata } from './metadata'
import { deleteVideo, encodeAssets, processAppActionMetadata } from './utils'

export async function processVideoCreatedEvent({
  overlay,
  block,
  indexInBlock,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoCreated'>): Promise<void> {
  const [, channelId, contentId, contentCreationParameters, newDataObjectIds] =
    eventDecoder.v1000.decode(event)
  const { meta, expectedVideoStateBloatBond } = contentCreationParameters

  const videoId = contentId.toString()
  const video = overlay.getRepository(Video).new({
    id: videoId,
    createdAt: new Date(block.timestamp || ''),
    channelId: channelId.toString(),
    isCensored: false,
    isExcluded: false,
    createdInBlock: block.height,
    videoStateBloatBond: expectedVideoStateBloatBond,
  })

  // fetch related channel and owner
  const channel = await overlay.getRepository(Channel).getByIdOrFail(channelId.toString())

  // deserialize & process metadata
  const appAction =
    meta !== undefined && deserializeMetadataStr(AppAction, meta, { skipWarning: true })

  if (appAction) {
    const videoMetadata = appAction.rawAction
      ? deserializeMetadata(ContentMetadata, appAction.rawAction)?.videoMetadata ?? {}
      : {}

    const expectedCommitment = generateAppActionCommitment(
      channel.totalVideosCreated,
      channel.id,
      AppAction.ActionType.CREATE_VIDEO,
      AppAction.CreatorType.CHANNEL,
      encodeAssets(contentCreationParameters.assets),
      appAction.rawAction ?? undefined,
      appAction.metadata ?? undefined
    )
    await processAppActionMetadata(overlay, video, appAction, expectedCommitment, (entity) => {
      if (entity.entryAppId && appAction.metadata) {
        const appActionMetadata = deserializeMetadata(AppActionMetadata, appAction.metadata)

        appActionMetadata?.videoId &&
          integrateMeta(entity, { ytVideoId: appActionMetadata.videoId }, ['ytVideoId'])
      }
      return processVideoMetadata(
        overlay,
        block,
        indexInBlock,
        entity,
        videoMetadata,
        newDataObjectIds
      )
    })
  } else {
    const contentMetadata = deserializeMetadataStr(ContentMetadata, meta)
    if (contentMetadata?.videoMetadata) {
      await processVideoMetadata(
        overlay,
        block,
        indexInBlock,
        video,
        contentMetadata.videoMetadata,
        newDataObjectIds
      )
    }
  }

  channel.totalVideosCreated += 1
}

export async function processVideoUpdatedEvent({
  overlay,
  block,
  indexInBlock,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoUpdated'>): Promise<void> {
  const [contentActor, contentId, contentUpdateParameters, newDataObjectIds] =
    eventDecoder.v1000.decode(event)
  const { newMeta, autoIssueNft } = contentUpdateParameters
  const video = await overlay.getRepository(Video).getByIdOrFail(contentId.toString())

  const appAction = deserializeMetadataStr(AppAction, newMeta, { skipWarning: true })

  let videoMetadataUpdate: DecodedMetadataObject<IVideoMetadata> | null | undefined
  if (appAction) {
    const contentMetadataBytes = u8aToBytes(appAction.rawAction)
    videoMetadataUpdate = deserializeMetadata(
      ContentMetadata,
      contentMetadataBytes.toU8a(true)
    )?.videoMetadata
  } else {
    const contentMetadata = deserializeMetadataStr(ContentMetadata, newMeta)
    videoMetadataUpdate = contentMetadata?.videoMetadata
  }

  if (videoMetadataUpdate) {
    if ('publishedBeforeJoystream' in videoMetadataUpdate) {
      delete videoMetadataUpdate.publishedBeforeJoystream
    }

    await processVideoMetadata(
      overlay,
      block,
      indexInBlock,
      video,
      videoMetadataUpdate,
      newDataObjectIds
    )
  }
}

export async function processVideoDeletedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoDeleted'>): Promise<void> {
  const [, contentId] = eventDecoder.v1000.decode(event)
  await deleteVideo(overlay, contentId)
}

export async function processVideoDeletedByModeratorEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoDeletedByModerator'>): Promise<void> {
  const [, contentId] = eventDecoder.v1000.decode(event)
  await deleteVideo(overlay, contentId)
}

export async function processVideoVisibilitySetByModeratorEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoVisibilitySetByModerator'>): Promise<void> {
  const [, videoId, isCensored] = eventDecoder.v1000.decode(event)
  const video = await overlay.getRepository(Video).getByIdOrFail(videoId.toString())
  video.isCensored = isCensored
}
