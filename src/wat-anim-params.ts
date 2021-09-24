/**
 * WatAnimParams is a subset of AnimeJs' AnimeParams.
 * This means integration with AnimeJs is as simple as
 * using Javascript's object spread operator:
 *
 *  anime({
 *    targets: '.traveler',
 *    ...endToWaypointAnimParams(...)
 *  });
 *
 * however, none of these parameters are unique to AnimeJs, and
 * would still be useful with other animation libraries,
 * albeit some extra integration work may be needed.
 *
 * --
 *
 * all dimensional params are in terms of pixels
 *
 * order of transforms matters. if you translate after scale,
 * then the translation gets scaled as well
 *
 * the 'complete' callback will never be filled when using
 * wayfinder. it's only filled when using the smart scaling tool
 */
export type WatAnimParams = {
  width?: number;
  height?: number;
  matrix?: string;
  matrix3d?: string;
  translateX?: number;
  translateY?: number;
  scale?: number;
  complete?: { (): void } /** only filled by smart scaling, not wayfinder */;
};
