import { mat4, vec3 } from "gl-matrix";
import {
  getOffsetRectOfElement,
  getOffsetFromDirectParent,
  getCenterOfElement,
  getTransformOriginOfElement,
  get3dTransformMatrixOfElement,
  convertMat4ToCssTransformString,
} from "./css-utils";

/**
 * WatAnimParams is a subset of AnimeJs' AnimeParams, which means integration with
 * AnimeJs is as simple as using the object spread operator:
 *
 *  anime({
 *    targets: '#traveler',
 *    ...sendToWaypointAnimParams(waypoint, wayfinderElement)
 *  });
 *
 * however, none of these parameters are unique to AnimeJs, and would still be useful
 * with other animation libraries, albeit some extra integration work may be needed
 *
 * --
 *
 * wayfinder bakes all translations and relative positionings into the matrix3d param,
 * which means AnimeJs' translation/scale/etc. params are still available for relative effects
 */
export type WatAnimParams = {
  fontSize?: string;
  width?: string;
  height?: string;
  matrix3d?: string;
  [AnyCopiedCssProperty: string]: any;
};

/**
 * a Waypoint represents any element you want to send travelers to. to animate
 * something quick and dirty you can do...
 *
 *   sendToWaypointAnimParams({name: 'myWp', element: myWpElement}, wayfinderElement);
 *
 * stash: use the stash however you want, or just ignore it. can be a very useful
 * mechanism for storing additional params/characteristics in each waypoint for
 * when it's time to send a traveler there
 *
 * loggingEnabled: enables a default logger that prints a SendResultsLogData
 * object each time sendToWaypointAnimParams is called
 *
 * customSendResultsLogger: if you want to replace the default logging, then
 * provide a callback
 */
export type Waypoint<StashType = any> = {
  name: string;
  element?: HTMLElement;
  stash?: StashType;
  loggingEnabled?: boolean;
  customSendResultsLogger?: SendResultsLogger<Waypoint<StashType>>;
};

/**
 * returns all animation parameters needed to resize, move, and transform a traveler to the waypoint.
 * also copies any desired css properties
 */
export function sendToWaypointAnimParams(
  destWp: Waypoint,
  wayfinder: HTMLElement,
  cssPropertiesToCopy: string[] = []
): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let params = {
    ...resizeToWaypointAnimParams(destWp, wayfinder, cssPropertiesToCopy),
    ...transformToWaypointAnimParams(destWp, wayfinder),
    ...copyWaypointCssAnimParams(destWp, wayfinder, cssPropertiesToCopy),
  };

  if (destWp.loggingEnabled) {
    logSendResults(destWp, wayfinder, cssPropertiesToCopy, params);
  }

  return params;
}

/**
 * returns the font-size, width, and height params in em. if any border widths are being copied,
 * then the width and height will exclude those widths. if px values are desired, then parse all
 * values and multiply the width and height by the font-size
 *
 * note: by convention, travelers must match the destination waypoint's width and height in order to
 * preserve a center origin on the traveler. this convention might be removed eventually
 *
 * note: animating font-size, width, or height can be expensive. if you must animate between
 * different-sized waypoints, consider finding a good instant to set the dimensions once
 */
