export type RenderingEngine = "blink" | "gecko" | "webkit" | "other";

const geckoRegex = /rv\:[\w\.]{1,9}\b.+gecko/i;
const blinkRegex = /webkit\/537\.36.+chrome\/(?!27)[\w\.]+/i;
const webkitRegex = /webkit\/[\w\.]+/i;

export function getRenderingEngine(): RenderingEngine {
  if (geckoRegex.test(navigator.userAgent)) return "gecko";
  if (blinkRegex.test(navigator.userAgent)) return "blink";
  if (webkitRegex.test(navigator.userAgent)) return "webkit";
  return "other";
}
