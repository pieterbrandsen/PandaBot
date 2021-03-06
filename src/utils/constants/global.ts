/**
 * New stats get divided by this number to calculate their cut in the current value of the stat.
 */
export const AverageValueOverAmountTicks = 2500;

/**
 * Current username in game.
 */
export const Username = "PandaMaster";

/**
 * List of possible log levels.
 */
export const LogTypes: StringMap<LogType> = {
  None: { code: 0, value: { name: "None", color: "None" } },
  Error: { code: 10, value: { name: "Error", color: "Crimson" } },
  Warn: { code: 250, value: { name: "Warn", color: "GoldenRod" } },
  Info: { code: 500, value: { name: "Info", color: "FloralWhite" } },
  Debug: { code: 750, value: { name: "Debug", color: "DodgerBlue" } },
  All: { code: 999, value: { name: "All", color: "None" } },
};

/**
 * List of custom http response codes.
 */
export const FunctionReturnCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  TARGET_IS_ON_DELAY_OR_OFF: 203,
  NO_CONTENT: 204,
  NOT_MODIFIED: 205,
  NOT_MY_ROOM: 206,
  NOT_FITTING: 207,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  LOOP_DETECTED: 508,
};

/**
 * List of objects describing how much ticks are between each update check.
 */
export const CacheNextCheckIncrement = {
  rooms: 50,
  structures: 50,
  creeps: 50,
  jobs: 50,
};

/**
 * Amount of ticks before an not found/visible object is deleted.
 */
export const SaveUnloadedObjectForAmountTicks = 500;

/**
 * Amount of decimals should be used when averaging stats.
 */
export const StatsDigitCount =
  5 + AverageValueOverAmountTicks.toString().length;
