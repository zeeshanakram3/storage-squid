import { IMemberRemarked, IMembershipMetadata, MemberRemarked } from '@joystream/metadata-protobuf'
import { DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import { isSet } from '@joystream/metadata-protobuf/utils'
import { AvatarUri, MemberMetadata, MetaprotocolTransactionResult } from '../../model'
import { Block } from '../../processor'
import { EntityManagerOverlay } from '../../utils/overlay'
import { processCreateAppMessage, processUpdateAppMessage } from '../content/app'
import { metaprotocolTransactionFailure } from '../utils'

export async function processMembershipMetadata(
  overlay: EntityManagerOverlay,
  memberId: string,
  metadataUpdate: DecodedMetadataObject<IMembershipMetadata>
) {
  const metadataRepository = overlay.getRepository(MemberMetadata)
  const memberMetadata =
    (await metadataRepository.getById(memberId)) ||
    metadataRepository.new({ id: memberId, memberId })

  if (isSet(metadataUpdate.avatarUri)) {
    memberMetadata.avatar = metadataUpdate.avatarUri
      ? new AvatarUri({ avatarUri: metadataUpdate.avatarUri })
      : null
  }

  if (isSet(metadataUpdate.name)) {
    // On empty string, set to `null`
    memberMetadata.name = metadataUpdate.name || null
  }

  if (isSet(metadataUpdate.about)) {
    // On empty string, set to `null`
    memberMetadata.about = metadataUpdate.about || null
  }
}

export async function processMemberRemarkMessage(
  overlay: EntityManagerOverlay,
  block: Block,
  indexInBlock: number,
  memberId: string,
  decodedMessage: DecodedMetadataObject<IMemberRemarked>
): Promise<MetaprotocolTransactionResult> {
  if (decodedMessage.createApp) {
    return processCreateAppMessage(
      overlay,
      block.height,
      indexInBlock,
      decodedMessage.createApp,
      memberId
    )
  }

  if (decodedMessage.updateApp) {
    return processUpdateAppMessage(overlay, decodedMessage.updateApp, memberId)
  }

  // unknown message type
  return metaprotocolTransactionFailure(MemberRemarked, 'Unsupported remark action', {
    decodedMessage,
  })
}
