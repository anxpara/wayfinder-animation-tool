<!-- prettier-ignore-start -->
<h1 align="center">
  <font size="5">Wayfinder Animation Tool</font>
</h1>
<h3 align="center"> BETA | Animate the web intuitively | <a href="https://discord.gg/qTpEwE8q6k" target="_blank">Discord</a> </h3>
<h4 align="center"> Demos: <a href="https://codepen.io/anxpara/pen/wveVQJm" target="_blank">Hello potion seller</a> | <a href="https://codepen.io/anxpara/pen/rNzBgOz" target="_blank">Splash</a> | <a href="https://codepen.io/anxpara/pen/poWQEOG" target="_blank">Conduit</a> | <a href="https://codepen.io/anxpara/pen/dyVVbqg" target="_blank">Trialgrounds</a> </h4>

<div align="center"><img width="460px" src="https://github.com/anxpara/wayfinder-animation-tool/blob/main/documentation/assets/img/potion-seller-demo-gif.gif"></div>

### Download


```bash
$ npm install wayfinder-animation-tool --save
```

## What is Wayfinder?

Wayfinder is a light-weight animation tool for JS/Typescript that projects elements onto a floating "wayfinder" div, allowing you to treat them as waypoints. Animate "traveler" divs to and from waypoints, lay out your animations using the deterministic and responsive behavior of html and css, and animate desktop and mobile together with ease.

WAT can be used with any animation framework, but is designed with AnimeJs in mind for instant integration.

* Easily incorporate wayfinder into an existing site, since any element can be a waypoint with no modification
* Modify and test your waypoints and travelers in real-time while tinkering with browser dev tools
* Target desktop and mobile together with ease
* Lift off from waypoints with additional relative animations and transforms
* Animate the web intuitively

WAT is written in Typescript because TS is superior, although TS compiles down to JS if you prefer. A couple required scss mixins are provided in wayfinder.scss (or as classes in wayfinder.css). WAT only has one dependency: glMatrix.

</br>
<div align="center">
  <img src="https://github.com/anxpara/wayfinder-animation-tool/blob/main/documentation/assets/img/timeline-swatch-demo-gif.gif">
</div>
</br>

## How it works

1. Throw waypoint divs onto your site using whatever simple or fancy html, css, transforms, etc. you'd like.
2. Add an invisible wayfinder div at a common ancestor of those waypoints using provided mixin. If using 3d transforms, then add an additional mixin to fix an ancient bug in safari
3. Add traveler divs to the wayfinder using provided mixin. The traveler divs are generally only wrappers for actual content
4. Load elements into Typescript or Javascript and create respective waypoint objects
5. Call sendToWaypointAnimParams(waypoint, wayfinderElement) to get all the parameters necessary to animate travelers to a waypoint
6. Plug the parameters straight into an AnimeJS animation function using the spread operator
7. Animate and tinker

Here's what the simplest wayfinder animation might look like...

<h2>Hello potion seller</h2>
<a href="https://codepen.io/anxpara/pen/wveVQJm" target="_blank">(View and edit on Codepen)</a>
<img width="502px" src="https://github.com/anxpara/wayfinder-animation-tool/blob/main/documentation/assets/img/potion-seller-demo-gif.gif">

Html

```html
<div id="ps-waypoint" class="square-card potion-shop"><p>Potion shop</p></div>
<div id="bf-waypoint" class="square-card battlefield"><p>Battlefield</p></div>

<div class="wayfinder">
  <!-- traveler divs are generally only wrappers for actual content -->
  <div id="knight-traveler" class="traveler">
    <div class="square-card knight">
      <p>Knight</p>
      <p>"Hello, potion seller. I am going into battle, and I want only your strongest potions."</p>
    </div>
  </div>
</div>
```

SCSS

```scss
@use "~node_modules/wayfinder-animation-tool/dist/wayfinder.scss" as wat;
.wayfinder { @include wat.wayfinder; }
.traveler { @include wat.traveler; }

.square-card {
  width: 18.8em;
  height: 18.8em;
  padding: 0.63em;
  
  /* there are 3 ways to match traveler and waypoint border widths (or full border styling):
  *  1. if the border is defined by the waypoint's lone child, then match the
  *     traveler's child's size and border-width to those of the waypoint's child 
  *  2. if the border is defined by the waypoint itself, then match the traveler's
  *     child's size & border-width to those of the waypoint. (seen here, square-card 
  *     is used for both)
  *  3. use wayfinder's css copy feature to copy the waypoint's border-width (or border) directly
  *     to the traveler element (and optionally border-style and border-color)
  */
  border: dashed 0.2em;
}

.potion-shop,
.battlefield {
  // margins are useful for waypoints, but generally unnecessary on travelers and may lead to wonky effects
  margin: 1.26em;
  float: left;
  p { text-align: end; }
}
.potion-shop { color: green; }
.battlefield {
  color: red;
  transform: rotate(45deg);
}

.knight {
  color: blue;
  border-style: solid;
  vertical-align: bottom;
}
```

Typescript

