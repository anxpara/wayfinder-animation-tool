<h1 align="center">
  <a href="wayfinder.anxpara.com"><img src="https://i.imgur.com/H5KVcwM.jpg" width="250"/></a>
  <br>
  Wayfinder Animation Tool
</h1>
<h4 align="center"> EARLY BETA | Animate the web intuitively | <a href="https://wayfinder.anxpara.com" target="_blank">Demo</a> | <a href="https://discord.gg/qTpEwE8q6k" target="_blank">Discord</a> </h4>

### Download

```bash
$ npm install wayfinder-animation-tool --save
```

## What is Wayfinder?

Wayfinder is a super lightweight animation tool that allows you to use the predictability(TM lol) and responsiveness of html and scss/sass to place waypoint divs throughout your site and effortlessly animate traveler divs between them. 

WAT can be used with any animation framework, but is designed with AnimeJs in mind for instant integration.

* Visualize and test your waypoints and travelers in real-time while tinkering with browser dev tools
* Escape old paradigms for targeting both   desktop and mobile together
* Lift off from waypoints with additional relative animations and transforms, if desired
* Easily incorporate wayfinder into an existing site (theoretically, atm), since any old div can be a waypoint with no modification

WAT is written in Typescript because TS is superior, although TS compiles down to JS, if you must use it. A couple required scss mixins are provided for a quick start, but their properties can be manually copied if you're not using scss/sass. Wat has zero dependencies.

## How it works

1. Throw waypoint divs onto your site, using whatever fancy (or simple) html, scss, transforms, etc. you'd like.
2. Add an invisible wayfinder div at a common ancestor of those waypoints.
3. Add traveler divs to the wayfinder. The traveler divs are only wrappers for the actual content.
4. Load elements into Typescript and create respective waypoint objects.
5. Call sendToWaypointAnimParams(waypoint, wayfinder) to get all the parameters necessary to animate travelers to waypoints.
6. Plug the parameters straight into an AnimeJS animation function using the spread operator.
7. Profit

Wayfinder's simplicity makes it easy to use however you'd like. In addition, several optional features and scss mixins are provided that add extra power and also take care of common headaches

1. Stash...
2. Additional scss mixins...
3. Logging...

## Hello potion seller
#### <a href="https://codepen.io/anxpara/pen/wveVQJm" target="_blank">(View and edit on Codepen)</a>

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
  border: dashed 0.2em; // travelers' content divs should match any border widths on waypoints.
  // outline: dashed 0.2em; // outlines don't affect size or position, so they don't need to match
}

.potion-shop,
.battlefield {
  // margins are useful for waypoints, but generally unnecessary on travelers and may lead to wonky effects
  margin: 1.26em; 
  p { text-align: end; }
}
.potion-shop { color: green; }
.battlefield {
  color: red;
  transform: translateY(-5em) rotate(45deg);
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

let psParams = sendToWaypointAnimParams(potionShopWaypoint, wayfinderElement);
let bfParams = sendToWaypointAnimParams(battlefieldWaypoint, wayfinderElement);

function animate(): void {
  anime.set("#knight-traveler", {
    ...psParams
  });

  anime({
    targets: "#knight-traveler",
    ...bfParams,
    delay: 1000,
    easing: "easeInOutQuart"
  });
}

animate();
setInterval(animate, 3000);
```
