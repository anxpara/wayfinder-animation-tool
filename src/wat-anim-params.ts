/**
 * WatAnimParams is a subset of AnimeJs' AnimeParams.
 * This means integration with AnimeJs is as simple as
 * using the object spread operator:
 *
 *  anime({
 *    targets: '.traveler',
 *    ...sendToWaypointAnimParams(waypoint, wayfinderElement)
 *  });
 *
 * however, none of these parameters are unique to AnimeJs, and
 * would still be useful with other animation libraries,
 * albeit some extra integration work may be needed.
 *
 * --
 *
 * wayfinder bakes all translations and top/left positionings into the matrix param,
 * which means after you add the WatAnimParams to the anime({}) function, you can
 * add additional translateX, translateY, translateZ, and scale params for relative effects
 *
 * order of transforms matters. if you translate after scale, then the translation
 * gets scaled as well
 */
export type WatAnimParams = {
  width?: string;
  height?: string;
  matrix?: string;
  matrix3d?: string;
};
