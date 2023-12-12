import { AppAction, ContentMetadata, IContentMetadata } from '@joystream/metadata-protobuf'
import { DecodedMetadataObject } from '@joystream/metadata-protobuf/types'
import { EventHandlerContext } from '../../processor'
import { deserializeMetadata, deserializeMetadataStr } from '../utils'
import { processVideoMetadata } from './metadata'

export async function processVideoCreatedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoCreated'>): Promise<void> {
  const [, , , { meta }, newDataObjectIds] = eventDecoder.v1000.decode(event)

  let contentMetadata: DecodedMetadataObject<IContentMetadata> | undefined | null
  const appActionMetadata = deserializeMetadataStr(AppAction, meta, { skipWarning: true })
  if (appActionMetadata) {
    contentMetadata = appActionMetadata.rawAction
      ? deserializeMetadata(ContentMetadata, appActionMetadata.rawAction)
      : undefined
  } else {
    contentMetadata = deserializeMetadataStr(ContentMetadata, meta)
  }

  if (contentMetadata?.videoMetadata) {
    await processVideoMetadata(overlay, contentMetadata.videoMetadata, newDataObjectIds)
  }
}

export async function processVideoUpdatedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<'Content.VideoUpdated'>): Promise<void> {
  const [, , { newMeta }, newDataObjectIds] = eventDecoder.v1000.decode(event)

  let contentMetadata: DecodedMetadataObject<IContentMetadata> | undefined | null
  const appActionMetadata = deserializeMetadataStr(AppAction, newMeta, { skipWarning: true })
  if (appActionMetadata) {
    contentMetadata = appActionMetadata.rawAction
      ? deserializeMetadata(ContentMetadata, appActionMetadata.rawAction)
      : undefined
  } else {
    contentMetadata = deserializeMetadataStr(ContentMetadata, newMeta)
  }

  if (contentMetadata?.videoMetadata) {
    await processVideoMetadata(overlay, contentMetadata.videoMetadata, newDataObjectIds)
  }
}
