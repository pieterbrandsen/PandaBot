import { isUndefined } from "lodash";
import { UpdateJobById } from "../room/jobs";
import { GetAccesSpotsAroundPosition } from "../room/reading";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { ExecuteContainer } from "./types/container";
import { ExecuteController } from "./types/controller";
import { ExecuteExtension } from "./types/extension";
import { ExecuteFactory } from "./types/factory";
import { ExecuteLab } from "./types/lab";
import { ExecuteLink } from "./types/link";
import { ExecuteNuker } from "./types/nuker";
import { ExecuteObserver } from "./types/observer";
import { ExecuteSpawn } from "./types/spawn";
import { ExecuteStorage } from "./types/storage";
import { ExecuteTerminal } from "./types/terminal";
import { ExecuteTower } from "./types/tower";

export const GetObject = FuncWrapper(function GetObject(
  id: Id<Structure | Creep | ConstructionSite | Source>
): FunctionReturn {
  const obj:
    | Structure
    | Creep
    | ConstructionSite
    | Source
    | null = Game.getObjectById(id);
  if (obj === null) return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, obj);
});

export const UpdateStructureMemory = FuncWrapper(function UpdateStructureMemory(
  name: string,
  mem: StructureMemory
) {
  Memory.structures[name] = mem;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetStructureMemory = FuncWrapper(function GetStructureMemory(
  id: Id<Structure>
): FunctionReturn {
  const strMem: StructureMemory | undefined = Memory.structures[id];
  if (isUndefined(strMem))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, strMem);
});

export const GetAllStructureIds = FuncWrapper(function GetAllStructureIds(
  id: string
): FunctionReturn {
  const structureIds: string[] | undefined = Memory.cache.structures.data[id]
    ? Memory.cache.structures.data[id].map((c) => c.id)
    : undefined;
  if (isUndefined(structureIds))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, structureIds);
});

export const BuildStructure = FuncWrapper(function BuildStructure(
  room: Room,
  pos: RoomPosition,
  structureType: StructureConstant,
  hasPriority = false
): FunctionReturn {
  const createConstructionSite = room.createConstructionSite(
    pos,
    structureType
  );
  if (createConstructionSite !== OK)
    return FunctionReturnHelper(
      FunctionReturnCodes.NOT_MODIFIED,
      createConstructionSite
    );

  const jobId: Id<Job> = `build-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
  const openSpots: number = GetAccesSpotsAroundPosition(room, pos, 2).response;
  const structureCost = CONSTRUCTION_COST[structureType];
  const job: Job = {
    id: jobId,
    action: "build",
    updateJobAtTick: Game.time + 1,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: room.name,
    objId: "undefined" as Id<ConstructionSite>,
    hasPriority,
    position: { x: pos.x, y: pos.y },
    energyRequired: structureCost,
  };
  UpdateJobById(jobId, job, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteStructure = FuncWrapper(function ExecuteStructure(
  str: Structure
): FunctionReturn {
  switch (str.structureType) {
    case STRUCTURE_CONTAINER:
      ExecuteContainer(str as StructureContainer);
      break;
    case STRUCTURE_CONTROLLER:
      ExecuteController(str as StructureController);
      break;
    case STRUCTURE_EXTENSION:
      ExecuteExtension(str as StructureExtension);
      break;
    case STRUCTURE_FACTORY:
      ExecuteFactory(str as StructureFactory);
      break;
    case STRUCTURE_LAB:
      ExecuteLab(str as StructureLab);
      break;
    case STRUCTURE_LINK:
      ExecuteLink(str as StructureLink);
      break;
    case STRUCTURE_NUKER:
      ExecuteNuker(str as StructureNuker);
      break;
    case STRUCTURE_OBSERVER:
      ExecuteObserver(str as StructureObserver);
      break;
    case STRUCTURE_SPAWN:
      ExecuteSpawn(str as StructureSpawn);
      break;
    case STRUCTURE_STORAGE:
      ExecuteStorage(str as StructureStorage);
      break;
    case STRUCTURE_TERMINAL:
      ExecuteTerminal(str as StructureTerminal);
      break;
    case STRUCTURE_TOWER:
      ExecuteTower(str as StructureTower);
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
