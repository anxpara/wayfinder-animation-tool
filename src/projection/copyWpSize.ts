import { WatParams, Waypoint } from "../wayfinder";
import { getOffsetRectOfElement } from "../utils/offset-utils";

/**
 * returns the waypoint's font-size, width, and height params in em. if any border widths are
 * being copied, then the width and height will exclude those widths. if pixel values are desired,
 * then parse all values and multiply the width and height by the font-size
 *
 * note: by convention, travelers must match the destination waypoint's width and height in order to
 * preserve a center origin on the traveler. this convention might be removed eventually
 *
 * note: animating font-size, width, or height can be expensive. if you must animate between
 * different-sized waypoints, consider finding a good instant to set the dimensions once
 */
export function copyWpSize(wp: Waypoint, wayfinder: HTMLElement, computedCssPropsToCopy: string[]): WatParams {
  if (!wp.element) {
    throw new Error(`Waypoint ${wp.name} has no element.`);
  }

  const wpComputedStyle = window.getComputedStyle(wp.element);
  const wfComputedStyle = window.getComputedStyle(wayfinder);

  // check which border widths will be copied
  const removeAll = computedCssPropsToCopy.includes("border") || computedCssPropsToCopy.includes("border-width");
  let removeLeft = false;
  let removeRight = false;
  let removeTop = false;
  let removeBottom = false;
  if (!removeAll) {
    removeLeft = computedCssPropsToCopy.includes("border-left") || computedCssPropsToCopy.includes("border-left-width");
    removeRight =
      computedCssPropsToCopy.includes("border-right") || computedCssPropsToCopy.includes("border-right-width");
    removeTop = computedCssPropsToCopy.includes("border-top") || computedCssPropsToCopy.includes("border-top-width");
    removeBottom =
      computedCssPropsToCopy.includes("border-bottom") || computedCssPropsToCopy.includes("border-bottom-width");
  }

  // calculate dimensions, excluding any border widths that will be copied
  const wpOffsetRect = getOffsetRectOfElement(wp.element);
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

  const wpFontSizePx = Number.parseFloat(wpComputedStyle.fontSize.split("p")[0]);
  const wfFontSizePx = Number.parseFloat(wfComputedStyle.fontSize.split("p")[0]);

  // bake in the difference in font-size between the waypoint and wayfinder
  const fontSize = wpFontSizePx / wfFontSizePx + "em";

  // calculate dimensions in em. the traveler's font-size is now analogous to the
  // waypoint's font-size, so no special conversion is needed
  const width = wpWidthPx / wpFontSizePx + "em";
  const height = wpHeightPx / wpFontSizePx + "em";

  return { fontSize, width, height };
}