```typescript
import { sendToWaypointAnimParams, Waypoint } from 'wayfinder-animation-tool';
import anime from 'animejs';

let wayfinderElement = document.getElementById('wf')!;
let potionShopElement = document.getElementById('ps-waypoint')!;
let battlefieldElement = document.getElementById('bf-waypoint')!;

let potionShopWaypoint: Waypoint = {
  name: 'Potion shop',
  element: potionShopElement,
};
let battlefieldWaypoint: Waypoint = {
  name: 'Battlefield',
  element: battlefieldElement,
};

function setup(): void {
  let psParams = sendToWaypointAnimParams(potionShopWaypoint, wayfinderElement);
  anime.set("#knight-traveler", {
    ...psParams,
    opacity: 1
  });
  setTimeout(animate, 1000);
}

function animate(): void {
  let bfParams = sendToWaypointAnimParams(battlefieldWaypoint, wayfinderElement);
  anime({
    targets: "#knight-traveler",
    ...bfParams,
    easing: "easeInOutQuart"
  });
  setTimeout(setup, 3000);
}

setup();
```
</br>

## **Additional features**

Wayfinder's simplicity makes it easy to use however you'd like, Wayfinder tries to impose as little as possible. In addition, several optional features and scss mixins are provided that add extra power and also take care of common headaches.

### Css copying

* Most css properties can be copied directly from the waypoint to the traveler using an optional 3rd parameter. Some properties can't be animated and are only valid for anime.set(). Some properties may cause large performance hits if copied and animated, e.g. properties that change the layout. Small examples:

```typescript
// match to waypoint1's font-size and border when setting traveler1
anime.set(traveler1Id, { ...sendToWaypointAnimParams(waypoint1, wayfinderElement, ['font-size', 'border']) });

// match to waypoint2's color when animating traveler1
anime({ targets: traveler1Id, ...sendToWaypointAnimParams(waypoint2, wayfinderElement, ['color', 'border-color']) });
```

### Bonus scss mixins

* Optional mixins can be found in wayfinder.scss (see file for full documentation)...
* Enable horizontal clipping and disable horizontal scrolling--especially useful on mobile
* Fix an ancient 3d rendering bug in safari/webkit
* Reinstate pointer event pass-through for transparent travelers that have been transformed
* Quickly add nameplates to waypoints for easy labeling


### Stash

* Add an optional stash to a waypoint. Throw in whatever you want, and use it later when animating or controlling behavior. For example...

```typescript
class ColorSquareStash {
  title: string = '';
  color: string = '';
  scale: string = '';
  floatX: string = '';
  floatY: string = '';
  currentButtonAnim: AnimeInstance | undefined;
}
let expanderWp: Waypoint<ColorSquareStash> = {
    name: 'expander',
    element: document.getElementById('expander-wp'),
    stash: {
      title: 'darkcyan',
      color: '#1A8C8A',
      scale: '1.18',
      floatX: '2em',
      floatY: '0.2em',
      currentButtonAnim: undefined,
    },
};
function summonColorSquareToWaypoint(destWp: Waypoint<ColorSquareStash>): void {
  anime({
    targets: '.color-square-traveler',
    ...sendToWaypointAnimParams(destWp, wayfinderElement),
    duration: durationMs,
    easing: 'easeOutQuint',

    color: destWp.stash.color,
    scale: destWp.stash.scale,
    translateX: destWp.stash.floatX,
    translateY: destWp.stash.floatY,
    changeBegin: () => updateColorSquareText(destWp.stash.title, textChangeDelayMs),
  });
}
```

### Logging

* A default logger is provided which will print useful data like the resulting animParams, the waypoint's computed css style, the waypoint itself, etc.

```typescript
let riserWp = {
    name: 'riser',
    loggingEnabled: true,
};
```

<div align="center">  
  <img src="https://raw.githubusercontent.com/anxpara/wayfinder-animation-tool/main/documentation/assets/img/logging-example-output.png">
</div>

* Not pretty enough? You can provide your own logging callback which takes the default logging data

```typescript
function customPrettyLogger(logData: SendResultsLogData): void {
  console.log('Sending to waypoint ' + logData.waypoint.name + '. Params:');
  console.log(logData.animParamResults);
}

let riserWp = {
    loggingEnabled: true,
    customSendResultsLogger: customPrettyLogger,
};
```
</br>
</br>

<div align="center"><a href="https://wayfinder.anxpara.com"><img src="https://i.imgur.com/H5KVcwM.jpg" width="300"/></a></div>

<h1 align="center">Support the development of Wayfinder</h1>

#### All support is greatly appreciated, here are some ways you can help out:

* Help beta test by making cool animations and sites. I'm curious to see what people make, and what ways people find to use WAT
* Join the WAT discord: <a href="https://discord.gg/qTpEwE8q6k">https://discord.gg/qTpEwE8q6k</a>
* Share Wayfinder with your friends
* Submit <a href="https://github.com/anxpara/wayfinder-animation-tool/issues">bug reports</a>
* Submit PRs if you'd like to contribute to the project
* Donate to my Ko-fi: <a href="https://ko-fi.com/anxpara">https://ko-fi.com/anxpara</a>

<!-- prettier-ignore-end -->
