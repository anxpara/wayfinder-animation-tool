import anime from "animejs";
import { sendToWaypointAnimParams, Waypoint } from "wayfinder-animation-tool";

class TestStash {
  wf: HTMLElement | null = null;
  t: HTMLElement | null = null;
}
type TestWaypoint = Waypoint<TestStash>;

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

const hardcodedWaypointNames: string[] = ["sticky", "double-preserve3d", "revert-preserve3d"];
const hardcodedTravelerNames: string[] = [];

const defaultCssCopyList = ["border-style", "border-width"];
const cssCopyLists = new Map<string, string[]>();
cssCopyLists.set("copy-bg", ["background-color", ...defaultCssCopyList]);
cssCopyLists.set("copy-border", defaultCssCopyList);
cssCopyLists.set("copy-border-per-side", [
  "border-style",
  "border-left-width",
  "border-right-width",
  "border-top-width",
  "border-bottom-width",
]);
cssCopyLists.set("copy-border-box-sizing", defaultCssCopyList);
cssCopyLists.set("copy-text-align", ["text-align", ...defaultCssCopyList]);

const waypointsByName = new Map<string, TestWaypoint>();
let autoplayInterval: NodeJS.Timeout | null = null;
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

  nestedWayfinderTrialgrounds = document.getElementById("nested-wf-trialgrounds")! as HTMLDivElement;
  nestedWayfinderHubTemplate = document.getElementById("nested-wf-hub--template")!;

  testTravelerTemplate = document.getElementById("test-traveler--template")!;
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
    testWaypoint.id = name + "-waypoint";
    testWaypoint.className = testWaypoint.id;
    testWaypoint.firstElementChild!.innerHTML = name;

    standaloneTrialgrounds!.prepend(testWaypoint);
    anime.set(testWaypoint, {
      display: "block",
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
    testContainer.classList.add(testContainer.id);
    anime.set(testContainer, {
      display: "block",
    });
    
    // waypoint
    let nestedWaypoint = testContainer.firstElementChild!;
    nestedWaypoint.id = name + "-waypoint";
    nestedWaypoint.classList.add(nestedWaypoint.id);
    nestedWaypoint.firstElementChild!.innerHTML = name;
    anime.set(nestedWaypoint, {
      display: "block",
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
    testWaypoint.id = name + "-waypoint";

    let text = name;
    if (name == "copy-bg") text += " failed";
    testWaypoint.firstElementChild!.innerHTML = text;
    testWaypoint.className = testWaypoint.id;

    copyTrialgrounds!.prepend(testWaypoint);
    anime.set(testWaypoint, {
      display: "block",
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
    nestedWfHub.classList.add(nestedWfHub.id);
    anime.set(nestedWfHub, {
      display: "block",
    });

    // container
    let nestedContainer = nestedWfHub.firstElementChild!;
    nestedContainer.id = name + "-container";

    // waypoint
    let nestedWaypoint = nestedContainer.firstElementChild!;
    nestedWaypoint.id = name + "-waypoint";
    nestedWaypoint.classList.add(nestedWaypoint.id);
    nestedWaypoint.firstElementChild!.innerHTML = name;
    anime.set(nestedWaypoint, {
      display: "block",
    });

    // wayfinder
    let nestedWayfinder = nestedContainer.children[1]!;
    nestedWayfinder.id = name + "-wayfinder";
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
    let nestedWayfinder = document.getElementById(name + "-wayfinder")!;
    loadWaypoint(name, nestedWayfinder);
  });
}

function loadWaypoint(name: string, wayfinder: HTMLElement): void {
  let wp: TestWaypoint = {
    name,
    element: document.getElementById(name + "-waypoint")!,
    stash: { wf: wayfinder, t: null },
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
    testTraveler.id = wp.name + "-traveler";
    testTraveler.classList.add(testTraveler.id);
    testTraveler.firstElementChild!.innerHTML = wp.name;
    wp.stash!.wf!.appendChild(testTraveler);
    wp.stash!.t = testTraveler;
  });
}

function sendTestTravelerToWpParams(wp: TestWaypoint): any {
  let cssPropsToCopy = cssCopyLists.get(wp.name) || defaultCssCopyList;
  wp.loggingEnabled = loggingEnabled && !perfLoggingEnabled;

  performance.mark("wayfinder.sendToWaypointAnimParams--" + wp.name + "--start");
  let params = sendToWaypointAnimParams(wp, wp.stash!.wf!, cssPropsToCopy);
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
  anime.set("#test-traveler--template", {
    display: "none",
  });
}

function setAllTravelers(): void {
  startCumulativePerf("setAllTravelers");

  waypointsByName.forEach((wp) => {
    let params = sendTestTravelerToWpParams(wp);

    performance.mark("anime.set--" + wp.name + "--start");
    anime.set(wp.stash!.t!, {
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
      targets: wp.stash!.t!,
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
    console.log(
      "wayfinder total: " +
        watTotal.toFixed(2) +
        "ms, " +
        ((watTotal / total) * 100).toFixed(1) +
        "%, " +
        (watTotal / watEntries.length).toFixed(3) +
        "ms avg"
    );
    console.log(
      "anime total: " +
        animeTotal.toFixed(2) +
        "ms, " +
        ((animeTotal / total) * 100).toFixed(1) +
        "%, " +
        (animeTotal / watEntries.length).toFixed(3) +
        "ms avg"
    );
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
