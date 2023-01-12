/**
 * THE PROBLEM...
 *
 * accurately getting an element's position relative to another is difficult and complicated
 * 1. people often recommend getBoundingClientRect(), but gBCR() returns *bounds*, not *positions*, which means it's sensitive to certain
 *    transforms like rotate. it's subpixel accurate, which is nice, but i haven't found a way to make use of the bounds for transformed elements
 *
 * 2. the HTMLElement offset data provided by all major browsers is each rendering engine's flavor of inaccurate and unreliable,
 *    and the offsets are rounded to the nearest pixel. RIP
 *
 * 3. this true-offsets interface is a band-aid which provides a make much clearer sense of the designated offset data, but it's still rounded
 *    to the nearest pixel, and the problem has so many odd corner cases that i've decided not to cover every single one
 *
 * 4. the dream solution to all of this would be for the HTMLElement interface to provide sub-pixel offsets from the direct parent
 *
 * HTMLElement OFFSETS INTERFACE...
 *
 * the HTMLElement offsets interface--and its varying implementations in every popular browser's rendering engine--have several shortcomings:
 * 1. the offsets are rounded to the nearest pixel, and sub-pixel offset information is not provided anywhere
 * 2. the designated offsetLeft and offsetTop can't be trusted, since they don't always match the designated offsetParent,
 *    and in rare scenarios they don't even align correctly with the ancestor that they land on
 * 3. for an element of fixed position, the designated offsets are in relation to its containing block, which isn't
 *    necessarily the viewport, since ancestors can create new containing blocks. unfortunately, the HTMLElement interface
 *    does not provide which element, if any, created the element's containing block
 * 4. i forgor the 4th one
 * 5. some of the above issues manifest differently depending on the rendering engine
 *
 * getBoundingClientRect()...
 *
 * all of that is a tragedy. and no, getBoundingClientRect() is not a good general solution for getting element positions.
 * gBCR() is a specific solution with various quirks that's recommended more often than it deserves
 * 1. specific to the viewport
 * 2. expensive
 * 3. location returned is sensitive to transforms such as rotate
 * 4. does provide sub-pixel location data, so that's nice... if the element isn't subjected to sensitive transforms
 *
 * INTERSECTION OBSERVERS...
 *
 * intersection observers are a newer alternative to gBCR(), but they still don't seem that useful, since you must provide a
 * list of specific intersection ratio trigger points to listen for, and they provide bounding rectangles that are transform-sensitive
 *
 * -----
 *
 * TRUE OFFSETS...
 *
 * this true offsets interface aims to provide a band-aid to most of the issues with the offsets interface
 * (all offsets returned as DOMRect)
 *
 *    parent                           ->  offsets
 * --------------------------------------------------------------------------------------
 * 1. element.offsetParent             ->  getTrueOffsets(element)
 *
 * 2. element.parentElement            ->  getOffsetsFromDirectParent(element)
 *
 * 3. element.parentElement            ->  getOffsetsFromDirectParentOrigin(element)
 *
 * 4. getIntendedOffsetParent(element) ->  getIntendedOffsets(element)
 *
 * Details:
 * 1. getTrueOffsets(element)
 *    -recommended interface, it's better to just play along with the browser's designated offset parent
 *    -ignores transforms
 *
 * 2. getOffsetsFromDirectParent(element)
 *    -useful for getting an element's offset from its direct parent's padding box
 *    -based on true offsets
 *    -ignores transforms
 *
 * 3. getOffsetsFromDirectParentOrigin(element)
 *    -same as getOffsetsFromDirectParent, but from the direct parent's border box
 *
 * 4. getIntendedOffsetParent(element) and getIntendedOffsets(element)
 *    -not recommended, since the intended offsets still aren't guaranteed to align with the intended offset parent's border box
 *    -useful for figuring out where the browser is actually offsetting the element from
 *    -for fixed elements, useful for getting the containing ancestor and corresponding offsets
 *
 * Limitations:
 * 1. offsets are still rounded to the nearest pixel
 * 2. doesn't support turning the root element into a containing block (undefined behavior in certain browsers for fixed elements)
 * 3. uses gBCR() for the root and body elements (for now)
 * 4. probably still has bugs
 *
 * -----
 *
 * DREAM SOLUTION...
 *
 * if the official HTMLElement interface added the following, that would be a dream solution:
 * 1. subPixelDirectOffsetLeft
 * 2. subPixelDirectOffsetTop
 * 3. subPixelOffsetWidth
 * 4. subPixelOffsetHeight
 */

