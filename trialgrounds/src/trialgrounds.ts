import anime from "animejs";
import { sendToWaypointAnimParams, Waypoint } from "wayfinder-animation-tool";

let standaloneTrialgrounds: HTMLDivElement | null = null;
let standaloneWayfinderElement: HTMLDivElement | null = null;
let standaloneWaypointTemplate: HTMLElement | null = null;
let nestedTrialgrounds: HTMLDivElement | null = null;
let nestedWayfinderElement: HTMLDivElement | null = null;
let nestedWaypointContainerTemplate: HTMLElement | null = null;
let copyTrialgrounds: HTMLDivElement | null = null;
let copyWayfinderElement: HTMLDivElement | null = null;
let copyWaypointTemplate: HTMLElement | null = null;
let nestedWayfinderTrialgrounds: HTMLDivElement | null = null;
let nestedWayfinderHubTemplate: HTMLElement | null = null;
let testTravelerTemplate: HTMLElement | null = null;

// prettier-ignore
const standaloneWaypointNames: string[] = ['control', 'absolute', 'font-size', 'font-size-rem', 'size', 'relative', 'translate', 'rotate-origin-0', 'rotate-origin-mid',
                                           'rotate-3d', 'post-translate-down', 'post-rotate', 'overflowing-content', 'x-clipping'];
// prettier-ignore
const nestedWaypointNames: string[] = ['nested-wp-control', 'nested-absolute',  'nested-font-size', 'nested-font-size-rem', 'nested-rem-reset', 'nested-offset','nested-relative',
                                       'nested-rotates-0', 'nested-rotates-center', 'nested-diff-origin-control', 'diff-origin-rotate', 'diff-origin-rotates',
                                       'countering-3d-rotates', 'countering-preserve3d-rotates', 'nested-3d-complicated',  'nested-preserve3d-complicated',
                                       'scroll', 'sticky', 'double-preserve3d', 'revert-preserve3d'];
// prettier-ignore
const copyWaypointNames: string[] = ['copy-bg', 'copy-border', 'copy-border-per-side', 'copy-border-box-sizing', 'copy-text-align'];
// prettier-ignore
const nestedWayfinderWaypointNames: string[] = ['nest-wf-in-scroll', 'nest-in-font-size'];

let hardcodedWaypointNames: string[] = ["sticky", "double-preserve3d", "revert-preserve3d"];
let hardcodedTravelerNames: string[] = [];
let waypointsByName = new Map<string, Waypoint>();
let autoplayInterval: NodeJS.Timeout | null = null;

const cssCopyLists = new Map<string, string[]>();
cssCopyLists.set("copy-bg", ["background-color", "border-style", "border-width"]);
cssCopyLists.set("copy-border", ["border-style", "border-width"]);
cssCopyLists.set("copy-border-per-side", [
  "border-style",
  "border-left-width",
  "border-right-width",
  "border-top-width",
  "border-bottom-width",
]);
cssCopyLists.set("copy-border-box-sizing", ["border-style", "border-width"]);
cssCopyLists.set("copy-text-align", ["text-align", "border-style", "border-width"]);

export function init() {
  loadElements();
  spawnWaypoints();
  loadWaypoints();
  spawnTravelers();
  setTravelers();
  startAnimatedTests();
}

function loadElements(): void {
  standaloneTrialgrounds = document.getElementById("standalone-trialgrounds")! as HTMLDivElement;
  standaloneWaypointTemplate = document.getElementById("standalone-waypoint-template")!;
  standaloneWayfinderElement = document.getElementById("standalone-wayfinder")! as HTMLDivElement;

  nestedTrialgrounds = document.getElementById("nested-trialgrounds")! as HTMLDivElement;
  nestedWaypointContainerTemplate = document.getElementById("nested-container-template")!;
  nestedWayfinderElement = document.getElementById("nested-wayfinder")! as HTMLDivElement;

  copyTrialgrounds = document.getElementById("copy-trialgrounds")! as HTMLDivElement;
  copyWaypointTemplate = document.getElementById("copy-waypoint-template")!;
  copyWayfinderElement = document.getElementById("copy-wayfinder")! as HTMLDivElement;

  nestedWayfinderTrialgrounds = document.getElementById("nested-wayfinder-trialgrounds")! as HTMLDivElement;
  nestedWayfinderHubTemplate = document.getElementById("nested-wayfinder-hub-template")!;

  testTravelerTemplate = document.getElementById("t-test-traveler-template")!;
}