export function resizeToWaypointAnimParams(
  destWp: Waypoint,
  wayfinder: HTMLElement,
  cssPropertiesToCopy: string[]
): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let wpComputedStyle = window.getComputedStyle(destWp.element);
  let wfComputedStyle = window.getComputedStyle(wayfinder);

  // check which border widths will be copied
  let removeAll = cssPropertiesToCopy.includes("border") || cssPropertiesToCopy.includes("border-width");
  let removeLeft = false;
  let removeRight = false;
  let removeTop = false;
  let removeBottom = false;
  if (!removeAll) {
    removeLeft = cssPropertiesToCopy.includes("border-left") || cssPropertiesToCopy.includes("border-left-width");
    removeRight = cssPropertiesToCopy.includes("border-right") || cssPropertiesToCopy.includes("border-right-width");
    removeTop = cssPropertiesToCopy.includes("border-top") || cssPropertiesToCopy.includes("border-top-width");
    removeBottom = cssPropertiesToCopy.includes("border-bottom") || cssPropertiesToCopy.includes("border-bottom-width");
  }

  // calculate dimensions, excluding any border widths that will be copied
  let wpOffsetRect = getOffsetRectOfElement(destWp.element);
  let wpWidthPx = wpOffsetRect.width;
  let wpHeightPx = wpOffsetRect.height;
  if (removeAll || removeLeft) {
    wpWidthPx -= Number.parseFloat(wpComputedStyle.borderLeftWidth.split("p")[0]);
  }
  if (removeAll || removeRight) {
    wpWidthPx -= Number.parseFloat(wpComputedStyle.borderRightWidth.split("p")[0]);
  }
  if (removeAll || removeTop) {
    wpHeightPx -= Number.parseFloat(wpComputedStyle.borderTopWidth.split("p")[0]);
  }
  if (removeAll || removeBottom) {
    wpHeightPx -= Number.parseFloat(wpComputedStyle.borderBottomWidth.split("p")[0]);
  }

  let wpFontSizePx = Number.parseFloat(wpComputedStyle.fontSize.split("p")[0]);
  let wfFontSizePx = Number.parseFloat(wfComputedStyle.fontSize.split("p")[0]);

  // bake in the difference in font-size between the waypoint and wayfinder
  let fontSize = wpFontSizePx / wfFontSizePx + "em";

  // calculate dimensions in em. the traveler's font-size is now analogous to the
  // waypoint's font-size, so no special conversion is needed
  let width = wpWidthPx / wpFontSizePx + "em";
  let height = wpHeightPx / wpFontSizePx + "em";

  return { fontSize, width, height };
}

/**
 * builds a transform matrix that projects the waypoint onto the wayfinder
 *  -supports 'transform-style: preserve-3d;'
 *  -doesn't currently support 'perspective: *;'
 *
 * https://www.w3.org/TR/css-transforms-2
 */
export function transformToWaypointAnimParams(destWp: Waypoint, wayfinder: HTMLElement): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let elementsDownToWp = getElementsFromWayfinderToWaypoint(destWp, wayfinder);
  if (!elementsDownToWp) {
    throw new Error("Couldn't find the given wayfinder div within any of the waypoint's ancestors.");
  }

  let accumulatedTransform = mat4.create();
  mat4.identity(accumulatedTransform);

  // shift the frame of reference to the traveler's transform origin
  // (by convention, this matches the waypoint's center, might eventually add an option to provide the
  // traveler's transform origin directly)
  let travelerCenter = getCenterOfElement(destWp.element);
  let travelerCenterMatrix = mat4.create();
  mat4.fromTranslation(travelerCenterMatrix, travelerCenter);
  mat4.multiply(accumulatedTransform, travelerCenterMatrix, accumulatedTransform);

  elementsDownToWp.forEach((el, i) => {
    if (el.style.position == "fixed") {
      throw new Error("Fixed position is not supported on waypoints, nor any elements between them and the wayfinder.");
    }

    // apply the element's transform-origin
    let transformOrigin = getTransformOriginOfElement(el);
    let originMatrix = mat4.create();
    mat4.fromTranslation(originMatrix, transformOrigin);
    mat4.invert(originMatrix, originMatrix);
    mat4.multiply(accumulatedTransform, originMatrix, accumulatedTransform);

    // pre-multiply the combined transform with the current element's transform
    let currentTransform = get3dTransformMatrixOfElement(el);
    mat4.multiply(accumulatedTransform, currentTransform, accumulatedTransform);

    // remove the transform-origin
    mat4.invert(originMatrix, originMatrix);
    mat4.multiply(accumulatedTransform, originMatrix, accumulatedTransform);

    // translate by the element's offset from its direct parent
    let offsetRect = getOffsetFromDirectParent(el);
    // if element is the root, then use its normal offset rect instead
    if (i == elementsDownToWp.length - 1) {
      offsetRect = getOffsetRectOfElement(el);
    }
    offsetRect.x -= el.scrollLeft;
    offsetRect.y -= el.scrollTop;
    let offsetVec = vec3.fromValues(offsetRect.left, offsetRect.top, 0);
    let offsetMatrix = mat4.create();
    mat4.fromTranslation(offsetMatrix, offsetVec);
    mat4.multiply(accumulatedTransform, offsetMatrix, accumulatedTransform);

    // flatten transform onto xy plane if not preserving 3d
    if (!shouldElementPreserve3d(el)) {
      accumulatedTransform[2] = 0;
      accumulatedTransform[6] = 0;
      accumulatedTransform[10] = 1;
      accumulatedTransform[14] = 0;
    }
  });

  // remove the traveler's frame of reference that was initially applied
  mat4.invert(travelerCenterMatrix, travelerCenterMatrix);
  mat4.multiply(accumulatedTransform, travelerCenterMatrix, accumulatedTransform);

  return { matrix3d: convertMat4ToCssTransformString(accumulatedTransform) };
}

