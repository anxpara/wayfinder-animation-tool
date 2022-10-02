import { glMatrix, mat4, vec3 } from "gl-matrix";

glMatrix.setMatrixArrayType(Array);

export function getViewportRectOfElement(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

export function getOffsetRectOfElement(element: HTMLElement): DOMRect {
  return new DOMRect(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
}

/**
 * https://drafts.csswg.org/cssom-view/#dom-htmlelement-offsetparent
 *
 * mobile Safari has a bug where the offsets of absolute divs in transformed, static divs
 * aren't relative to the given offsetParent, but rather the direct parent. this also
 * happens if the parent isn't transformed, but "will-change: transform" is set
 *
 * ---
 *
 * it would be great if
 * 1. HTMLElement had a directOffset property added as a standard
 * 2. Safari would provide the correct offset or offsetParent for absolute divs in transformed divs
 */
export function getOffsetFromDirectParent(element: HTMLElement): DOMRect {
  let style = getComputedStyle(element);
  let directParent = element.parentElement;
  let offsetParent = element.offsetParent;
  let offsetRect = getOffsetRectOfElement(element);

  let isMobileSafari = /webkit.*mobile/i.test(navigator.userAgent); // checking userAgent string is not ideal
  let isOffsetRelativeToDirectParent = isMobileSafari && style.position == "absolute";
  let isDirectParentOffsetIncluded =
    !isOffsetRelativeToDirectParent && directParent && offsetParent == directParent.offsetParent;

  if (isDirectParentOffsetIncluded) {
    let directParentOffset = getOffsetRectOfElement(directParent!);
    offsetRect.x -= directParentOffset.x;
    offsetRect.y -= directParentOffset.y;
  } else if (offsetParent) {
    let offsetParentStyle = window.getComputedStyle(offsetParent);
    offsetRect.x += Number.parseFloat(offsetParentStyle.borderLeftWidth);
    offsetRect.y += Number.parseFloat(offsetParentStyle.borderTopWidth);
  }

  return offsetRect;
}

export function getCenterOfElement(element: HTMLElement): vec3 {
  return vec3.fromValues(element.offsetWidth / 2, element.offsetHeight / 2, 0);
}

export function getTransformOriginOfElement(element: HTMLElement): vec3 {
  let originString = window.getComputedStyle(element).transformOrigin;
  let coords = originString.split(" ").map((str) => Number.parseFloat(str));
  return vec3.fromValues(coords[0], coords[1], coords.length > 2 ? coords[2] : 0);
}

// prettier-ignore
const identityMatrix3d = [
  '1', '0', '0', '0',
  '0', '1', '0', '0',
  '0', '0', '1', '0',
  '0', '0', '0', '1',
];
Object.freeze(identityMatrix3d);

export function get3dTransformMatrixOfElement(element: HTMLElement): mat4 {
  let cssTransformArray = convertCssTransformToArray(window.getComputedStyle(element).transform);

  if (!cssTransformArray) {
    let transformMatrix = mat4.create();
    mat4.identity(transformMatrix);
    return transformMatrix;
  }

  if (cssTransformArray.length == 6) {
    let transformCopy = [...cssTransformArray];
    cssTransformArray = [...identityMatrix3d];
    cssTransformArray[0] = transformCopy[0];
    cssTransformArray[1] = transformCopy[1];
    cssTransformArray[4] = transformCopy[2];
    cssTransformArray[5] = transformCopy[3];
    cssTransformArray[12] = transformCopy[4];
    cssTransformArray[13] = transformCopy[5];
  }

  return convertCssTransformArrayToMat4(cssTransformArray);
}

function convertCssTransformToArray(transform: string): string[] | null {
  if (transform == "none") {
    return null;
  }

  let values = transform.split("(")[1];
  values = values.split(")")[0];
  return values.split(", ");
}

function convertCssTransformArrayToMat4(cssMatrix: string[]): mat4 {
  let floats = cssMatrix.map((str) => parseFloat(str));

  // prettier-ignore
  return mat4.fromValues(
    floats[0],  floats[1],  floats[2],  floats[3],
    floats[4],  floats[5],  floats[6],  floats[7],
    floats[8],  floats[9],  floats[10], floats[11],
    floats[12], floats[13], floats[14], floats[15]
  );
}

export function convertMat4ToCssTransformString(mat: mat4): string {
  let str = mat4.str(mat);
  str = str.split("(")[1];
  str = str.split(")")[0];
  return str;
}

export function logMat4(mat: mat4): void {
  console.log("%f, %f, %f, %f", mat[0], mat[1], mat[2], mat[3]);
  console.log("%f, %f, %f, %f", mat[4], mat[5], mat[6], mat[7]);
  console.log("%f, %f, %f, %f", mat[8], mat[9], mat[10], mat[11]);
  console.log("%f, %f, %f, %f", mat[12], mat[13], mat[14], mat[15]);
}
