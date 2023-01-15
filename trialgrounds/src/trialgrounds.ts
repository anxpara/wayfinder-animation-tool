import anime from "animejs";
import { projectWpToWayfinder, Waypoint, WatResultsLogData, WatResultsLogger } from "wayfinder-animation-tool";

type TestStash = {
  wf: HTMLElement;
  t?: HTMLElement;
};
type TestWaypoint = Waypoint<TestStash>;

let standaloneTrialgrounds: HTMLElement;
let standaloneWayfinderElement: HTMLElement;
let standaloneWaypointTemplate: HTMLElement;

let nestedTrialgrounds: HTMLElement;
let nestedWayfinderElement: HTMLElement;
let nestedWaypointContainerTemplate: HTMLElement;

let copyTrialgrounds: HTMLElement;
let copyWayfinderElement: HTMLElement;
let copyWaypointTemplate: HTMLElement;

let nestedWayfinderTrialgrounds: HTMLElement;
let nestedWayfinderHubTemplate: HTMLElement;

let fixedTrialgrounds: HTMLElement;
let fixedParentWayfinderElement: HTMLElement;
let fixedParentWaypointTemplate: HTMLElement;
let fixedWayfinderElement: HTMLElement;

let bodyWayfinderElement: HTMLElement;

let testTravelerTemplate: HTMLElement;

// prettier-ignore
const standaloneWaypointNames: string[] = ['control', 'absolute', 'font-size', 'font-size-rem', 'size', 'relative', 'translate', 'rotate-origin-0', 'rotate-origin-mid',
                                           'rotate-3d', 'post-translate-down', 'post-rotate', 'overflowing-content', 'x-clipping',];
// prettier-ignore
const nestedWaypointNames: string[] = ['nested-wp-control', 'nested-in-absolute',  'nested-font-size', 'nested-font-size-rem', 'nested-rem-reset', 'nested-padding',
                                       'nested-in-relative', 'nested-relative-in-static', 'nested-relative-in-relative', 'nested-relative-in-transformed',
                                       'nested-absolute-in-relative', 'nested-absolute-in-transform', 'nested-absolute-in-will-transform', 'nested-rotates-0', 'nested-rotates-center',
                                       'nested-diff-origin-control', 'diff-origin-rotate', 'diff-origin-rotates', 'countering-3d-rotates', 'countering-preserve3d-rotates',
                                       'nested-3d-complicated', 'nested-preserve3d-complicated', 'scroll', 'absolute-in-scrolled', 'sticky', 'absolute-in-stickied', 'double-preserve3d', 'revert-preserve3d',];
// prettier-ignore
const copyWaypointNames: string[] = ['copy-bg', 'copy-border', 'copy-border-per-side', 'copy-border-box-sizing', 'copy-text-align'];
// prettier-ignore
const nestedWayfinderWaypointNames: string[] = ['nest-wf-in-scroll', 'nest-in-font-size'];
// prettier-ignore
const fixedParentWaypointNames: string[] = ['fixed-parent-control', 'fixed-parent-to-fixed', 'fixed-parent-to-body', 'body-to-fixed-parent', 'fixed-to-fixed-parent'];

// prettier-ignore
const hardcodedWaypointNames: string[] = ["absolute-in-scrolled", "sticky", "absolute-in-stickied", "double-preserve3d", "revert-preserve3d", "body-to-fixed-parent", 'fixed-to-fixed-parent'];
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
let enablePerfLogging = false;
let enableResultsLogging = true && !enablePerfLogging;

export function init() {
  parseQueryParams();
  loadElements();
  spawnWaypointElements();
  loadWaypoints();
  spawnTravelerElements();
  setAllTravelers();
  startAnimatedTests();
  initController();
}

function parseQueryParams() {
  const queryParams = new URLSearchParams(window.location.search);
  let loggingParam = queryParams.get("logging");
  if (loggingParam == "results") {
    enableResultsLogging = true;
    enablePerfLogging = false;
  } else if (loggingParam == "perf") {
    enablePerfLogging = true;
    enableResultsLogging = false;
  }
}

