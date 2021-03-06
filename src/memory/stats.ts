import { groupBy, union } from "lodash";
import {
  AverageValueOverAmountTicks,
  FunctionReturnCodes,
  StatsDigitCount,
} from "../utils/constants/global";
import { ShouldUpdateStats } from "../utils/config/global";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { GetRoomMemoryUsingName } from "../room/helper";

export const ResetPreProcessingStats = FuncWrapper(
  function ResetPreProcessingStats(): FunctionReturn {
    global.preProcessingStats = {
      intentCalls: {},
      funcCalls: {},
      rooms: {},
      ticksStatsCollecting: 0,
      gcl: Game.gcl,
      cpu: { bucket: {}, usage: {} },
    };
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const ResetStats = FuncWrapper(function ResetStats(): FunctionReturn {
  Memory.stats = {
    intentCalls: {},
    funcCalls: {},
    rooms: {},
    ticksStatsCollecting: 0,
    gcl: { progress: 0, progressTotal: 0, level: 0 },
    cpu: { bucket: {}, usage: {} },
  };

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ResetPreProcessingRoomStats = FuncWrapper(
  function ResetPreProcessingRoomStats(id: string): FunctionReturn {
    global.preProcessingStats.rooms[id] = {
      creepCount: 0,
      structureCount: 0,
      rcl: { progress: 0, progressTotal: 0, level: 0 },
      energyExpenses: { build: 0, repair: 0, upgrade: 0, spawn: {} },
      energyIncome: { dismantle: 0, harvest: 0 },
      activeJobs: {},
      creepCountPerJob: {},
      energyInStorages: {
        containers: 0,
        storage: 0,
        terminal: 0,
      },
    };

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const ResetRoomStats = FuncWrapper(function ResetRoomStats(
  id: string
): FunctionReturn {
  Memory.stats.rooms[id] = {
    creepCount: 0,
    structureCount: 0,
    rcl: { progress: 0, progressTotal: 0, level: 0 },
    energyExpenses: { build: 0, repair: 0, upgrade: 0, spawn: {} },
    energyIncome: { dismantle: 0, harvest: 0 },
    activeJobs: {},
    creepCountPerJob: {},
    energyInStorages: {
      containers: 0,
      storage: 0,
      terminal: 0,
    },
  };

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetAveragedValue = FuncWrapper(function GetAveragedValue(
  current = 0,
  num = 0
): FunctionReturn {
  const currentPercentage = (1 / AverageValueOverAmountTicks) * -1 + 1;
  const numPercentage = 1 / AverageValueOverAmountTicks;
  const newValue = parseFloat(
    (current * currentPercentage + num * numPercentage).toFixed(StatsDigitCount)
  );

  return FunctionReturnHelper<number>(FunctionReturnCodes.OK, newValue);
});

export const RoomStatsPreProcessing = FuncWrapper(
  function RoomStatsPreProcessing(room: Room): FunctionReturn {
    if (!ShouldUpdateStats())
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    ResetPreProcessingRoomStats(room.name);

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const RoomStats = FuncWrapper(function RoomStats(
  room: Room
): FunctionReturn {
  if (!ShouldUpdateStats())
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  let preProcessingRoomStats = global.preProcessingStats.rooms[room.name];
  const roomMem: RoomMemory = GetRoomMemoryUsingName(room.name).response;
  let roomStats: RoomStats = Memory.stats.rooms[room.name];

  if (preProcessingRoomStats === undefined) {
    ResetPreProcessingRoomStats(room.name);
    preProcessingRoomStats = global.preProcessingStats.rooms[room.name];
  }

  if (roomStats === undefined) {
    ResetRoomStats(room.name);
    roomStats = Memory.stats.rooms[room.name];
  }

  const creepCount = GetAveragedValue(
    roomStats.creepCount,
    preProcessingRoomStats.creepCount
  );
  const structureCount = GetAveragedValue(
    roomStats.structureCount,
    preProcessingRoomStats.structureCount
  );

  Memory.stats.rooms[room.name] = {
    creepCount: creepCount.response,
    structureCount: structureCount.response,
    rcl: room.controller
      ? {
          progress: room.controller.progress,
          progressTotal: room.controller.progressTotal,
          level: room.controller.level,
        }
      : { progress: 0, progressTotal: 0, level: 0 },
    energyExpenses: {
      build: GetAveragedValue(
        roomStats.energyExpenses.build,
        preProcessingRoomStats.energyExpenses.build
      ).response,
      repair: GetAveragedValue(
        roomStats.energyExpenses.repair,
        preProcessingRoomStats.energyExpenses.repair
      ).response,
      upgrade: GetAveragedValue(
        roomStats.energyExpenses.upgrade,
        preProcessingRoomStats.energyExpenses.upgrade
      ).response,
      spawn: {},
    },
    energyIncome: {
      dismantle: GetAveragedValue(
        roomStats.energyIncome.dismantle,
        preProcessingRoomStats.energyIncome.dismantle
      ).response,
      harvest: GetAveragedValue(
        roomStats.energyIncome.harvest,
        preProcessingRoomStats.energyIncome.harvest
      ).response,
    },
    activeJobs: {},
    creepCountPerJob: {},
    energyInStorages: {
      containers: GetAveragedValue(
        roomStats.energyInStorages.containers,
        preProcessingRoomStats.energyInStorages.containers
      ).response,
      storage: GetAveragedValue(
        roomStats.energyInStorages.storage,
        preProcessingRoomStats.energyInStorages.storage
      ).response,
      terminal: GetAveragedValue(
        roomStats.energyInStorages.terminal,
        preProcessingRoomStats.energyInStorages.terminal
      ).response,
    },
  };

  const activeJobsCount: StringMap<number> = {};
  const creepCountPerJobCount: StringMap<number> = {};
  const currentJobs = groupBy(roomMem.jobs, (j: Job) => j.action);
  union(Object.keys(roomStats.activeJobs), Object.keys(currentJobs)).forEach(
    (name: string) => {
      activeJobsCount[name] = GetAveragedValue(
        roomStats.activeJobs[name] ? roomStats.activeJobs[name] : 0,
        currentJobs[name] ? currentJobs[name].length : 0
      ).response;

      const roomCreepCount: number = currentJobs[name]
        ? currentJobs[name].reduce<number>((acc, job) => {
            // eslint-disable-next-line no-param-reassign
            acc += job.assignedCreepsNames.length;
            return acc;
          }, 0)
        : 0;
      creepCountPerJobCount[name] = GetAveragedValue(
        roomStats.creepCountPerJob[name] ? roomStats.creepCountPerJob[name] : 0,
        roomCreepCount
      ).response;
    }
  );
  Memory.stats.rooms[room.name].activeJobs = activeJobsCount;
  Memory.stats.rooms[room.name].creepCountPerJob = creepCountPerJobCount;

  const spawnCosts: StringMap<number> = {};
  union(
    Object.keys(roomStats.energyExpenses.spawn),
    Object.keys(preProcessingRoomStats.energyExpenses.spawn)
  ).forEach((name: string) => {
    const currentCallCount =
      roomStats.energyExpenses.spawn[name] !== undefined
        ? roomStats.energyExpenses.spawn[name]
        : 0;
    const newCallCount =
      preProcessingRoomStats.energyExpenses.spawn[name] !== undefined
        ? preProcessingRoomStats.energyExpenses.spawn[name]
        : 0;

    spawnCosts[name] = GetAveragedValue(
      currentCallCount,
      newCallCount
    ).response;
  });

  Memory.stats.rooms[room.name].energyExpenses.spawn = spawnCosts;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const StructureStatsPreProcessing = FuncWrapper(
  function StructureStatsPreProcessing(structure: Structure): FunctionReturn {
    if (!ShouldUpdateStats())
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    const roomStats = global.preProcessingStats.rooms[structure.room.name];
    roomStats.structureCount += 1;

    switch (structure.structureType) {
      case STRUCTURE_STORAGE:
        roomStats.energyInStorages.storage = (structure as StructureStorage).store.energy;
        break;
      case STRUCTURE_TERMINAL:
        roomStats.energyInStorages.terminal = (structure as StructureTerminal).store.energy;
        break;
      case STRUCTURE_CONTAINER:
        if (roomStats.energyInStorages.containers > 0)
          roomStats.energyInStorages.containers += (structure as StructureContainer).store.energy;
        else
          roomStats.energyInStorages.containers = (structure as StructureContainer).store.energy;
        break;
      default:
        break;
    }

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const CreepStatsPreProcessing = FuncWrapper(
  function CreepStatsPreProcessing(creep: Creep): FunctionReturn {
    if (!ShouldUpdateStats())
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    const roomStats = global.preProcessingStats.rooms[creep.room.name];
    roomStats.creepCount += 1;

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GlobalStatsPreProcessing = FuncWrapper(
  function GlobalStatsPreProcessing(): FunctionReturn {
    if (!ShouldUpdateStats())
      return FunctionReturnHelper(
        FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      );

    ResetPreProcessingStats();

    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const GlobalStats = FuncWrapper(function GlobalStats(): FunctionReturn {
  if (!ShouldUpdateStats())
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  Memory.stats.ticksStatsCollecting += 1;
  Memory.stats.gcl = Game.gcl;

  const cpuStats = Memory.stats.cpu;
  cpuStats.bucket[Game.shard.name] = GetAveragedValue(
    cpuStats.bucket[Game.shard.name],
    Game.cpu.bucket
  ).response;
  cpuStats.usage[Game.shard.name] = GetAveragedValue(
    cpuStats.usage[Game.shard.name],
    Game.cpu.getUsed()
  ).response;

  const { preProcessingStats } = global;
  const averagedIntentCallsList: StringMap<{
    callCount: number;
    cpuUsed: number;
  }> = {};

  union(
    Object.keys(Memory.stats.intentCalls),
    Object.keys(preProcessingStats.intentCalls)
  ).forEach((name: string) => {
    const currentCallCount =
      Memory.stats.intentCalls[name] !== undefined
        ? Memory.stats.intentCalls[name].callCount
        : 0;
    const newCallCount =
      preProcessingStats.intentCalls[name] !== undefined
        ? preProcessingStats.intentCalls[name].callCount
        : 0;
    const currentCpuUsed =
      Memory.stats.intentCalls[name] !== undefined
        ? Memory.stats.intentCalls[name].cpuUsed
        : 0;
    const newCpuUsed =
      preProcessingStats.intentCalls[name] !== undefined
        ? preProcessingStats.intentCalls[name].cpuUsed
        : 0;

    const callCount = GetAveragedValue(currentCallCount, newCallCount);
    const cpuUsed = GetAveragedValue(currentCpuUsed, newCpuUsed);
    averagedIntentCallsList[name] = {
      callCount: callCount.response,
      cpuUsed: cpuUsed.response,
    };
  });

  Memory.stats.intentCalls = averagedIntentCallsList;

  const averagedFuncCallsList: StringMap<{
    callCount: number;
    cpuUsed: number;
  }> = {};

  union(
    Object.keys(Memory.stats.funcCalls),
    Object.keys(preProcessingStats.funcCalls)
  ).forEach((name: string) => {
    const currentCallCount =
      Memory.stats.funcCalls[name] !== undefined
        ? Memory.stats.funcCalls[name].callCount
        : 0;
    const newCallCount =
      preProcessingStats.funcCalls[name] !== undefined
        ? preProcessingStats.funcCalls[name].callCount
        : 0;
    const currentCpuUsed =
      Memory.stats.funcCalls[name] !== undefined
        ? Memory.stats.funcCalls[name].cpuUsed
        : 0;
    const newCpuUsed =
      preProcessingStats.funcCalls[name] !== undefined
        ? preProcessingStats.funcCalls[name].cpuUsed
        : 0;

    const callCount = GetAveragedValue(currentCallCount, newCallCount);
    const cpuUsed = GetAveragedValue(currentCpuUsed, newCpuUsed);
    averagedFuncCallsList[name] = {
      callCount: callCount.response,
      cpuUsed: cpuUsed.response,
    };
  });
  Memory.stats.funcCalls = averagedFuncCallsList;

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