// TRUE OFFSETS FOR DESIGNATED OFFSETPARENT

/**
 * returns the element's true offsetTop and offsetLeft from its designated offsetParent as a DOMRect,
 * adding any offsets on the root or body that the rendering engine may have ignored
 *
 * for a fixed element, returns the correct offset from its containing block,
 * removing any border widths that the rendering engine may have incorrectly added
 *
 * for body and root, returns the offsets from gBCR() (for now)
 *
 * note: doesn't perform any corrections for elements with display: none
 *
 * warning: doesn't support use of the root element as a fixation container
 */
export function getTrueOffsets(element: HTMLElement): DOMRect {
  const offsetRect = getDesignatedOffsets(element);
  const style = getComputedStyle(element);

  // ignore display: none
  if (style.display === "none") {
    return offsetRect;
  }

  // use gBCR for root and body
  if (element.isSameNode(document.documentElement) || element.isSameNode(document.body)) {
    return element.getBoundingClientRect();
  }

  // handle fixed elements separately
  if (style.position === "fixed") {
    return getTrueOffsetsOfFixedElement(element);
  }

  // assume designated offsets are correct if offsetparent isn't body
  if (!areSameNode(element.offsetParent, document.body)) {
    return offsetRect;
  }

  const intendedOffsetParent = getIntendedOffsetParent(element);
  const isChildAbsolute = style.position === "absolute";
  const offsetsAddedByBrowser = getOffsetsBeyondBodyContentAddedByBrowser(intendedOffsetParent, isChildAbsolute);

  offsetRect.x -= offsetsAddedByBrowser.x;
  offsetRect.y -= offsetsAddedByBrowser.y;

  return offsetRect;
}

/**
 * blink and webkit incorrectly add the border widths of the containing element to the offsets of fixed elements
 */
function getTrueOffsetsOfFixedElement(element: HTMLElement): DOMRect {
  const offsetRect = getDesignatedOffsets(element);

  const isBlink = /webkit\/537\.36.+chrome\/(?!27)[\w\.]+/i.test(navigator.userAgent);
  const isWebkit = /webkit\/[\w\.]+/i.test(navigator.userAgent);
  const engineAddsContainerBorders = isBlink || isWebkit;
  if (!engineAddsContainerBorders) {
    return offsetRect;
  }

  const containingElement = getContainingAncestorOfFixedElement(element);
  if (!containingElement) {
    return offsetRect;
  }

  const containingStyle = getComputedStyle(containingElement);
  offsetRect.x -= Number.parseFloat(containingStyle.borderLeftWidth.split("p")[0]);
  offsetRect.y -= Number.parseFloat(containingStyle.borderTopWidth.split("p")[0]);

  return offsetRect;
}

