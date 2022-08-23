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

let perfLoggingEnabled = false;
let loggingEnabled = true && !perfLoggingEnabled;

export function init() {
  loadElements();
  spawnWaypoints();
  loadWaypoints();
  spawnTravelers();
  setAllTravelers();
  startAnimatedTests();
  initController();
}

function loadElements(): void {
  standaloneTrialgrounds = document.getElementById("standalone-trialgrounds")! as HTMLDivElement;
  standaloneWaypointTemplate = document.getElementById("standalone-waypoint--template")!;
  standaloneWayfinderElement = document.getElementById("standalone-wayfinder")! as HTMLDivElement;

  nestedTrialgrounds = document.getElementById("nested-trialgrounds")! as HTMLDivElement;
  nestedWaypointContainerTemplate = document.getElementById("nested-container--template")!;
  nestedWayfinderElement = document.getElementById("nested-wayfinder")! as HTMLDivElement;

  copyTrialgrounds = document.getElementById("copy-trialgrounds")! as HTMLDivElement;
  copyWaypointTemplate = document.getElementById("copy-waypoint--template")!;
  copyWayfinderElement = document.getElementById("copy-wayfinder")! as HTMLDivElement;

  nestedWayfinderTrialgrounds = document.getElementById("nested-wayfinder-trialgrounds")! as HTMLDivElement;
  nestedWayfinderHubTemplate = document.getElementById("nested-wayfinder-hub--template")!;

  testTravelerTemplate = document.getElementById("t-test-traveler--template")!;
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
    loggingEnabled,
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
  wp.loggingEnabled = loggingEnabled && !perfLoggingEnabled;

  performance.mark("wayfinder.sendToWaypointAnimParams--" + wp.name + "--start");
  let params = sendToWaypointAnimParams(wp, wp.stash!.wf, cssCopyProperties);
  performance.mark("wayfinder.sendToWaypointAnimParams--" + wp.name + "--end");

  performance.measure(
    "wayfinder.sendToWaypointAnimParams--" + wp.name,
    "wayfinder.sendToWaypointAnimParams--" + wp.name + "--start",
    "wayfinder.sendToWaypointAnimParams--" + wp.name + "--end"
  );

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

export function hideAllTravelers(): void {
  anime.set(".test-traveler", {
    display: "none",
  });
}

export function showAllTravelers(): void {
  anime.set(".test-traveler", {
    display: "block",
  });
  anime.set("#t-test-traveler--template", {
    display: "none",
  });
}

function setAllTravelers(): void {
  startCumulativePerf("setAllTravelers");

  waypointsByName.forEach((wp) => {
    let params = sendTestTravelerToWpParams(wp);

    performance.mark("anime.set--" + wp.name + "--start");
    anime.set("#t-test-traveler-" + wp.name, {
      ...params,
    });
    performance.mark("anime.set--" + wp.name + "--end");

    performance.measure(
      "anime.set--" + wp.name,
      "anime.set--" + wp.name + "--start",
      "anime.set--" + wp.name + "--end"
    );
  });

  endCumulativePerf("setAllTravelers");
}

function animateAllTravelers(): void {
  startCumulativePerf("animateAllTravelers");

  waypointsByName.forEach((wp) => {
    let params = sendTestTravelerToWpParams(wp);

    performance.mark("anime--" + wp.name + "--start");
    anime({
      targets: "#t-test-traveler-" + wp.name,
      duration: 300,
      easing: "spring(1, 100, 10, 0)",
      ...params,
    });
    performance.mark("anime--" + wp.name + "--end");

    performance.measure("anime--" + wp.name, "anime--" + wp.name + "--start", "anime--" + wp.name + "--end");
  });

  endCumulativePerf("animateAllTravelers");
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

// PERFORMANCE PROFILING

function startCumulativePerf(name: string): void {
  if (perfLoggingEnabled) {
    console.log("Profiling cumulative perf for " + name + "...");
    console.log(
      "Note: this does not measure the performance of actual animations, but rather the overhead on top of anime.set() or anime(). Wayfinder is not involved in actually animating elements."
    );
    console.log("Also Note: no effort has been put into optimizing Trialgrounds or Wayfinder yet.");
  }

  performance.clearMarks();
  performance.clearMeasures();

  performance.mark(name + "--start");
}

function endCumulativePerf(name: string): void {
  performance.mark(name + "--end");
  performance.measure(name, name + "--start", name + "--end");

  let watEntries = performance
    .getEntries()
    .filter((entry) => entry.entryType == "measure" && entry.name.includes("wayfinder"));
  let animeEntries = performance
    .getEntries()
    .filter((entry) => entry.entryType == "measure" && entry.name.includes("anime"));

  let total = performance.getEntriesByName(name)[0].duration;
  let watTotal = watEntries.map((entry) => entry.duration).reduce((a, b) => a + b);
  let animeTotal = animeEntries.map((entry) => entry.duration).reduce((a, b) => a + b);

  if (perfLoggingEnabled) {
    console.log(
      "Cumulative total for " + name + ": " + total.toFixed(2) + "ms " + "for " + watEntries.length + " travelers"
    );
    console.log("wayfinder total: " + watTotal.toFixed(2) + "ms, " + ((watTotal / total) * 100).toFixed(1) + "%");
    console.log("anime total: " + animeTotal.toFixed(2) + "ms, " + ((animeTotal / total) * 100).toFixed(1) + "%");
    console.log("-----");
  }

  performance.clearMarks();
  performance.clearMeasures();
}

// CONTROLLER

function initController(): void {
  if (perfLoggingEnabled) {
    anime.set("#log-perf-button", { scale: "0.9" });
  } else if (loggingEnabled) {
    anime.set("#log-button", { scale: "0.9" });
  }
}

export function hide(): void {
  stopAuto();
  hideAllTravelers();

  animateButton("#hide-button");
}

export function show(): void {
  showAllTravelers();
  animateButton("#show-button");
}

export function set(): void {
  stopAuto();
  showAllTravelers();
  setAllTravelers();
  animateButton("#set-button");
}

export function anim(): void {
  stopAuto();
  showAllTravelers();
  animateAllTravelers();
  animateButton("#anim-button");
}

export function auto(): void {
  if (autoplayInterval) {
    stopAuto();
  } else {
    showAllTravelers();
    autoplayInterval = setInterval(() => {
      animateAllTravelers();
    }, 200);
    animateButton("#auto-button", true);
  }
}

export function toggleLogging(): void {
  loggingEnabled = !loggingEnabled;
  if (loggingEnabled) {
    animateButton("#log-button", true);
    if (perfLoggingEnabled) {
      togglePerfLogging();
    }
  } else {
    animateButton("#log-button", true, "1.0");
  }
}

export function togglePerfLogging(): void {
  perfLoggingEnabled = !perfLoggingEnabled;
  if (perfLoggingEnabled) {
    animateButton("#log-perf-button", true);
    if (loggingEnabled) {
      toggleLogging();
    }
  } else {
    animateButton("#log-perf-button", true, "1.0");
  }
}

function stopAuto(): void {
  clearTimeout(autoplayInterval!);
  autoplayInterval = null;
  animateButton("#auto-button", true, "1.0");
}

function animateButton(target: string, toggle = false, scale = "0.9"): void {
  let loop = 1;
  let duration = 100;
  if (toggle) {
    loop = 0;
    duration = 200;
  }

  anime({
    targets: target,
    duration,
    easing: "easeOutQuad",
    scale,
    loop,
    direction: "alternate",
  });
}

window.addEventListener("load", init);
