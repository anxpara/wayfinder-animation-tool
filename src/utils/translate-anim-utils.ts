import { WatAnimParams } from "../wat-anim-params";

/**
 * calculates the translations necessary to bring the rectangle back into the container
 *
 * if the rectangle is larger than the container in a particular axis, then it will
 * default to clamping to the top and left sides
 *
 * todo: add param to pick default right or bottom
 *
 * @param container - have non-zero container positions been tested yet?
 *
 * @return WatAnimParams object with translateX and translateY params
 */
export function getTranslateIntoContainerParams(rect: DOMRect, container: DOMRect): WatAnimParams {
  let destRect = new DOMRect(rect.x, rect.y, rect.width, rect.height);
  let translateX = 0;
  let translateY = 0;

  // translate dest left if needed
  translateX = destRect.right > container.right ? container.right - destRect.right : 0;
  destRect.x += translateX;

  // translate dest right if needed, thus clamping to left side by default
  translateX = destRect.left < container.left ? container.left - destRect.left : 0;
  destRect.x += translateX;

  // up
  translateY = destRect.bottom > container.bottom ? container.bottom - destRect.bottom : 0;
  destRect.y += translateY;

  // down
  translateY = destRect.top < container.top ? container.top - destRect.top : 0;
  destRect.y += translateY;

  return {
    translateX: destRect.x - rect.x,
    translateY: destRect.y - rect.y,
  };
}
