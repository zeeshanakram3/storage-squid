import { generateAppActionCommitment } from '@joystream/js/utils'
import { AppAction, ChannelMetadata, IChannelMetadata } from '@joystream/metadata-protobuf'
import { DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import { Channel, Membership } from '../../model'
import { EventHandlerContext } from '../../processor'
import { Flat } from '../../utils/overlay'
import { deserializeMetadata, deserializeMetadataStr, u8aToBytes } from '../utils'
import { processChannelMetadata } from './metadata'
import { deleteChannel, encodeAssets, processAppActionMetadata } from './utils'

export async function processChannelCreatedEvent({
  overlay,
  block,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.ChannelCreated'>) {
  const [channelId, { owner, dataObjects, channelStateBloatBond }, channelCreationParameters] =
    eventDecoder.v1000.decode(event)

  // create entity
  const channel = overlay.getRepository(Channel).new({
    id: channelId.toString(),
    isCensored: false,
    isExcluded: false,
    createdAt: new Date(block.timestamp || ''),
    createdInBlock: block.height,
    ownerMemberId: owner.__kind === 'Member' ? owner.value.toString() : undefined,
    channelStateBloatBond: channelStateBloatBond.amount,
    totalVideosCreated: 0,
  })

  const ownerMember = channel.ownerMemberId
    ? await overlay.getRepository(Membership).getByIdOrFail(channel.ownerMemberId)
    : undefined

  // deserialize & process metadata
  if (channelCreationParameters.meta !== undefined) {
    const appAction = deserializeMetadataStr(AppAction, channelCreationParameters.meta, {
      skipWarning: true,
    })

    if (appAction) {
      const channelMetadata = appAction.rawAction
        ? deserializeMetadata(ChannelMetadata, appAction.rawAction) ?? {}
        : {}
      const creatorType = channel.ownerMemberId
        ? AppAction.CreatorType.MEMBER
        : AppAction.CreatorType.CURATOR_GROUP
      const creatorId = channel.ownerMemberId ?? '' // curator groups not supported yet
      const expectedCommitment = generateAppActionCommitment(
        ownerMember?.totalChannelsCreated ?? -1,
        creatorId,
        AppAction.ActionType.CREATE_CHANNEL,
        creatorType,
        encodeAssets(channelCreationParameters.assets),
        appAction.rawAction ?? undefined,
        appAction.metadata ?? undefined
      )
      await processAppActionMetadata<Flat<Channel>>(
        overlay,
        channel,
        appAction,
        expectedCommitment,
        (entity) => processChannelMetadata(overlay, block, entity, channelMetadata, dataObjects)
      )
    } else {
      const metadata = deserializeMetadataStr(ChannelMetadata, channelCreationParameters.meta) ?? {}
      await processChannelMetadata(overlay, block, channel, metadata, dataObjects)
    }
  }

  if (ownerMember) {
    ownerMember.totalChannelsCreated += 1
  }
}

export async function processChannelUpdatedEvent({
  overlay,
  block,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.ChannelUpdated'>) {
  const [, channelId, channelUpdateParameters, newDataObjects] = eventDecoder.v1000.decode(event)
  const channel = await overlay.getRepository(Channel).getByIdOrFail(channelId.toString())

  //  update metadata if it was changed
  if (channelUpdateParameters.newMeta) {
    const appAction = deserializeMetadataStr(AppAction, channelUpdateParameters.newMeta, {
      skipWarning: true,
    })

    let channelMetadataUpdate: DecodedMetadataObject<IChannelMetadata> | null | undefined
    if (appAction) {
      const channelMetadataBytes = u8aToBytes(appAction.rawAction)
      channelMetadataUpdate = deserializeMetadata(ChannelMetadata, channelMetadataBytes.toU8a(true))
    } else {
      channelMetadataUpdate = deserializeMetadataStr(
        ChannelMetadata,
        channelUpdateParameters.newMeta
      )
    }

    await processChannelMetadata(
      overlay,
      block,
      channel,
      channelMetadataUpdate ?? {},
      newDataObjects
    )
  }
}

export async function processChannelDeletedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.ChannelDeleted'>): Promise<void> {
  const [, channelId] = eventDecoder.v1000.decode(event)
  await deleteChannel(overlay, channelId)
}

export async function processChannelDeletedByModeratorEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.ChannelDeletedByModerator'>): Promise<void> {
  const [, channelId] = eventDecoder.v1000.decode(event)
  await deleteChannel(overlay, channelId)
}

export async function processChannelVisibilitySetByModeratorEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.ChannelVisibilitySetByModerator'>): Promise<void> {
  const [, channelId, isHidden] = eventDecoder.v1000.decode(event)
  const channel = await overlay.getRepository(Channel).getByIdOrFail(channelId.toString())
  channel.isCensored = isHidden
}