function shouldElementPreserve3d(element: HTMLElement): boolean {
  let currentParent = element!.parentElement;
  return currentParent ? getComputedStyle(currentParent).transformStyle == "preserve-3d" : false;
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

  return elementList;
}

// prettier-ignore
let cssPropertiesCopyBlacklist = ["all", "font-size", "position", "width", "height", "transform", "transform-origin",
                                  "perspective", "perspective-origin"];

/**
 * returns the requested css properties according to the waypoint's computed style. names are
 * converted to camel case
 * -some properties might not be in their specified units
 * -some properties can't be animated
 * -some properties might cause performance hits if animated, e.g. properties that change the layout
 */
export function copyWaypointCssAnimParams(
  destWp: Waypoint,
  _wayfinder: HTMLElement,
  cssPropertiesToCopy: string[]
): WatAnimParams {
  if (!destWp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  let params: WatAnimParams = {};
  let wpComputedStyle = window.getComputedStyle(destWp.element);

  cssPropertiesToCopy.forEach((propName) => {
    if (cssPropertiesCopyBlacklist.includes(propName)) {
      console.warn("Wayfinder: " + propName + " is blacklisted from being copied");
      return;
    }
    let propValue = wpComputedStyle.getPropertyValue(propName);
    if (propValue == "") {
      console.warn("Wayfinder: " + propName + " is most likely not a valid css property name, skipping");
      return;
    }
    params[convertPropNametoCamelCase(propName)] = propValue;
  });
  return params;
}

function convertPropNametoCamelCase(cssPropertyName: string): string {
  let segments = cssPropertyName.split("-");
  let capSegments: string[] = [];
  segments.forEach((seg, i) => {
    if (i > 0) seg = seg.charAt(0).toUpperCase() + seg.slice(1);
    capSegments.push(seg);
  });
  let paramName = capSegments.join("");
  return paramName;
}

/** logging */

export class SendResultsLogData<StashType = any> {
  waypointName!: string;
  waypoint!: Waypoint<StashType>;
  waypointComputedStyle!: CSSStyleDeclaration;
  wayfinderElement!: HTMLElement;
  cssPropertiesCopied!: string[];
  animParamResults!: WatAnimParams;
}

export type SendResultsLogger<StashType = any> = (resultsLogData: SendResultsLogData<StashType>) => void;

function logSendResults(
  destWp: Waypoint,
  wayfinder: HTMLElement,
  cssPropertiesCopied: string[],
  animParamResults: WatAnimParams
): void {
  const resultsLogData = makeSendResultsLogData(destWp, wayfinder, cssPropertiesCopied, animParamResults);
  if (destWp.customSendResultsLogger) {
    destWp.customSendResultsLogger(resultsLogData);
  } else {
    console.log(resultsLogData);
  }
}

function makeSendResultsLogData(
  destWp: Waypoint,
  wayfinder: HTMLElement,
  cssPropertiesCopied: string[],
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
    cssPropertiesCopied,
    animParamResults,
  };
}
