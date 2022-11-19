<!-- prettier-ignore-start -->

</br>
<div align="center">
  <a href="https://wayfinderanimationtool.com" target="_blank">
    <img width="80%" src="https://raw.githubusercontent.com/anxpara/wayfinder-animation-tool/main/assets/wayfinder-logo/output/wayfinder-logo-name-transparent.png"/>
  </a>
</div>

<h3 align="center"> BETA | Animate the web intuitively | <a href="https://discord.gg/qTpEwE8q6k" target="_blank">Discord</a> </h3>
<h5 align="center"> Demos: <a href="https://codepen.io/anxpara/pen/wveVQJm" target="_blank">Hello potion seller</a> | <a href="https://codepen.io/anxpara/pen/rNzBgOz" target="_blank">Splash</a> | <a href="https://codepen.io/anxpara/pen/poWQEOG" target="_blank">Conduit</a>
</h5>

<h1 align="center">
  <font size="2"><a href="https://wayfinderanimationtool.com" target="_blank">https://wayfinderanimationtool.com</a></font>
</h1>

```bash
$ npm install wayfinder-animation-tool --save
```

Wayfinder Animation Tool is a light-weight library for JS/Typescript that augments your favorite animation engine (e.g. Anime.JS, Motion One, and more).

Wayfinder offers a new approach to web animation: treat elements like waypoints, project them onto a wayfinder div, then animate travelers to and from those projections with ease. This approach has multiple benefits:

* waypoints can take advantage of responsive design so that your animations look great on any device or screen size
* animations can span across the dom, opening up many possibilities
* waypoints and animations can be edited on-the-fly by tinkering in dev tools
* travelers and waypoints can have many-to-many relationships
* travelers are always in a valid location, so pausing or redirecting mid-animation works naturally without hiccups
* Wayfinder's simplicity and ease-of-use gives you a high level of control over your animations

The main drawback of this approach is that a traveler won't inherently react to layout changes when its waypoint does--it depends on the location of the wayfinder.
* this problem can be solved by embedding another wayfinder closer to the waypoint so that it's subject to the same responsive styling / layout changes, and then warping the traveler to the embedded wayfinder upon arrival
* this technique is not always needed

<h2>Hello potion seller</h2>
<img width="460px" src="https://i.imgur.com/cy7xfUo.gif">
<h4><a href="https://codepen.io/anxpara/pen/wveVQJm" target="_blank">(View and edit on Codepen)</a></h4>

```html
<div id="potion-shop" class="square-card potion-shop">
  <h2>Potion shop</h2>
</div>
<div id="battlefield" class="square-card battlefield">
  <h2>Battlefield</h2>
</div>

<div id="primary-wayfinder" class="primary-wayfinder">
  <div id="knight-traveler" class="knight-traveler">
    <div id="knight" class="square-card knight">
      <h2>Knight</h2>
      <p>
        "Hello, potion seller. <br /><br />
        I am going into battle, and I want only your
        <i>strongest</i> potions."
      </p>
    </div>
  </div>
</div>
```

```scss
@use "~node_modules/wayfinder-animation-tool/dist/wayfinder.scss" as wat;
.primary-wayfinder {
  @include wat.wayfinder;
}
.knight-traveler {
  @include wat.traveler;
}
// Wayfinder mixins also available as classes in wayfinder.css, remaining styling omitted...
```

```typescript
import anime from 'animejs';
import { animate } from "motion"
import { projectWpToWayfinder, Waypoint } from 'wayfinder-animation-tool';

let wayfinderElement: HTMLElement = document.getElementById("primary-wayfinder")!;

let potionShopWp: Waypoint = {
  name: "potion-shop",
  element: document.getElementById("potion-shop")!
};
let battlefieldWp: Waypoint = {
  name: "battlefield",
  element: document.getElementById("battlefield")!
};

// if using AnimeJs, integration is as simple as using the spread operator:
anime({
  targets: '#knight-traveler',
  duration: 1000,
  ...projectWpToWayfinder(potionShopWp, wayfinderElement),
});

// if using Motion One, request the matrix3d property be returned via the transform property:
animate('#knight-traveler', {
  ...projectWpToWayfinder(battlefieldWp, wayfinderElement, ['transform']),
}, {
  duration: 1,
});

/**
 * projectWpToWayfinder simply calculates the fontSize, width/height,
 * and matrix3d needed to match a traveler in the given wayfinder to the waypoint
 *
 * the optional computedCssPropsToCopy arg lets you copy computed css properties.
 * if 'transform' is included, then the matrix3d param is returned via the transform property
 */ 
```

</br>
</br>

<div align="center"><a href="https://wayfinderanimationtool.com"><img src="https://i.imgur.com/n0pQ2lc.png"/></a></div>

<h1 align="center">Support the development of Wayfinder</h1>

#### All support is greatly appreciated, here are some ways you can help out:

* Help beta test by making cool animations and sites
* Join the Wayfinder <a href="https://discord.gg/qTpEwE8q6k">discord</a>
* Submit <a href="https://github.com/anxpara/wayfinder-animation-tool/issues">bug reports</a>
* Buy a coffee for me <a href="https://ko-fi.com/anxpara">Ko-fi</a>

<3 anxpara

<!-- prettier-ignore-end -->