function spawnWaypoints(): void {
  spawnStandaloneWaypoints();
  spawnNestedWaypoints();
  spawnCopyWaypoints();
  spawnNestedWayfinders();
}

function spawnStandaloneWaypoints(): void {
  standaloneWaypointNames.reverse();
  standaloneWaypointNames.forEach((name) => {
    if (hardcodedWaypointNames.includes(name)) {
      return;
    }

    let testWaypoint = standaloneWaypointTemplate!.cloneNode(true) as HTMLElement;
    testWaypoint.id = "wp-" + name;
    testWaypoint.firstElementChild!.innerHTML = name;

    standaloneTrialgrounds!.prepend(testWaypoint);
    anime.set("#wp-" + name, {
      display: "block",
      class: name + "-waypoint",
    });
  });
}

function spawnNestedWaypoints(): void {
  nestedWaypointNames.reverse();
  nestedWaypointNames.forEach((name) => {
    if (hardcodedWaypointNames.includes(name)) {
      return;
    }

    let testContainer = nestedWaypointContainerTemplate!.cloneNode(true) as HTMLElement;
    nestedTrialgrounds!.prepend(testContainer);

    // container
    testContainer.id = name + "-container";
    anime.set("#" + name + "-container", {
      display: "block",
      class: "nested-container " + name + "-container",
    });

    // waypoint
    let nestedWaypoint = testContainer.firstElementChild!;
    nestedWaypoint.id = "wp-" + name;
    nestedWaypoint.firstElementChild!.innerHTML = name;
    anime.set("#wp-" + name, {
      display: "block",
      class: "nested-waypoint " + name + "-waypoint",
    });
  });

  if (nestedWaypointNames.includes("scroll")) {
    let scrollContainer = document.getElementById("scroll-container")! as HTMLDivElement;
    scrollContainer.scrollBy(70, 50);
  }

  if (nestedWaypointNames.includes("sticky")) {
    let stickyRootContainer = document.getElementById("sticky-root")! as HTMLDivElement;
    stickyRootContainer.scrollBy(0, 200);
  }
}

function spawnCopyWaypoints(): void {
  copyWaypointNames.reverse();
  copyWaypointNames.forEach((name) => {
    if (hardcodedWaypointNames.includes(name)) {
      return;
    }

    let testWaypoint = copyWaypointTemplate!.cloneNode(true) as HTMLElement;
    testWaypoint.id = "wp-" + name;

    let text = name;
    if (name == "copy-bg") text += " failed";
    testWaypoint.firstElementChild!.innerHTML = text;

    copyTrialgrounds!.prepend(testWaypoint);
    anime.set("#wp-" + name, {
      display: "block",
      class: name + "-waypoint",
    });
  });
}

function spawnNestedWayfinders(): void {
  nestedWayfinderWaypointNames.reverse();
  nestedWayfinderWaypointNames.forEach((name) => {
    if (hardcodedWaypointNames.includes(name)) {
      return;
    }

    // hub
    let nestedWfHub = nestedWayfinderHubTemplate!.cloneNode(true) as HTMLElement;
    nestedWayfinderTrialgrounds!.prepend(nestedWfHub);
    nestedWfHub.id = name + "-hub";
    anime.set("#" + name + "-hub", {
      display: "block",
      class: "nested-wayfinder-hub " + name + "-hub",
    });

    // container
    let nestedContainer = nestedWfHub.firstElementChild!;
    nestedContainer.id = name + "-container";

    // waypoint
    let nestedWaypoint = nestedContainer.firstElementChild!;
    nestedWaypoint.id = "wp-" + name;
    nestedWaypoint.firstElementChild!.innerHTML = name;
    anime.set("#wp-" + name, {
      display: "block",
      class: "nested-wayfinder-waypoint " + name + "-waypoint",
    });

    // wayfinder
    let nestedWayfinder = nestedContainer.children[1]!;
    nestedWayfinder.id = "wf-" + name;
  });
}

