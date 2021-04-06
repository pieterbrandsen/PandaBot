import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import {
  TryToCreateTransferJob,
  TryToCreateRepairJob,
  TryToCreateWithdrawJob,
} from "./helper";
import { ControllerEnergyStructureRange } from "../../utils/constants/structure";
import { GetSourcesInRange } from "../../room/reading";

// eslint-disable-next-line
export const ExecuteLink = FuncWrapper(function ExecuteLink(
  str: StructureLink
): FunctionReturn {
  TryToCreateRepairJob(str);

  const sources: Source[] = GetSourcesInRange(str.pos, 2, str.room).response;
  if (
    str.room.controller &&
    str.pos.inRangeTo(str.room.controller, ControllerEnergyStructureRange)
  ) {
    TryToCreateWithdrawJob(str, 0, RESOURCE_ENERGY, "withdrawController");
  } else if (sources.length > 0) {
    TryToCreateWithdrawJob(str, 0);
    TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, false, "transferSource");
  } else {
    TryToCreateWithdrawJob(str, 100);
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});