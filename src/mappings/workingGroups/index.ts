import { RemarkMetadataAction } from '@joystream/metadata-protobuf'
import { Worker } from '../../model'
import { Block, EventHandlerContext } from '../../processor'
import { criticalError } from '../../utils/misc'
import { EntityManagerOverlay } from '../../utils/overlay'
import { processSetNodeOperationalStatusMessage } from '../storage/utils'
import { deserializeMetadataStr, invalidMetadata, toLowerFirstLetter } from '../utils'

export async function processWorkingGroupsOpeningFilledEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<
  'StorageWorkingGroup.OpeningFilled' | 'DistributionWorkingGroup.OpeningFilled'
>) {
  const [, applicationIdToWorkerIdMap, applicationIdsSet] = eventDecoder.v1000.decode(event)
  const [workingGroupName] = event.name.split('.')

  const getWorkerIdByApplicationId = (applicationId: bigint): bigint => {
    const tuple = applicationIdToWorkerIdMap.find(([appId, _]) => appId === applicationId)
    if (!tuple) {
      criticalError(
        `Worker id for application id ${applicationId} not found in applicationIdToWorkerIdMap`
      )
    }
    return tuple[1]
  }

  applicationIdsSet.forEach((applicationId) => {
    const workerId = getWorkerIdByApplicationId(applicationId)
    overlay.getRepository(Worker).new({
      id: `${toLowerFirstLetter(workingGroupName)}-${workerId}`,
      runtimeId: workerId,
    })
  })
}

export async function processWorkingGroupsWorkerTerminatedOrExitedEvent({
  overlay,
  event,
  eventDecoder,
}: EventHandlerContext<
  | 'StorageWorkingGroup.TerminatedWorker'
  | 'StorageWorkingGroup.TerminatedLeader'
  | 'StorageWorkingGroup.WorkerExited'
  | 'DistributionWorkingGroup.TerminatedWorker'
  | 'DistributionWorkingGroup.TerminatedLeader'
  | 'DistributionWorkingGroup.WorkerExited'
>) {
  const decoded = eventDecoder.v1000.decode(event)

  let workerId: bigint

  if (typeof decoded === 'bigint') {
    workerId = decoded
  } else {
    workerId = decoded[0]
  }

  // Get the working group name
  const [workingGroupName] = event.name.split('.')

  // Remove the worker
  overlay.getRepository(Worker).remove(`${toLowerFirstLetter(workingGroupName)}-${workerId}`)
}

export async function processWorkingGroupsLeadRemarkedEvent({
  overlay,
  block,
  event,
  indexInBlock,
  extrinsicHash,
  eventDecoder,
}: EventHandlerContext<
  'StorageWorkingGroup.LeadRemarked' | 'DistributionWorkingGroup.LeadRemarked'
>) {
  const [metadataBytes] = eventDecoder.v1000.decode(event)

  // Get the working group name
  const [workingGroup] = event.name.split('.')
  const workingGroupName = toLowerFirstLetter(workingGroup)

  await applyWorkingGroupsRemark(
    overlay,
    block,
    indexInBlock,
    extrinsicHash,
    workingGroupName as 'storageWorkingGroup' | 'distributionWorkingGroup',
    undefined,
    metadataBytes
  )
}

export async function processWorkingGroupsWorkerRemarkedEvent({
  overlay,
  block,
  event,
  indexInBlock,
  extrinsicHash,
  eventDecoder,
}: EventHandlerContext<
  'StorageWorkingGroup.WorkerRemarked' | 'DistributionWorkingGroup.WorkerRemarked'
>) {
  const [workerId, metadataBytes] = eventDecoder.v1000.decode(event)

  // Get the working group name
  const [workingGroup] = event.name.split('.')
  const workingGroupName = toLowerFirstLetter(workingGroup)

  // Get the worker
  const worker = await overlay
    .getRepository(Worker)
    .getByIdOrFail(`${workingGroupName}-${workerId}`)

  await applyWorkingGroupsRemark(
    overlay,
    block,
    indexInBlock,
    extrinsicHash,
    workingGroupName as 'storageWorkingGroup' | 'distributionWorkingGroup',
    worker,
    metadataBytes
  )
}

async function applyWorkingGroupsRemark(
  overlay: EntityManagerOverlay,
  block: Block,
  indexInBlock: number,
  extrinsicHash: string | undefined,
  workingGroup: 'storageWorkingGroup' | 'distributionWorkingGroup',
  actor: Worker | undefined,
  metadataBytes: string
): Promise<void> {
  const metadata = deserializeMetadataStr(RemarkMetadataAction, metadataBytes)

  if (metadata?.setNodeOperationalStatus) {
    await processSetNodeOperationalStatusMessage(
      overlay,
      block,
      indexInBlock,
      extrinsicHash,
      workingGroup,
      actor,
      metadata.setNodeOperationalStatus
    )
  } else {
    return invalidMetadata(RemarkMetadataAction, 'Unsupported remarked action')
  }
}
