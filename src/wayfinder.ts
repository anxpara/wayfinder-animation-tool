import { mat4, vec3 } from "gl-matrix";
import {
  getOffsetRectOfElement,
  get3dTransformMatrixOfElement,
  getTransformOriginOfElement,
  convertMat4ToCssTransformString,
  isContainerOffsetRelevantToChildren,
} from "./utils/css-utils";
import { WatAnimParams } from "./wat-anim-params";

export { WatAnimParams } from "./wat-anim-params";

/**
 * stash: you can use the stash however you want, or just ignore it
 *
 * the stash can be a very useful mechanism to store additional
 * params/characteristics in each waypoint for when it's time
 * to send a traveler there
 *
 * loggingEnabled: enables a default logger that prints a SendResultsLogData
 * object on each call to sendToWaypointAnimParams
 *
 * customSendResultsLogger: if you want to replace the default logging,
 * then provide a callback
 *
 * ---
 *
 * note: using elements other than divs as waypoints is untested and could
 * possibly lead to undefined behavior
 */
export type Waypoint<StashType = any> = {
  name: string;
  element?: HTMLElement;
  stash?: StashType;
  loggingEnabled?: boolean;
  customSendResultsLogger?: SendResultsLogger<Waypoint<StashType>>;
};

/**
 * returns all animation parameters needed to resize, move, and transform a traveler to
 * match the waypoint
 */
export function sendToWaypointAnimParams(destWp: Waypoint, wayfinder: HTMLElement): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let params = {
    ...resizeToWaypointAnimParams(destWp, wayfinder),
    ...transformToWaypointAnimParams(destWp, wayfinder),
  };

  if (destWp.loggingEnabled) {
    logSendResults(destWp, wayfinder, params);
  }

  return params;
}

/**
 * animating width and height is expensive. prefer animating between same-sized waypoints,
 * or find the right instant to set the size once
 */
export function resizeToWaypointAnimParams(destWp: Waypoint, _wayfinder: HTMLElement): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let wpOffsetRect = getOffsetRectOfElement(destWp.element);
  return { width: wpOffsetRect.width + "px", height: wpOffsetRect.height + "px" };
}

/**
 * builds a transform matrix that projects the waypoint onto the wayfinder,
 * including all intermediate offsets and transforms between the wayfinder and the waypoint
 *
 * https://www.w3.org/TR/css-transforms-2/
 *
 * the following css properties are not supported on any elements between the wayfinder
 * and the waypoint, nor the waypoint itself:
 *   position: fixed;
 *   perspective: *;
 *   perspective-origin: *;
 */
export function transformToWaypointAnimParams(destWp: Waypoint, wayfinder: HTMLElement): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let elementsDownToWp = getElementsFromWayfinderToWaypoint(destWp, wayfinder);
  if (!elementsDownToWp) {
    throw new Error("Couldn't find the given wayfinder div within any of the waypoint's ancestors.");
  }

  // builds the transform needed to project the waypoint onto the wayfinder
  let combinedTransform = mat4.create();
  mat4.identity(combinedTransform);

  // track parent offsets in case they must be removed from the element's offsets
  let parentOffsetRect: DOMRect = new DOMRect(0, 0, 0, 0);

  elementsDownToWp.forEach((el) => {
    // get element's transform
    let currentTransform = get3dTransformMatrixOfElement(el);

    // apply the element's transform-origin
    let transformOrigin = getTransformOriginOfElement(el);
    let originMatrix = mat4.create();
    mat4.fromTranslation(originMatrix, transformOrigin);
    mat4.multiply(currentTransform, originMatrix, currentTransform);

    // factor in overall offset from parent
    let offsetRect = getOffsetRectOfElement(el);
    let overallOffset = vec3.fromValues(
      offsetRect.left - parentOffsetRect.left - el.scrollLeft,
      offsetRect.top - parentOffsetRect.top - el.scrollTop,
      0
    );
    let offsetMatrix = mat4.create();
    mat4.fromTranslation(offsetMatrix, overallOffset);
    mat4.multiply(currentTransform, offsetMatrix, currentTransform);

    // multiply the combined transform with the current transform
    mat4.multiply(combinedTransform, combinedTransform, currentTransform);

    // remove the transform-origin
    mat4.invert(originMatrix, originMatrix);
    mat4.multiply(combinedTransform, combinedTransform, originMatrix);

    if (isContainerOffsetRelevantToChildren(el)) {
      parentOffsetRect = offsetRect;
    } else {
      parentOffsetRect = new DOMRect(0, 0, 0, 0);
    }
  });

  return { matrix3d: convertMat4ToCssTransformString(combinedTransform) };
}

function getElementsFromWayfinderToWaypoint(waypoint: Waypoint, wayfinder: HTMLElement): HTMLElement[] {
  let wayfinderParent = wayfinder.parentElement;
  let currentParent = waypoint.element!.parentElement;
  let elementList: HTMLElement[] = [waypoint.element!];

  while (currentParent && !currentParent.isSameNode(wayfinderParent)) {
    elementList.push(currentParent);
    currentParent = currentParent!.parentElement;
  }
  if (currentParent != wayfinderParent) {
    return [];
  }

  elementList.reverse();
  return elementList;
}

/** logging */

export class SendResultsLogData<StashType = any> {
  waypointName!: string;
  waypoint!: Waypoint<StashType>;
  waypointComputedStyle!: CSSStyleDeclaration;
  wayfinderElement!: HTMLElement;
  animParamResults!: WatAnimParams;
}

export type SendResultsLogger<StashType = any> = (resultsLogData: SendResultsLogData<StashType>) => void;

function logSendResults(destWp: Waypoint, wayfinder: HTMLElement, animParamResults: WatAnimParams): void {
  const resultsLogData = makeSendResultsLogData(destWp, wayfinder, animParamResults);
  if (destWp.customSendResultsLogger) {
    destWp.customSendResultsLogger(resultsLogData);
  } else {
    console.log(resultsLogData);
  }
}

function makeSendResultsLogData(
  destWp: Waypoint,
  wayfinder: HTMLElement,
  animParamResults: WatAnimParams
): SendResultsLogData<Waypoint> {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  return {
    waypointName: destWp.name,
    waypoint: destWp,
    waypointComputedStyle: window.getComputedStyle(destWp.element),
    wayfinderElement: wayfinder,
    animParamResults,
  };
}
