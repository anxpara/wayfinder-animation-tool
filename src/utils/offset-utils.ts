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
  const style = getComputedStyle(element);
  const directParent = element.parentElement;
  const offsetParent = element.offsetParent;
  const offsetRect = getOffsetRectOfElement(element);

  // determine if parent's offset needs to be removed from element's
  const isMobileWebkit = /webkit.*mobile/i.test(navigator.userAgent); // checking userAgent string is not ideal
  const isOffsetRelativeToDirectParent = isMobileWebkit && style.position === "absolute";
  const isDirectParentOffsetIncluded =
    !isOffsetRelativeToDirectParent && directParent && offsetParent === directParent.offsetParent;

  if (isDirectParentOffsetIncluded) {
    const directParentOffset = getOffsetRectOfElement(directParent!);
    offsetRect.x -= directParentOffset.x;
    offsetRect.y -= directParentOffset.y;
  } else if (offsetParent) {
    // if element offset doesn't include parent's, then offset from parent's border must be added
    const offsetParentStyle = window.getComputedStyle(offsetParent);
    offsetRect.x += Number.parseFloat(offsetParentStyle.borderLeftWidth);
    offsetRect.y += Number.parseFloat(offsetParentStyle.borderTopWidth);
  }

  return offsetRect;
}
