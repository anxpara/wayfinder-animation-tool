import { WatParams, Waypoint } from "../wayfinder";
import { glMatrix, mat4, vec3 } from "gl-matrix";
import {
  getOffsetsFromDirectParentOrigin,
  getIntendedOffsetParent,
  getIntendedOffsets,
  areSameNode,
} from "../utils/true-offsets";
import {
  getCenterOfElement,
  getTransformOriginOfElement,
  get3dTransformMatrixOfElement,
  convertMat4ToCssMatrix3d,
} from "../utils/transform-utils";

const StepDirection = {
  Up: "Up",
  Jump: "Jump",
  ToWayfinder: "ToWayfinder",
} as const;
type StepDirection = typeof StepDirection[keyof typeof StepDirection];

type Step = {
  direction: StepDirection;
  origin: HTMLElement;
  destination: HTMLElement;
};

/**
 * builds a transform matrix that projects the waypoint onto the wayfinder
 *  -supports 'transform-style: preserve-3d;'
 *  -doesn't currently support 'perspective: *;'
 *
 * the wayfinder must either have a fixed position, or be a direct child of one of the following:
 *  -an ancestor of the waypoint
 *  -the body
 *  -a fixed element
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

  const pathFromWpToWayfinder = findPathFromWpToWayfinder(wp, wayfinder);
  if (!pathFromWpToWayfinder.length) {
    throw new Error(`Couldn't find a path from waypoint ${wp.name} to the given wayfinder.`);
  }

  glMatrix.setMatrixArrayType(Array);

  const accumulatedTransform = mat4.create();
  mat4.identity(accumulatedTransform);

  // shift the frame of reference to the traveler's transform origin
  // (by convention, this matches the waypoint's center. might eventually add an option to provide the
  // traveler's transform origin directly)
  const travelerCenter = getCenterOfElement(wp.element);
  const travelerCenterMatrix = mat4.create();
  mat4.fromTranslation(travelerCenterMatrix, travelerCenter);
  mat4.multiply(accumulatedTransform, travelerCenterMatrix, accumulatedTransform);

  pathFromWpToWayfinder.forEach((step) => {
    applyStep(accumulatedTransform, step);
  });

  // remove the traveler's frame of reference that was initially applied
  mat4.invert(travelerCenterMatrix, travelerCenterMatrix);
  mat4.multiply(accumulatedTransform, travelerCenterMatrix, accumulatedTransform);

  const matrix3d = convertMat4ToCssMatrix3d(accumulatedTransform);
  const params: WatParams = { matrix3d };

  // if 'transform' is included in the css copy list, then return the matrix via transform instead
  if (computedCssPropsToCopy.includes("transform")) {
    params.transform = `matrix3d(${matrix3d})`;
    delete params.matrix3d;
  }

  return params;
}

function findPathFromWpToWayfinder(wp: Waypoint, wayfinder: HTMLElement): Step[] {
  const wayfinderIsFixed = getComputedStyle(wayfinder).position === "fixed";
  const wayfinderParent = wayfinder.parentElement;
  const path: Step[] = [];

  const canReachWayfinderFromElement = (element: HTMLElement) =>
    !wayfinderIsFixed && element.isSameNode(wayfinderParent);
  const mustJumpFromElement = (element: HTMLElement) =>
    element.isSameNode(document.body) || getComputedStyle(element).position === "fixed";

  let currentElement = wp.element!;
  let currentParent = currentElement.parentElement;
  let canReachWayfinder = canReachWayfinderFromElement(currentElement);
  let mustJumpFromCurrentElement = mustJumpFromElement(currentElement);

  while (currentParent && !canReachWayfinder && !mustJumpFromCurrentElement) {
    path.push({
      direction: StepDirection.Up,
      origin: currentElement,
      destination: currentParent,
    });
    currentElement = currentParent;
    currentParent = currentElement.parentElement;
    canReachWayfinder = canReachWayfinderFromElement(currentElement);
    mustJumpFromCurrentElement = mustJumpFromElement(currentElement);
  }

  // can reach the wayfinder directly
  if (canReachWayfinder) {
    path.push({
      direction: StepDirection.ToWayfinder,
      origin: currentElement,
      destination: wayfinder,
    });
    return path;
  }

  // can jump from current element to fixed wayfinder
  if (mustJumpFromCurrentElement && wayfinderIsFixed) {
    path.push({
      direction: StepDirection.Jump,
      origin: currentElement,
      destination: wayfinder,
    });
    return path;
  }

  const isWayfinderParentFixed = getComputedStyle(wayfinder.parentElement!).position === "fixed";
  const canJumpToWayfinderParent = wayfinder.parentElement?.isSameNode(document.body) || isWayfinderParentFixed;

  // can jump from current element to wayfinder's parent
  if (mustJumpFromCurrentElement && canJumpToWayfinderParent) {
    path.push({
      direction: StepDirection.Jump,
      origin: currentElement,
      destination: wayfinder.parentElement!,
    });
    path.push({
      direction: StepDirection.ToWayfinder,
      origin: wayfinder.parentElement!,
      destination: wayfinder,
    });
    return path;
  }

  // no path found
  return [];
}

function applyStep(out: mat4, step: Step): mat4 {
  switch (step.direction) {
    case StepDirection.Up:
      return applyStepUp(out, step);
    case StepDirection.Jump:
      return applyStepJump(out, step);
    case StepDirection.ToWayfinder:
      return applyStepToWayfinder(out, step);
  }
}

// STEPS

function applyStepUp(out: mat4, step: Step): mat4 {
  const element = step.origin;
  applyElementTransform(out, element);

  // translate by the element's offset from its direct parent
  let offsetRect = getOffsetsFromDirectParentOrigin(element);

  const offsetVec = vec3.fromValues(offsetRect.left, offsetRect.top, 0);
  const offsetMatrix = mat4.create();
  mat4.fromTranslation(offsetMatrix, offsetVec);
  mat4.multiply(out, offsetMatrix, out);

  const parent = element.parentElement;
  const shouldPreserve3d = parent ? getComputedStyle(parent).transformStyle === "preserve-3d" : false;

  // flatten the out matrix onto xy plane if not preserving 3d
  if (!shouldPreserve3d) {
    out[2] = 0;
    out[6] = 0;
    out[10] = 1;
    out[14] = 0;
  }

  return out;
}

// jumps across the dom between two elements. supports fixed elements and the body
function applyStepJump(out: mat4, step: Step): mat4 {
  if (!step.origin.isSameNode(document.body)) {
    applyElementTransform(out, step.origin);
  }

  const withinContainingBlock = canJumpWithinContainingBlock(step);
  applyElementJumpOffset(out, step.origin, withinContainingBlock);
  applyElementJumpOffsetInverse(out, step.destination, withinContainingBlock);

  if (!step.destination.isSameNode(document.body)) {
    applyElementTransformInverse(out, step.destination);
  }

  return out;
}

function canJumpWithinContainingBlock(step: Step): boolean {
  return areSameNode(getIntendedOffsetParent(step.origin), getIntendedOffsetParent(step.destination));
}

// translates by the inverse of the wayfinder's offset from its direct parent's origin
function applyStepToWayfinder(out: mat4, step: Step): mat4 {
  const offsetRect = getOffsetsFromDirectParentOrigin(step.destination);
  const offsetVec = vec3.fromValues(-offsetRect.left, -offsetRect.top, 0);
  const offsetMatrix = mat4.create();
  mat4.fromTranslation(offsetMatrix, offsetVec);
  mat4.multiply(out, offsetMatrix, out);

  return out;
}

// SUB STEPS

function applyElementTransform(out: mat4, element: HTMLElement): mat4 {
  // apply element's transform-origin
  const transformOrigin = getTransformOriginOfElement(element);
  const originMatrix = mat4.create();
  mat4.fromTranslation(originMatrix, transformOrigin);
  mat4.invert(originMatrix, originMatrix);
  mat4.multiply(out, originMatrix, out);

  // apply element's transform
  const currentTransform = get3dTransformMatrixOfElement(element);
  mat4.multiply(out, currentTransform, out);

  // remove element's transform-origin
  mat4.invert(originMatrix, originMatrix);
  mat4.multiply(out, originMatrix, out);

  return out;
}

/**
 * note: this is a naive approach that supports some transforms, but not all.
 * e.g. rotateX and rotateY break this
 *
 * this will eventually be replaced by actual downward projection
 */