function getOffsetsBeyondBodyContentAddedByBrowser(
  trueOffsetParent: Element | null,
  isChildAbsolute: boolean
): DOMRect {
  const trueOffsetIsBody = areSameNode(trueOffsetParent, document.body);
  const trueOffsetParentIsRoot = areSameNode(trueOffsetParent, document.documentElement);
  const trueOffsetParentIsViewport = !trueOffsetParent;
  const isGecko = /rv\:[\w\.]{1,9}\b.+gecko/i.test(navigator.userAgent);

  const bodyBorderAddedForBody = trueOffsetIsBody && !isGecko;
  const bodyBorderAddedForRoot = trueOffsetParentIsRoot && !(isGecko && !isChildAbsolute);
  const bodyBorderAddedForViewport = trueOffsetParentIsViewport && !(isGecko && !isChildAbsolute);
  const bodyMarginAdded = trueOffsetParentIsViewport || trueOffsetParentIsRoot;
  const rootPaddingAdded = trueOffsetParentIsViewport || trueOffsetParentIsRoot;
  const rootBorderAdded = trueOffsetParentIsViewport || trueOffsetParentIsRoot;
  const rootMarginAdded = trueOffsetParentIsViewport && isChildAbsolute;

  const offsetRect = new DOMRect();
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);

  if (bodyBorderAddedForBody || bodyBorderAddedForRoot || bodyBorderAddedForViewport) {
    offsetRect.x += Number.parseFloat(bodyStyle.borderLeftWidth.split("p")[0]);
    offsetRect.y += Number.parseFloat(bodyStyle.borderTopWidth.split("p")[0]);
  }
  if (bodyMarginAdded) {
    offsetRect.x += Number.parseFloat(bodyStyle.marginLeft.split("p")[0]);
    offsetRect.y += Number.parseFloat(bodyStyle.marginTop.split("p")[0]);
  }
  if (rootPaddingAdded) {
    offsetRect.x += Number.parseFloat(rootStyle.paddingLeft.split("p")[0]);
    offsetRect.y += Number.parseFloat(rootStyle.paddingTop.split("p")[0]);
  }
  if (rootBorderAdded) {
    offsetRect.x += Number.parseFloat(rootStyle.borderLeftWidth.split("p")[0]);
    offsetRect.y += Number.parseFloat(rootStyle.borderTopWidth.split("p")[0]);
  }
  if (rootMarginAdded) {
    offsetRect.x += Number.parseFloat(rootStyle.marginLeft.split("p")[0]);
    offsetRect.y += Number.parseFloat(rootStyle.marginTop.split("p")[0]);
  }

  return offsetRect;
}

/**
 * returns a DOMRect representing the offset from the element to its direct parent.
 * factors in scrolling, and ignores transforms
 *
 * note: adding any properties to root that makes it a containing block (e.g. transform)
 * is unsupported, and may lead to undefined behavior, particularly on firefox
 *
 * ---
 *
 * currently, offsets are of type long, so subpixel offset information isn't available.
 * it would be great if subpixel offsets were added to the api somehow
 */
export function getOffsetsFromDirectParent(element: HTMLElement): DOMRect {
  const offsetRect = getTrueOffsets(element);
  const directParent = element.parentElement;

  // element and its parent share a designated offset parent
  if (directParent && areSameNode(element.offsetParent, directParent.offsetParent)) {
    const directParentOffsetRect = getTrueOffsets(directParent);
    offsetRect.x -= directParentOffsetRect.x;
    offsetRect.y -= directParentOffsetRect.y;

    const directParentStyle = getComputedStyle(directParent);
    offsetRect.x -= Number.parseFloat(directParentStyle.borderLeftWidth.split("p")[0]);
    offsetRect.y -= Number.parseFloat(directParentStyle.borderTopWidth.split("p")[0]);
  }

  // factor in scrolling
  offsetRect.x -= element.scrollLeft;
  offsetRect.y -= element.scrollTop;

  return offsetRect;
}

/**
 * returns a DOMRect representing the offset from the element to its direct parent,
 * plus the parent's border widths
 */
export function getOffsetsFromDirectParentOrigin(element: HTMLElement): DOMRect {
  const offsetRect = getOffsetsFromDirectParent(element);
  if (element.parentElement) {
    const directParentStyle = getComputedStyle(element.parentElement);
    offsetRect.x += Number.parseFloat(directParentStyle.borderLeftWidth.split("p")[0]);
    offsetRect.y += Number.parseFloat(directParentStyle.borderTopWidth.split("p")[0]);
  }
  return offsetRect;
}

