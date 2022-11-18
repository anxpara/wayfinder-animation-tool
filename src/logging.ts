import { getOffsetFromDirectParent, getOffsetRectOfElement } from "./css-utils";
import { WatParams, Waypoint } from "./wayfinder";

export class WatResultsLogData<StashType = any> {
  waypointName!: string;
  waypoint!: Waypoint<StashType>;
  waypointComputedStyle!: CSSStyleDeclaration;
  directParent!: HTMLElement | null;
  directOffsetRect!: DOMRect;
  offsetParent!: Element | null;
  offsetRect!: DOMRect;
  wayfinder!: HTMLElement;
  computedCssPropsToCopy!: string[];
  watParamResults!: WatParams;
}

export type WatResultsLogger<StashType = any> = (resultsLogData: WatResultsLogData<StashType>) => void;

export function logWatResults(
  wp: Waypoint,
  wayfinder: HTMLElement,
  computedCssPropsToCopy: string[],
  watParamResults: WatParams
): void {
  const resultsLogData = makeWatResultsLogData(wp, wayfinder, computedCssPropsToCopy, watParamResults);
  if (wp.customLogger) {
    wp.customLogger(resultsLogData);
  } else {
    console.log(resultsLogData);
  }
}

function makeWatResultsLogData(
  wp: Waypoint,
  wayfinder: HTMLElement,
  computedCssPropsToCopy: string[],
  watParamResults: WatParams
): WatResultsLogData<Waypoint> {
  if (!wp.element) {
    throw new Error("Destination waypoint has no element.");
  }

  return {
    waypointName: wp.name,
    waypoint: wp,
    waypointComputedStyle: window.getComputedStyle(wp.element),
    directParent: wp.element.parentElement,
    directOffsetRect: getOffsetFromDirectParent(wp.element),
    offsetParent: wp.element.offsetParent,
    offsetRect: getOffsetRectOfElement(wp.element),
    wayfinder,
    computedCssPropsToCopy,
    watParamResults,
  };
}