function applyElementTransformInverse(out: mat4, element: HTMLElement): mat4 {
  const transform = mat4.create();
  mat4.identity(transform);
  applyElementTransform(transform, element);
  mat4.invert(transform, transform);
  mat4.multiply(out, transform, out);

  return out;
}

function applyElementJumpOffset(out: mat4, element: HTMLElement, relativeToContainingBlock = false): mat4 {
  const style = getComputedStyle(element);

  let offsetRect: DOMRect | null;
  if (element.isSameNode(document.body)) {
    offsetRect = element.getBoundingClientRect();
  } else if (style.position === "fixed") {
    offsetRect = getOffsetsForFixedElement(element, relativeToContainingBlock);
  } else {
    offsetRect = getIntendedOffsets(element);
  }

  const offsetVec = vec3.fromValues(offsetRect.left, offsetRect.top, 0);
  const offsetMatrix = mat4.create();
  mat4.fromTranslation(offsetMatrix, offsetVec);
  mat4.multiply(out, offsetMatrix, out);

  return out;
}

function applyElementJumpOffsetInverse(out: mat4, element: HTMLElement, relativeToContainer = false): mat4 {
  const offsetMatrix = mat4.create();
  mat4.identity(offsetMatrix);
  applyElementJumpOffset(offsetMatrix, element, relativeToContainer);
  mat4.invert(offsetMatrix, offsetMatrix);
  mat4.multiply(out, offsetMatrix, out);

  return out;
}

function getOffsetsForFixedElement(fixedElement: HTMLElement, relativeToContainingBlock = false): DOMRect {
  const offsetRect = getIntendedOffsets(fixedElement);
  if (relativeToContainingBlock) {
    return offsetRect;
  }
  const containingElement = getIntendedOffsetParent(fixedElement);
  if (!containingElement) {
    return offsetRect;
  }

  const fixationContainerBCR = containingElement.getBoundingClientRect();
  offsetRect.x += fixationContainerBCR.x;
  offsetRect.y += fixationContainerBCR.y;

  const fixationContainerStyle = getComputedStyle(containingElement);
  offsetRect.x += Number.parseFloat(fixationContainerStyle.borderLeftWidth.split("p")[0]);
  offsetRect.y += Number.parseFloat(fixationContainerStyle.borderTopWidth.split("p")[0]);

  return offsetRect;
}
