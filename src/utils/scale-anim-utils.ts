import { WatAnimParams } from "../wat-anim-params";

/** performs the equivalent of CSS scaling to the rectangle, i.e. scales from the center */
export function scaleRectangle(rect: DOMRect, scale: number): DOMRect {
  return scaleRectangleXY(rect, scale, scale);
}

/** performs the equivalent of CSS scaling to the rectangle, i.e. scales from the center */
export function scaleRectangleXY(rect: DOMRect, scaleX: number, scaleY: number): DOMRect {
  let dest = new DOMRect(rect.x, rect.y, rect.width, rect.height);

  dest.width *= scaleX;
  dest.height *= scaleY;

  // subtract offsets to simulate scaling from center
  let offsetTranslations = getScalingOffsetTranslations(rect, dest);
  dest.x -= offsetTranslations.translateX!;
  dest.y -= offsetTranslations.translateY!;

  return dest;
}

/**
 * calculate the change in position that would occur if the original rectangle were to be
 * scaled to the size of the destination rectangle
 *
 * @return WatAnimParams object with translateX and translateY params
 */
export function getScalingOffsetTranslations(originRect: DOMRect, destRect: DOMRect): WatAnimParams {
  let xGrowth = destRect.width - originRect.width;
  let yGrowth = destRect.height - originRect.height;

  // change in position is half the growth
  return { translateX: xGrowth / 2, translateY: yGrowth / 2 };
}

/**
 * calculates scale that maximizes the rectangle's size while keeping it within the container
 *
 * width and height scales are checked independently, with the smaller of the two being selected
 *
 * @return WatAnimParams object with scale param
 */
export function getScaleToFitContainerParam(rect: DOMRect, container: DOMRect): WatAnimParams {
  let maxXScale = container.width / rect.width;
  let maxYScale = container.height / rect.height;
  return { scale: Math.min(maxXScale, maxYScale) };
}
