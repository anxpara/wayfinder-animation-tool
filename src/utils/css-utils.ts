export function getComputedStyleOfElement(element: HTMLElement): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}

export function getViewportRectOfElement(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

export function getOffsetRectOfElement(element: HTMLElement): DOMRect {
  return new DOMRect(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
}

// would be nice
/*export function getContentRectOfElement(element: HTMLElement): DOMRect {
  return new DOMRect( ... );
}*/

export const identityMatrix2d = ["1", "0", "0", "1", "0", "0"];
Object.freeze(identityMatrix2d);

// prettier-ignore
export const identityMatrix3d = [
  '1', '0', '0', '0',
  '0', '1', '0', '0',
  '0', '0', '1', '0',
  '0', '0', '0', '1',
];
Object.freeze(identityMatrix3d);

/** if the element has a 3d transform, then it is ignored and a 2d identity matrix is returned */
export function get2dTransformMatrixOfElement(element: HTMLElement): string[] {
  let matrixArray = convertMatrixToArray(getComputedStyleOfElement(element).transform);

  if (!matrixArray) {
    return [...identityMatrix2d];
  }

  if (matrixArray!.length == 16) {
    console.warn("Expected 2d css transform matrix, but got 3d. Returning 2d identity matrix");
    return [...identityMatrix2d];
  }

  return matrixArray;
}

/** if the element has a 2d transform, then the 2d transform is converted to a 3d transform */
export function get3dTransformMatrixOfElement(element: HTMLElement): string[] {
  let matrixArray = convertMatrixToArray(getComputedStyleOfElement(element).transform);

  if (!matrixArray) {
    return [...identityMatrix3d];
  }

  if (matrixArray.length == 6) {
    let matrixCopy = [...matrixArray];
    matrixArray = [...identityMatrix3d];
    matrixArray[0] = matrixCopy[0];
    matrixArray[1] = matrixCopy[1];
    matrixArray[4] = matrixCopy[2];
    matrixArray[5] = matrixCopy[3];
    matrixArray[12] = matrixCopy[4];
    matrixArray[13] = matrixCopy[5];
  }

  return matrixArray;
}

export function convertMatrixToArray(transform: string): string[] | null {
  if (transform == "none") {
    return null;
  }

  let values = transform.split("(")[1];
  values = values.split(")")[0];
  return values.split(", ");
}

export function convertMatrixToString(matrix: string[]): string {
  return matrix.join(", ");
}
