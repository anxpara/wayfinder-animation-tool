import { WatParams, Waypoint } from "../wayfinder";

// prettier-ignore
const cssPropertiesCopyBlacklist = ["all", "font-size", "position", "width", "height", "transform-origin",
                                    "perspective", "perspective-origin"];

/**
 * returns the requested css properties according to the waypoint's computed style. names are
 * converted to camel case
 * -computed properties might not be in their specified units
 * -in some cases, only the longhand names are available (e.g. a multi-color border where the
 *  different sides can't all be represented by the shorthand 'border' property)
 * -some properties can't be animated
 * -some properties might cause performance hits if animated (e.g. properties that affect the layout)
 *
 * for details on computed style, see
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 */
export function copyComputedCssFromWp(
  wp: Waypoint,
  _wayfinder: HTMLElement,
  computedCssPropsToCopy: string[]
): WatParams {
  if (!wp.element) {
    throw new Error(`Waypoint ${wp.name} has no element.`);
  }

  const params: WatParams = {};
  const wpComputedStyle = window.getComputedStyle(wp.element);

  computedCssPropsToCopy.forEach((propName) => {
    // transform is handled by computeTransformFromWpToWayfinder
    if (propName === "transform") {
      return;
    }
    // ignore blacklisted properties
    if (cssPropertiesCopyBlacklist.includes(propName)) {
      console.warn(`Wayfinder: ${propName} is blacklisted from being copied.`);
      return;
    }

    const propValue = wpComputedStyle.getPropertyValue(propName);

    // skip empty values
    if (propValue === "") {
      console.warn(`Wayfinder: ${wp.name}'s ${propName} property has no value, skipping.`);
      return;
    }

    params[convertPropNametoCamelCase(propName)] = propValue;
  });

  return params;
}

function convertPropNametoCamelCase(cssPropertyName: string): string {
  const segments = cssPropertyName.split("-");
  const capSegments: string[] = [];
  segments.forEach((seg, i) => {
    if (i > 0) seg = seg.charAt(0).toUpperCase() + seg.slice(1);
    capSegments.push(seg);
  });
  const paramName = capSegments.join("");
  return paramName;
}
