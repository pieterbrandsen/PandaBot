import { DeleteJobById } from "../../room/jobs/handler";
import { GetObject } from "../../utils/helper";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { ExecuteMove } from "./move";
import { IsCreepDamaged } from "../helper";

// eslint-disable-next-line
export const ExecuteHeal = FuncWrapper(function ExecuteHeal(
  creep: Creep,
  job: Job
): FunctionReturn {
  const getObject = GetObject(job.objId);
  if (getObject.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(getObject.code);
  }
  const targetCreep: Creep = getObject.response as Creep;

  if (job.stopHealingAtMaxHits && !IsCreepDamaged(creep)) {
    DeleteJobById(job.id, job.roomName);
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  }

  switch (creep.heal(targetCreep)) {
    case OK:
      creep.say("heal");
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
