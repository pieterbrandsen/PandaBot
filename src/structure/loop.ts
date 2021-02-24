import { forEach } from "lodash";
import { GetAllStructureNames, GetStructure } from "./helper";
import { IsStructureMemoryInitialized } from "../memory/initialization";
import { StructureStatsPreProcessing } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const RunStructure = FuncWrapper(function RunStructure(
  id: string
): FunctionReturn {
  const getStructure = GetStructure(id);
  if (getStructure.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const structure = getStructure.response as Structure;

  StructureStatsPreProcessing(structure);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunStructures(
  id: string
): FunctionReturn {
  const getStructureNames = GetAllStructureNames(id);
  if (getStructureNames.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  forEach(getStructureNames.response, (key: string) => {
    const isStructureMemoryInitialized = IsStructureMemoryInitialized(key);
    if (isStructureMemoryInitialized.code === FunctionReturnCodes.OK)
      RunStructure(key);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