function loadWaypoints(): void {
  standaloneWaypointNames.forEach((name) => {
    loadWaypoint(name, standaloneWayfinderElement!);
  });

  nestedWaypointNames.forEach((name) => {
    loadWaypoint(name, nestedWayfinderElement!);
  });

  copyWaypointNames.forEach((name) => {
    loadWaypoint(name, copyWayfinderElement!);
  });

  nestedWayfinderWaypointNames.forEach((name) => {
    loadWaypoint(name, document.getElementById("wf-" + name)!);
  });
}

function loadWaypoint(name: string, wayfinder: HTMLElement): void {
  let wp = {
    name,
    element: document.getElementById("wp-" + name)!,
    stash: { wf: wayfinder },
    loggingEnabled: true,
  };
  waypointsByName.set(name, wp);
}

function spawnTravelers(): void {
  waypointsByName.forEach((wp) => {
    if (hardcodedTravelerNames.includes(wp.name)) {
      return;
    }
    let testTraveler = testTravelerTemplate!.cloneNode(true) as HTMLElement;
    testTraveler.id = "t-test-traveler-" + wp.name;
    testTraveler.classList.add(wp.name + "-traveler");
    testTraveler.firstElementChild!.innerHTML = wp.name;
    wp.stash!.wf.appendChild(testTraveler);
  });
}

function sendTestTravelerToWpParams(wp: Waypoint): any {
  let cssCopyProperties = cssCopyLists.get(wp.name) || ["border-style", "border-width"];
  let params = sendToWaypointAnimParams(wp, wp.stash!.wf, cssCopyProperties);

  let translateX = "0";
  let translateY = "0";
  let rotate = "0";

  if (wp.name == "rotate-mid-w-diff-size") {
    params.width = "12em";
    params.height = "2em";
  }

  if (wp.name == "x-clipping") {
    translateX = "2.5em";
    translateY = "3em";
  }

  if (wp.name == "post-translate-down") {
    translateX = "0.7em";
    translateY = "0.7em";
  }

  if (wp.name == "post-rotate") {
    rotate = "-15";
  }

  return {
    ...params,
    display: "block",
    translateX,
    translateY,
    rotate,
  };
}

function setTravelers(): void {
  waypointsByName.forEach((wp) => {
    anime.set("#t-test-traveler-" + wp.name, {
      ...sendTestTravelerToWpParams(wp),
    });
  });
}

function animateTravelers(): void {
  waypointsByName.forEach((wp) => {
    anime({
      targets: "#t-test-traveler-" + wp.name,
      duration: 300,
      easing: "spring(1, 100, 10, 0)",
      ...sendTestTravelerToWpParams(wp),
    });
  });
}

function startAnimatedTests(): void {
  anime({
    targets: "#nest-in-font-size-container",
    duration: 4000,
    easing: "linear",
    loop: true,
    direction: "alternate",
    fontSize: "0.4em",
  });
}

// CONTROLS

export function hide(): void {
  anime.set(".test-traveler", {
    display: "none",
  });
  animateButton("#hide-button");
}

export function show(): void {
  anime.set(".test-traveler", {
    display: "block",
  });
  anime.set("#t-test-traveler-template", {
    display: "none",
  });
  animateButton("#show-button");
}

export function set(): void {
  stopAuto();
  setTravelers();
  animateButton("#set-button");
}

export function auto(): void {
  if (autoplayInterval) {
    stopAuto();
  } else {
    autoplayInterval = setInterval(() => {
      animateTravelers();
    }, 200);
    animateButton("#auto-button");
  }
}

function stopAuto(): void {
  clearTimeout(autoplayInterval!);
  autoplayInterval = null;
  animateButton("#auto-button", "1.0");
}

function animateButton(target: string, scale: string = "0.9"): void {
  let loop = 1;
  let duration = 100;
  if (target == "#auto-button") {
    loop = 0;
    duration = 200;
  }

  anime.set(target, {
    rotateZ: "90deg",
  });
  anime({
    targets: target,
    duration,
    easing: "easeOutQuad",
    scale,
    rotateZ: "90deg",
    loop,
    direction: "alternate",
  });
}

window.addEventListener("load", init);
