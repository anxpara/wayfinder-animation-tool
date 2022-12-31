import { glMatrix, mat4, vec3 } from "gl-matrix";

glMatrix.setMatrixArrayType(Array);

export function getCenterOfElement(element: HTMLElement): vec3 {
  return vec3.fromValues(element.offsetWidth / 2, element.offsetHeight / 2, 0);
}

export function getTransformOriginOfElement(element: HTMLElement): vec3 {
  const origin = window.getComputedStyle(element).transformOrigin;
  const originValues = origin.split(" ").map((str) => Number.parseFloat(str));
  return vec3.fromValues(
    originValues[0],
    originValues[1],
    originValues.length > 2 ? originValues[2] : 0
  );
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
  let cssTransformArray = convertCssTransformToArray(
    window.getComputedStyle(element).transform
  );

  // default to identity matrix if none set
  if (!cssTransformArray) {
    const transformMatrix = mat4.create();
    mat4.identity(transformMatrix);
    return transformMatrix;
  }

  // convert 3x2 matrix to 4x4
  if (cssTransformArray.length === 6) {
    const transformCopy = [...cssTransformArray];
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
  if (transform === "none") {
    return null;
  }

  let values = transform.split("(")[1];
  values = values.split(")")[0];
  return values.split(", ");
}

export function convertCssTransformArrayToMat4(cssMatrix: string[]): mat4 {
  const floats = cssMatrix.map((str) => parseFloat(str));

  // prettier-ignore
  return mat4.fromValues(
      floats[0],  floats[1],  floats[2],  floats[3],
      floats[4],  floats[5],  floats[6],  floats[7],
      floats[8],  floats[9],  floats[10], floats[11],
      floats[12], floats[13], floats[14], floats[15]
    );
}

export function convertMat4ToCssMatrix3d(mat: mat4): string {
  let str = mat4.str(mat);
  str = str.split("(")[1];
  str = str.split(")")[0];
  return str;
}
