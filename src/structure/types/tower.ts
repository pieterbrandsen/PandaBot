import {
  GetJobById,
  DeleteJobById,
  AssignNewJobForStructure,
} from "../../room/jobs/handler";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { GetObject } from "../../utils/helper";
import { FuncWrapper } from "../../utils/wrapper";
import { GetStructureMemory } from "../helper";
import {
  IsStructureDamaged,
  RepairIfDamagedStructure,
  TryToCreateTransferJob,
} from "./helper";

/**
 * Execute an attack job for a tower
 *
 * @param {StructureTower} str - Tower structure
 * @param {Job} job - attack job
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ExecuteTowerAttack = FuncWrapper(function ExecuteTowerAttack(
  str: StructureTower,
  job: Job
): FunctionReturn {
  const getObject = GetObject(job.objId);
  if (getObject.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getObject.code);
  const creep: Creep = getObject.response as Creep;

  switch (str.attack(creep)) {
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, str.room.name);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute an heal job for a tower
 *
 * @param {StructureTower} str - Tower structure
 * @param {Job} job - heal job
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ExecuteTowerHeal = FuncWrapper(function ExecuteTowerHeal(
  str: StructureTower,
  job: Job
): FunctionReturn {
  const getObject = GetObject(job.objId);
  if (getObject.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getObject.code);
  const creep: Creep = getObject.response as Creep;

  switch (str.heal(creep)) {
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, str.room.name);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute an repair job for a tower
 *
 * @param {StructureTower} str - Tower structure
 * @param {Job} job - repair job
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ExecuteTowerRepair = FuncWrapper(function ExecuteTowerRepair(
  str: StructureTower,
  job: Job
): FunctionReturn {
  const getObject = GetObject(job.objId);
  if (getObject.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getObject.code);
  const targetStr: Structure = getObject.response as Structure;

  if (!IsStructureDamaged(targetStr).response) {
    DeleteJobById(job.id, job.roomName);
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  switch (str.repair(targetStr)) {
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, str.room.name);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetNewTowerJob = FuncWrapper(function GetNewTowerJob(
  str: StructureTower
): FunctionReturn {
  AssignNewJobForStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute an tower
 *
 * @param {StructureTower} str - tower structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ExecuteTower = FuncWrapper(function ExecuteTower(
  str: StructureTower
): FunctionReturn {
  RepairIfDamagedStructure(str);
  TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, true);

  const getStructureMemory = GetStructureMemory(str.id);
  if (getStructureMemory.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getStructureMemory.code);
  const strMem: StructureMemory = getStructureMemory.response;

  if (strMem.jobId) {
    const job: Job = GetJobById(strMem.jobId as Id<Job>, str.room.name)
      .response;
    switch (job.action) {
      case "attack":
        ExecuteTowerAttack(str, job);
        break;
      case "heal":
        ExecuteTowerHeal(str, job);
        break;
      case "repair":
        ExecuteTowerRepair(str, job);
        break;
      default:
        break;
    }
  } else {
    GetNewTowerJob(str);
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
