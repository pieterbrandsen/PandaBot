import { isUndefined } from "lodash";
import {
  DeleteJobById,
  AssignNewJobForCreep,
  UnassignJob,
  UpdateJobById,
} from "../../room/jobs/handler";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetCreepMemory, UpdateCreepMemory } from "../helper";
import { ExecuteMove } from "./move";

// eslint-disable-next-line
export const ExecuteUpgrade = FuncWrapper(function ExecuteUpgrade(
  creep: Creep,
  job: Job
): FunctionReturn {
  const _job = job;
  const getCreepMemory = GetCreepMemory(creep.name);
  if (getCreepMemory.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getCreepMemory.code);
  }
  const creepMem: CreepMemory = getCreepMemory.response;
  if (
    isUndefined(creep.room.controller) ||
    isUndefined(_job.energyRequired) ||
    _job.energyRequired <= 0
  ) {
    DeleteJobById(job.id, job.roomName);
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }
  const { controller } = creep.room;
  switch (creep.upgradeController(controller)) {
    case OK:
      creep.say("upgrade");
      _job.energyRequired -= creep.getActiveBodyparts(WORK) * 2;
      UpdateJobById(job.id, _job, job.roomName);

      if (isUndefined(creepMem.parts[WORK]))
        creepMem.parts[WORK] = creep.getActiveBodyparts(WORK);
      global.preProcessingStats.rooms[creep.room.name].energyExpenses.upgrade +=
        creepMem.parts[WORK];
      break;
    case ERR_NOT_ENOUGH_RESOURCES:
      if (
        AssignNewJobForCreep(creep, ["withdrawController"]).code ===
        FunctionReturnCodes.NO_CONTENT
      ) {
        UnassignJob(job.id, creep.name, job.roomName);
        AssignNewJobForCreep(
          creep,
          creepMem.type === "work" || creepMem.type === "pioneer"
            ? ["withdraw", "harvest"]
            : ["withdraw"]
        );
      } else {
        creepMem.secondJobId = job.id;
        UpdateCreepMemory(creep.name, creepMem);
      }
      break;
    case ERR_NOT_IN_RANGE:
      ExecuteMove(creep, job);
      break;
    case ERR_INVALID_TARGET:
      DeleteJobById(job.id, job.roomName);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