function loadElements(): void {
  standaloneTrialgrounds = document.getElementById("standalone-trialgrounds")!;
  standaloneWaypointTemplate = document.getElementById("standalone-waypoint--template")!;
  standaloneWayfinderElement = document.getElementById("standalone-wayfinder")!;

  nestedTrialgrounds = document.getElementById("nested-trialgrounds")!;
  nestedWaypointContainerTemplate = document.getElementById("nested-container--template")!;
  nestedWayfinderElement = document.getElementById("nested-wayfinder")!;

  copyTrialgrounds = document.getElementById("copy-trialgrounds")!;
  copyWaypointTemplate = document.getElementById("copy-waypoint--template")!;
  copyWayfinderElement = document.getElementById("copy-wayfinder")!;

  nestedWayfinderTrialgrounds = document.getElementById("nested-wf-trialgrounds")!;
  nestedWayfinderHubTemplate = document.getElementById("nested-wf-hub--template")!;

  fixedTrialgrounds = document.getElementById("fixed-trialgrounds")!;
  fixedParentWayfinderElement = document.getElementById("fixed-parent-wayfinder")!;
  fixedParentWaypointTemplate = document.getElementById("fixed-parent-waypoint--template")!;
  fixedWayfinderElement = document.getElementById("fixed-wayfinder")!;

  bodyWayfinderElement = document.getElementById("body-wayfinder")!;

  testTravelerTemplate = document.getElementById("test-traveler--template")!;
}

function spawnWaypointElements(): void {
  spawnStandaloneWaypoints();
  spawnNestedWaypoints();
  spawnCopyWaypoints();
  spawnNestedWayfinders();
  spawnFixedParentWaypoints();
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
    let scrollContainer = document.getElementById("scroll-container")!;
    scrollContainer.scrollBy(70, 50);
  }

  if (nestedWaypointNames.includes("absolute-in-scrolled")) {
    let scrollContainer = document.getElementById("scroll-container2")!;
    scrollContainer.scrollBy(200, 120);
  }

  if (nestedWaypointNames.includes("sticky")) {
    let rootContainer = document.getElementById("sticky-root")!;
    rootContainer.scrollBy(0, 200);
  }

  if (nestedWaypointNames.includes("absolute-in-stickied")) {
    let rootContainer = document.getElementById("absolute-in-stickied-root")!;
    rootContainer.scrollBy(200, 200);
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

function spawnFixedParentWaypoints(): void {
  fixedParentWaypointNames.reverse();
  fixedParentWaypointNames.forEach((name) => {
    if (hardcodedWaypointNames.includes(name)) {
      return;
    }

    let testWaypoint = fixedParentWaypointTemplate!.cloneNode(true) as HTMLElement;
    testWaypoint.id = name + "-waypoint";
    testWaypoint.className = testWaypoint.id;
    testWaypoint.firstElementChild!.innerHTML = name;

    fixedTrialgrounds!.prepend(testWaypoint);
    anime.set(testWaypoint, {
      display: "block",
    });
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

  fixedParentWaypointNames.forEach((name) => {
    let wayfinder = fixedParentWayfinderElement!;
    if (name === "fixed-parent-to-fixed") {
      wayfinder = fixedWayfinderElement;
    }
    if (name === "fixed-parent-to-body") {
      wayfinder = bodyWayfinderElement;
    }
    loadWaypoint(name, wayfinder);
  });
}

const customLogger: WatResultsLogger = (data: WatResultsLogData) => {
  console.log(data);
};

function loadWaypoint(name: string, wayfinder: HTMLElement): void {
  let wp: TestWaypoint = {
    name,
    element: document.getElementById(name + "-waypoint")!,
    stash: { wf: wayfinder },
    enableLogging: enableResultsLogging,
    customLogger,
  };
  waypointsByName.set(name, wp);
}

function spawnTravelerElements(): void {
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
  wp.enableLogging = enableResultsLogging && !enablePerfLogging;

  performance.mark("wayfinder.sendToWaypointAnimParams--" + wp.name + "--start");
  let params = projectWpToWayfinder(wp, wp.stash!.wf!, cssPropsToCopy);
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
  if (enablePerfLogging) {
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

  if (enablePerfLogging) {
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
  if (enablePerfLogging) {
    anime.set("#log-perf-button", { scale: "0.9" });
  } else if (enableResultsLogging) {
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
  enableResultsLogging = !enableResultsLogging;
  if (enableResultsLogging) {
    animateButton("#log-button", true);
    if (enablePerfLogging) {
      togglePerfLogging();
    }
  } else {
    animateButton("#log-button", true, "1.0");
  }
}

export function togglePerfLogging(): void {
  enablePerfLogging = !enablePerfLogging;
  if (enablePerfLogging) {
    animateButton("#log-perf-button", true);
    if (enableResultsLogging) {
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
