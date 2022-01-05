import { glMatrix, mat4, vec3 } from "gl-matrix";

glMatrix.setMatrixArrayType(Array);

export function getViewportRectOfElement(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

export function getOffsetRectOfElement(element: HTMLElement): DOMRect {
  return new DOMRect(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
}

export function getTransformOriginOfElement(element: HTMLElement): vec3 {
  let originString = window.getComputedStyle(element).transformOrigin;
  let coords = originString.split(" ").map((str) => Number.parseFloat(str));
  return vec3.fromValues(coords[0], coords[1], coords.length > 2 ? coords[2] : 0);
}

export function isContainerOffsetRelevantToChildren(el: HTMLElement): boolean {
  let style = window.getComputedStyle(el);
  return style.transform == "none" && style.position == "static";
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
