import {
  getOffsetRectOfElement,
  get2dTransformMatrixOfElement,
  get3dTransformMatrixOfElement,
  convertMatrixToString,
  getElementStyle,
} from "./utils/css-utils";
import { WatAnimParams } from "./wat-anim-params";

export { WatAnimParams } from "./wat-anim-params";

/** todo: write tests */

/**
 * stash: you can use the stash however you want, or just ignore it
 *
 * the stash can be a very useful mechanism to store additional
 * params/characteristics for each waypoint for when it's time
 * to send a traveler there. e.g. you could store a hex color code
 * as a Waypoint<string>'s stash. Or you could make the stash an object
 * that contains multiple custom params or data
 *
 * sendToWpResultsLogger: this makes logging easy once travelers start
 * flying around everywhere
 *
 * a basic logger can be obtained from makeSimpleSendToWpResultsLogger(isEnabled),
 * or you can make a custom one that adds info from your stash or whatever you want
 *
 * note: using elements other than divs is untested and may lead to undefined behavior
 */
export type Waypoint<Type = any> = {
  name: string;
  element?: HTMLElement;
  stash?: Type;
  sendToWpResultsLogger?: SendToWpResultsLogger<Waypoint<Type>>;
};

/**
 * returns all animation parameters needed to move and resize a traveler div to
 * match the destination waypoint's div
 *
 * bug: cannot use intermediate transforms between wayfinder and waypoint yet.
 * will be killer when fixed
 */
export function sendToWaypointAnimParams(destWp: Waypoint, wayfinder: HTMLElement): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let params = {
    ...resizeToWaypointAnimParams(destWp, wayfinder),
    ...transformToWaypointAnimParams(destWp, wayfinder),
  };

  if (destWp.sendToWpResultsLogger) {
    destWp.sendToWpResultsLogger(makeSendToWpResultsLogData(destWp, wayfinder, params));
  }

  return params;
}

/** expensive animation, but that's the user's choice */
export function resizeToWaypointAnimParams(destWp: Waypoint, _wayfinder: HTMLElement): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let wpOffsetRect = getOffsetRectOfElement(destWp.element);
  return { width: wpOffsetRect.width, height: wpOffsetRect.height };
}

/**
 * this implementation will eventually be rewritten to allow intermediate transforms
 * which will be killer. Interface will still be the same, so it won't break anything.
 * (That's why the wayfinder element is required but not used.)
 */
export function transformToWaypointAnimParams(
  destWp: Waypoint,
  _wayfinder: HTMLElement,
  enable3dTransforms = true
): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let matrix = enable3dTransforms
    ? get3dTransformMatrixOfElement(destWp.element)
    : get2dTransformMatrixOfElement(destWp.element);

  // bake the waypoint's top and left into the transform to allow for additional
  // translate animations by the user
  let wpOffsetRect = getOffsetRectOfElement(destWp.element);
  let xTranslateIndex = enable3dTransforms ? 12 : 4; // hardcoded 3d and 2d matrix indices
  let yTranslateIndex = enable3dTransforms ? 13 : 5;
  matrix[xTranslateIndex] = (parseFloat(matrix[xTranslateIndex]) + wpOffsetRect.left).toString();
  matrix[yTranslateIndex] = (parseFloat(matrix[yTranslateIndex]) + wpOffsetRect.top).toString();

  let matrixString = convertMatrixToString(matrix);

  if (enable3dTransforms) {
    return { matrix3d: matrixString };
  }
  return { matrix: matrixString };
}

/** logging */

/** waypointFullStyle might be broken at the moment */
export class SendToWpResultsLogData<WaypointType> {
  waypointName: string = "";
  waypoint!: WaypointType;
  waypointFullStyle!: CSSStyleDeclaration;
  wayfinderElement!: HTMLElement;
  animParamResults!: WatAnimParams;
}

export type SendToWpResultsLogger<WaypointType> = (resultsLogData: SendToWpResultsLogData<WaypointType>) => void;

/** quick and easy option */
export function makeSimpleSendToWpResultsLogger(enabled: boolean): SendToWpResultsLogger<Waypoint> {
  return (sendResults: SendToWpResultsLogData<Waypoint>) => {
    if (enabled) console.log(sendResults);
  };
}

function makeSendToWpResultsLogData(
  destWp: Waypoint,
  wayfinder: HTMLElement,
  animParamResults: WatAnimParams
): SendToWpResultsLogData<Waypoint> {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  return {
    waypointName: destWp.name,
    waypoint: destWp,
    waypointFullStyle: getElementStyle(destWp.element),
    wayfinderElement: wayfinder,
    animParamResults,
  };
}
