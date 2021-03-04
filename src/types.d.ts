interface StringMap<T> {
  [key: string]: T;
}

interface LogType {
  code: number;
  value: {
    name: string;
    color: string;
  };
}

interface Room {
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Function;
}

interface Structure {
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Function;
}

interface Creep {
  // eslint-disable-next-line @typescript-eslint/ban-types
  command: Function;
}

interface FunctionReturn {
  code: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: any;
}

interface RoomStats {
  creepCount: number;
  structureCount: number;
  rcl: GlobalControlLevel;
}

interface StatsMemory {
  intentCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  funcCalls: StringMap<{ callCount: number; cpuUsed: number }>;
  ticksStatsCollecting: number;
  gcl: GlobalControlLevel;
  rooms: StringMap<RoomStats>;
}

type JobActionTypes =
  | "move"
  | "transfer"
  | "withdraw"
  | "harvest"
  | "build"
  | "repair"
  | "dismantle"
  | "upgrade"
  | "attack"
  | "claim"
  | "heal";

interface Job {
  id: Id<Job>;
  action: JobActionTypes;
  updateJobAtTick: number;

  assignedCreepsIds: string[];
  maxCreeps: number;
  assignedStructuresIds: string[];
  maxStructures: number;

  roomName: string;
  objId: Id<Structure | ConstructionSite | Creep>;

  hasPriority: boolean;
  position?: { x: number; y: number };
  energyRequired?: number;
  stopHealingAtMaxHits?: boolean;
  linkedJobId?: string;
  expireAtTick?: number;
}

type CreepTypes =
  | "pioneer"
  | "work"
  | "move"
  | "transferring"
  | "heal"
  | "attack"
  | "claim"
  | "none";

interface RoomMemory {
  isNotSeenSince?: number;
  spawnQueue: CreepTypes[];
  jobs: Job[];
}

interface CreepMemory {
  isNotSeenSince?: number;
  type: CreepTypes;
  jobId?: string;
  commandRoom: string;
}

interface StructureMemory {
  isNotSeenSince?: number;
  room: string;
}

interface StructureCache {
  structureType: StructureConstant;
  id: string;
}

interface CreepCache {
  id: string;
}

interface Cache {
  rooms: {
    nextCheckTick: number;
    data: string[];
  };
  structures: {
    nextCheckTick: number;
    data: StringMap<StructureCache[]>;
  };
  creeps: {
    nextCheckTick: number;
    data: StringMap<CreepCache[]>;
  };
}

interface Memory {
  structures: StringMap<StructureMemory>;
  stats: StatsMemory;
  cache: Cache;
}

declare namespace NodeJS {
  interface Global {
    preProcessingStats: StatsMemory;

    help(): string;

    resetGlobalMemory(): number;
    resetRoomMemory(roomName: string): number;
    resetStructureMemory(id: string, roomName: string): number;
    resetCreepMemory(creepName: string, roomName: string): number;

    deleteRoomMemory(roomName: string): number;
    deleteStructureMemory(id: string, roomName: string): number;
    deleteCreepMemory(creepName: string, roomName: string): number;
  }
}
