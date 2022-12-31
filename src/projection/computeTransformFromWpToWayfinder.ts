import { mat4, vec3 } from "gl-matrix";
import { WatParams, Waypoint } from "../wayfinder";
import { getOffsetFromDirectParent, getOffsetRectOfElement } from "../utils/offset-utils";
import {
  getCenterOfElement,
  getTransformOriginOfElement,
  get3dTransformMatrixOfElement,
  convertMat4ToCssMatrix3d,
} from "../utils/transform-utils";
/**
 * builds a transform matrix that projects the waypoint onto the wayfinder
 *  -supports 'transform-style: preserve-3d;'
 *  -doesn't currently support 'perspective: *;'
 *
 * if computedCssPropsToCopy includes "transform", then the the matrix3d param is
 * returned via the transform property instead (useful for Motion One integration)
 *
 * https://www.w3.org/TR/css-transforms-2
 */
export function computeTransformFromWpToWayfinder(
  wp: Waypoint,
  wayfinder: HTMLElement,
  computedCssPropsToCopy: string[]
): WatParams {
  if (!wp.element) {
    throw new Error(`Waypoint ${wp.name} has no element.`);
  }

  const elementsDownToWp = getElementsFromWayfinderToWp(wp, wayfinder);
  if (!elementsDownToWp) {
    throw new Error(`Couldn't find the given wayfinder div within any of the waypoint ${wp.name}'s ancestors.`);
  }

  const accumulatedTransform = mat4.create();
  mat4.identity(accumulatedTransform);

  // shift the frame of reference to the traveler's transform origin
  // (by convention, this matches the waypoint's center, might eventually add an option to provide the
  // traveler's transform origin directly)
  const travelerCenter = getCenterOfElement(wp.element);
  const travelerCenterMatrix = mat4.create();
  mat4.fromTranslation(travelerCenterMatrix, travelerCenter);
  mat4.multiply(accumulatedTransform, travelerCenterMatrix, accumulatedTransform);

  elementsDownToWp.forEach((el, i) => {
    if (el.style.position === "fixed") {
      throw new Error("Fixed position is not supported on waypoints, nor any elements between them and the wayfinder.");
    }

    // apply the element's transform-origin
    const transformOrigin = getTransformOriginOfElement(el);
    const originMatrix = mat4.create();
    mat4.fromTranslation(originMatrix, transformOrigin);
    mat4.invert(originMatrix, originMatrix);
    mat4.multiply(accumulatedTransform, originMatrix, accumulatedTransform);

    // pre-multiply the combined transform with the current element's transform
    const currentTransform = get3dTransformMatrixOfElement(el);
    mat4.multiply(accumulatedTransform, currentTransform, accumulatedTransform);

    // remove the transform-origin
    mat4.invert(originMatrix, originMatrix);
    mat4.multiply(accumulatedTransform, originMatrix, accumulatedTransform);

    // translate by the element's offset from its direct parent
    let offsetRect = getOffsetFromDirectParent(el);
    // if element is the root, then use its normal offset rect instead
    if (i === elementsDownToWp.length - 1) {
      offsetRect = getOffsetRectOfElement(el);
    }
    offsetRect.x -= el.scrollLeft;
    offsetRect.y -= el.scrollTop;
    const offsetVec = vec3.fromValues(offsetRect.left, offsetRect.top, 0);
    const offsetMatrix = mat4.create();
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

  const matrix3d = convertMat4ToCssMatrix3d(accumulatedTransform);
  const params: WatParams = { matrix3d };

  // if transform is included in the css copy list, then return the matrix via transform instead
  if (computedCssPropsToCopy.includes("transform")) {
    params.transform = `matrix3d(${matrix3d})`;
    delete params.matrix3d;
  }

  return params;
}

function shouldElementPreserve3d(element: HTMLElement): boolean {
  const currentParent = element!.parentElement;
  return currentParent ? getComputedStyle(currentParent).transformStyle === "preserve-3d" : false;
}

function getElementsFromWayfinderToWp(wp: Waypoint, wayfinder: HTMLElement): HTMLElement[] {
  const wayfinderParent = wayfinder.parentElement;
  let currentParent = wp.element!.parentElement;
  const elementList: HTMLElement[] = [wp.element!];

  while (currentParent && !currentParent.isSameNode(wayfinderParent)) {
    elementList.push(currentParent);
    currentParent = currentParent!.parentElement;
  }
  if (currentParent != wayfinderParent) {
    return [];
  }

  return elementList;
}