/**
 * a nicer wrapper to element.isSameNode(), with null specifically refering to viewport / initial containing block
 */
export function areSameNode(a: Element | null, b: Element | null): boolean {
  if (!a && !b) return true;
  return !!a?.isSameNode(b);
}

// INTENDED OFFSETS FOR INTENDED OFFSETPARENT

/** returns the element's designated offsets as a DOMRect, with a potential correction for fixed elements */
export function getIntendedOffsets(element: HTMLElement): DOMRect {
  const style = getComputedStyle(element);
  if (style.position === "fixed") {
    return getTrueOffsetsOfFixedElement(element);
  }
  return new DOMRect(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
}

/**
 * returns the ancestor that the element's designated offsetLeft and offsetTop are relative to, or
 * returns null for the initial containing block. for fixed elements, returns the nearest ancestor
 * that creates a containing block, if one exists.
 *
 * warning: the designated offsets still aren't guaranteed to align with the intendedOffsetParent's padding edge
 *
 * (the initial containing block is either the viewport (for continuous media) or the page area (for paged media))
 *
 * note: browsers often designate body as the offset parent but provide offsetLeft and offsetTop values relative to
 * either the root element or the initial containing block
 *
 * note: for fixed elements, the specs waste the offsetParent property when it could be useful for getting
 * the containing block element
 */
export function getIntendedOffsetParent(element: HTMLElement): Element | null {
  const style = getComputedStyle(element);
  if (style.position === "fixed") {
    return getContainingAncestorOfFixedElement(element);
  }

  const offsetParent = element.offsetParent;
  if (!areSameNode(offsetParent, document.body)) {
    return offsetParent;
  }

  const isChildAbsolute = style.position === "absolute";
  if (willBrowserUseAsTrueOffsetParent(document.body, isChildAbsolute)) {
    return document.body;
  }

  if (willBrowserUseAsTrueOffsetParent(document.documentElement, isChildAbsolute)) {
    return document.documentElement;
  }

  return null;
}

function willBrowserUseAsTrueOffsetParent(element: HTMLElement, isChildAbsolute: boolean): boolean {
  const style = getComputedStyle(element);

  if (style.position !== "static") {
    return true;
  }

  const isBlink = /webkit\/537\.36.+chrome\/(?!27)[\w\.]+/i.test(navigator.userAgent);
  const isWebkit = /webkit\/[\w\.]+/i.test(navigator.userAgent);

  const browserIgnoresContainingBlock = (isBlink || isWebkit) && !isChildAbsolute;
  if (browserIgnoresContainingBlock) {
    return false;
  }

  return doesElementCreateContainingBlock(element);
}

/**
 * an element creates a containing block if any of the following are true:
 * | it has transform, perspective, filter, or backdrop-filter values other than none
 * | it has a will-change value of transform, perspective, or filter
 * | it has a contain value of content, layout, paint, or strict
 */
function doesElementCreateContainingBlock(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  const backdropFilter = style.getPropertyValue("backdropFilter");

  return (
    style.transform !== "none" ||
    style.perspective !== "none" ||
    style.filter !== "none" ||
    (backdropFilter !== "" && backdropFilter !== "none") ||
    /filter|perspective|transform/i.test(style.willChange) ||
    /content|layout|paint|strict/i.test(style.contain)
  );
}

/** returns the nearest ancestor that creates a containing block, if one exists */
function getContainingAncestorOfFixedElement(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent && !doesElementCreateContainingBlock(parent)) {
    parent = parent.parentElement;
  }
  return parent;
}

// DESIGNATED OFFSETS

/** returns the element's designated offsets as a DOMRect */
function getDesignatedOffsets(element: HTMLElement): DOMRect {
  return new DOMRect(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
}
