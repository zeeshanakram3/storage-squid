import { MemberRemarked, MembershipMetadata } from '@joystream/metadata-protobuf'
import { hexToU8a } from '@polkadot/util'
import {
  Event,
  Membership,
  MetaprotocolTransactionResultFailed,
  MetaprotocolTransactionStatusEventData,
} from '../../model'
import { EventHandlerContext } from '../../processor'
import { bytesToString, deserializeMetadataStr, genericEventFields, toAddress } from '../utils'
import { processMemberRemarkMessage, processMembershipMetadata } from './metadata'

export async function processNewMember({
  overlay,
  block,
  event,
  eventDecoder,
}: EventHandlerContext<
  | 'Members.MemberCreated'
  | 'Members.MemberInvited'
  | 'Members.MembershipBought'
  | 'Members.MembershipGifted'
>) {
  const [memberId, params] =
    'v2001' in eventDecoder && eventDecoder.v2001.is(event)
      ? eventDecoder.v2001.decode(event)
      : eventDecoder.v1000.decode(event)

  const { controllerAccount, handle: handleBytes, metadata: metadataBytes } = params
  const metadata = deserializeMetadataStr(MembershipMetadata, metadataBytes)

  console.log(metadata, hexToU8a(controllerAccount))
  const member = overlay.getRepository(Membership).new({
    createdAt: new Date(block.timestamp || ''),
    id: memberId.toString(),
    controllerAccount: toAddress(hexToU8a(controllerAccount)),
    totalChannelsCreated: 0,
  })
  if (handleBytes) {
    updateMemberHandle(member as Membership, handleBytes)
  }

  if (metadata) {
    await processMembershipMetadata(overlay, member.id, metadata)
  }
}

export async function processMemberAccountsUpdatedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Members.MemberAccountsUpdated'>) {
  const [memberId, , newControllerAccount] = eventDecoder.v1000.decode(event)
  if (newControllerAccount) {
    const member = await overlay.getRepository(Membership).getByIdOrFail(memberId.toString())
    member.controllerAccount = toAddress(hexToU8a(newControllerAccount))
  }
}

export async function processMemberProfileUpdatedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Members.MemberProfileUpdated'>) {
  const [memberId, newHandle, newMetadata] = eventDecoder.v1000.decode(event)
  const member = await overlay.getRepository(Membership).getByIdOrFail(memberId.toString())

  if (newHandle) {
    updateMemberHandle(member as Membership, newHandle)
  }

  if (newMetadata) {
    const metadataUpdate = deserializeMetadataStr(MembershipMetadata, newMetadata)
    if (metadataUpdate) {
      await processMembershipMetadata(overlay, member.id, metadataUpdate)
    }
  }
}

function updateMemberHandle(member: Membership, newHandle: string) {
  member.handleRaw = newHandle
  member.handle = bytesToString(hexToU8a(newHandle))
}

export async function processMemberRemarkedEvent({
  overlay,
  block,
  event,
  indexInBlock,
  extrinsicHash,
  eventDecoder,
}: EventHandlerContext<'Members.MemberRemarked'>) {
  const [memberId, message] = eventDecoder.v2001.is(event)
    ? eventDecoder.v2001.decode(event)
    : eventDecoder.v1000.decode(event)

  const metadata = deserializeMetadataStr(MemberRemarked, message)
  const result = metadata
    ? await processMemberRemarkMessage(overlay, block, indexInBlock, memberId.toString(), metadata)
    : new MetaprotocolTransactionResultFailed({
        errorMessage: 'Could not decode the metadata',
      })
  const eventRepository = overlay.getRepository(Event)
  eventRepository.new({
    ...genericEventFields(overlay, block, indexInBlock, extrinsicHash),
    data: new MetaprotocolTransactionStatusEventData({
      result,
    }),
  })
}
