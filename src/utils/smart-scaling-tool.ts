import { getScaleToFitContainerParam, scaleRectangle } from "./scale-anim-utils";
import { getTranslateIntoContainerParams } from "./translate-anim-utils";
import { WatAnimParams } from "../wat-anim-params";

/**
 * support for Typescript NPM submodules is nearing release. 
 * until then, use the following to import smart scaling:
 * 
   import {
     getSmartScaleParams,
     getSmartUnscaleParams,
   } from 'wayfinder-animation-tool/dist/utils/smart-scaling-tool';
 */

let originRectsByTrackingId = new Map<string, any>();

/**
 * calculates the best scale and translations to scale the rectangle while keeping it
 * within the container, clamping the size if necessary
 *
 * optional: use the origin tracking to avoid odd bugs when potentially calling smart
 * scale repeatedly. e.g.: many quick mouse enter and exit events for a hover animation
 *
 * you can use desiredScale = 1 if you only want to clamp the size down to the container
 *
 * @param originTrackingId - if provided, will remember the first rectangle given for the
 * associated ID until the rectangle finally returns back to its original state as triggered
 * through smartUnscaleParams' complete() callback property
 *
 * @returns WatAnimParams object with scale, translateX, and translateY properties
 */
export function getSmartScaleParams(
  rect: DOMRect,
  desiredScale: number,
  container: DOMRect,
  originTrackingId: string = ""
): WatAnimParams {
  if (originTrackingId) {
    let savedRect = originRectsByTrackingId.get(originTrackingId);
    rect = savedRect ?? rect;
    if (!savedRect) {
      originRectsByTrackingId.set(originTrackingId, rect);
    }
  }

  let maxScale = getScaleToFitContainerParam(rect, container).scale!;
  let scale = Math.min(desiredScale, maxScale);
  let scaledRectangle = scaleRectangle(rect, scale);

  // order of transforms matters. if you translate after scale, then the translation gets scaled as well
  return {
    ...getTranslateIntoContainerParams(scaledRectangle, container),
    scale,
  };
}

/**
 * returns the default values for all params set by smartScaleParams(), and removes any
 * rectangle origin tracking from smartScaleParams(). if the element previously had non-default
 * values, then these params must be overriden
 *
 * important: make sure to the complete() callback doesn't overwrite an existing complete()
 * callback, or vice versa. can wrap it in a combo complete(), or can also save it and
 * call it manually later
 *
 * @param originTrackingId - the trackingId passed to smartScaleParams(), if any
 *
 * @returns WatAnimParams object with scale, translateX, translateY, and complete() params
 */
export function getSmartUnscaleParams(originTrackingId: string = ""): WatAnimParams {
  return {
    scale: 1,
    translateX: 0,
    translateY: 0,
    complete: () => {
      if (originTrackingId) {
        originRectsByTrackingId.set(originTrackingId, undefined);
      }
    },
  };
}
