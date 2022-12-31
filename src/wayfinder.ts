import { copyWpSize } from "./projection/copyWpSize";
import { computeTransformFromWpToWayfinder } from "./projection/computeTransformFromWpToWayfinder";
import { copyComputedCssFromWp } from "./projection/copyComputedCssFromWp";
import { logWatResults, WatResultsLogger } from "./logging/logging";

export { copyWpSize } from "./projection/copyWpSize";
export { computeTransformFromWpToWayfinder } from "./projection/computeTransformFromWpToWayfinder";
export { copyComputedCssFromWp } from "./projection/copyComputedCssFromWp";
export { WatResultsLogger, WatResultsLogData } from "./logging/logging";

/**
 * WatParams are the parameters needed to set or animate a traveler in
 * a wayfinder element to match a waypoint. WatParams can be thought of as
 * the projection of a waypoint onto the wayfinder
 *
 * WatParams are acquired via projectWpToWayfinder()--the primary interface of
 * Wayfinder Animation Tool--and can be used with any JS/TS animation library
 *
 * any computed css properties requested via projectWpToWayfinder's optional
 * computedCssPropsToCopy arg are also included. if computedCssPropsToCopy
 * contains 'transform', then the matrix3d param is returned via the transform
 * property instead
 *
 * for details on computed style, see
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 *
 * ---
 *
 * if using AnimeJs, integration is as simple as using the spread operator:
 *
 *   anime({
 *     targets: '#travelerId',
 *     ...projectWpToWayfinder(waypoint, wayfinderElement)
 *   });
 *
 * ---
 *
 * if using Motion One, request matrix3d be returned via the transform property:
 *
 *   animate('#travelerId', {
 *       ...projectWpToWayfinder(waypoint, wayfinderElement, ['transform'])
 *   });
 */
export type WatParams = {
  fontSize?: string;
  width?: string;
  height?: string;
  matrix3d?: string;
  [AnyComputedCssPropertyCopied: string]: any;
};

/**
 * a Waypoint represents any element you intend to send travelers to
 *
 * stash: the stash is yours to put whatever you want in it, or to ignore.
 * can be a useful mechanism for storing additional params/characteristics
 * in each waypoint for when it's time to send a traveler there. if working in
 * typescript, the default stash type is 'unknown', which means a type must be
 * provided to use it (e.g. Waypoint<MyStashType>)
 *
 * enableLogging: enables a default logger that prints a WatResultsLogData
 * object each time projectWpToWayfinder is called
 *
 * customLogger: if you want to replace the default logger, then provide a
 * callback that takes the WatResultsLogData
 */
export type Waypoint<StashType = unknown> = {
  name: string;
  element?: HTMLElement;
  stash?: StashType;
  enableLogging?: boolean;
  customLogger?: WatResultsLogger;
};

/**
 * returns all parameters needed to resize and transform a traveler in the given
 * wayfinder to the waypoint. copies any desired computed css properties
 *
 * this is the primary interface of Wayfinder Animation Tool
 *
 * note: copyWpSize, computeTransformFromWpToWayfinder, and copyComputedCssFromWp
 * are exported for cases where you're certain you need to optimize by skipping
 * the computation of particular params. prefer projectWpToWayfinder
 *
 * note: if computedCssPropsToCopy includes "transform", then the matrix3d param
 * is returned via the transform property instead (useful for Motion One integration)
 */
export function projectWpToWayfinder(
  wp: Waypoint,
  wayfinder: HTMLElement,
  computedCssPropsToCopy: string[] = []
): WatParams {
  if (!wp.element) {
    throw new Error(`Waypoint ${wp.name} has no element.`);
  }

  const params = {
    ...copyWpSize(wp, wayfinder, computedCssPropsToCopy),
    ...computeTransformFromWpToWayfinder(wp, wayfinder, computedCssPropsToCopy),
    ...copyComputedCssFromWp(wp, wayfinder, computedCssPropsToCopy),
  };

  if (wp.enableLogging) {
    logWatResults(wp, wayfinder, computedCssPropsToCopy, params);
  }

  return params;
}
