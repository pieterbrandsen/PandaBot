import { isUndefined } from 'lodash';
import { Log } from "./logger";
import { LogTypes } from "./constants/global";

/**
 * @param func
 * @returns {F} Function
 */
// eslint-disable-next-line
export const FuncWrapper = function FuncWrapper<F extends (...a: any[]) => any>(
  func: F
): F {
  return ((...args: Parameters<F>) => {
    const preProcessingCpu = Game.cpu.getUsed();
    let statsPath = { callCount: 0, cpuUsed: 0 };

    if (global.preProcessingStats) {
      statsPath = global.preProcessingStats.funcCalls[func.name];
      if (isUndefined(statsPath)) {
        global.preProcessingStats.funcCalls[func.name] = {
          callCount: 0,
          cpuUsed: 0,
        };
        statsPath = global.preProcessingStats.funcCalls[func.name];
      }
    }

    try {
      return func(...args);
    } catch (error) {
      Log(LogTypes.Error, func.name, error, {
        ...args,
      });
      return { code: 500 };
    } finally {
      statsPath.callCount += 1;
      statsPath.cpuUsed += Game.cpu.getUsed() - preProcessingCpu;
    }
  }) as F;
};

/**
 * @param functions
 */
export const WrapFunctions = FuncWrapper(function WrapFunctions<
  // eslint-disable-next-line
  T extends { [funcName: string]: (...a: any[]) => any }
>(functions: T): T {
  return Object.entries(functions)
    .map(([funcName, func]) => ({ [funcName]: FuncWrapper(func) }))
    .reduce((acc, entry) => Object.assign(acc, entry), {}) as T;
});

/**
 * @param func
 * @param methodType
 * @param inputFuncName
 * @param this
 * @param protoObj
 * @param funcName
 * @param baseFunc
 */
// eslint-disable-next-line
export function IntentWrapper<F extends (...a: any[]) => any>(
  // eslint-disable-next-line
this: any,
  protoObj: Room | Structure | Creep,
  funcName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  baseFunc: Function
): void {
  // eslint-disable-next-line
  ((protoObj as unknown) as StringMap<Function>)[funcName] = function func(
    ...args: Parameters<F>
  ) {
    const preProcessingCpu = Game.cpu.getUsed();
    let statsPath = global.preProcessingStats.intentCalls[funcName];
    if (isUndefined(statsPath)) {
      global.preProcessingStats.intentCalls[funcName] = {
        callCount: 0,
        cpuUsed: 0,
      };
      statsPath = global.preProcessingStats.intentCalls[funcName];
    }

    const ret = baseFunc.call(this, ...args);

    statsPath.callCount += 1;
    statsPath.cpuUsed += Game.cpu.getUsed() - preProcessingCpu;

    return ret;
  };
}
