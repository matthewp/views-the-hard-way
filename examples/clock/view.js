function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}

const template = document.createElement("template");
template.innerHTML = /* html */ `
  <div class="clock simple">
    <style>
      .clock {
        position: relative;
        background: #fff url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjYuNiAyMzMuOCI+PHBhdGggZD0iTTEwNS41IDIyLjdWNi40aC01LjlWNC4zYy44IDAgMS41LS4xIDIuMi0uMi43LS4xIDEuNC0uMyAyLS43LjYtLjMgMS4xLS44IDEuNS0xLjMuNC0uNi43LTEuMy44LTIuMWgyLjF2MjIuN2gtMi43ek0xMTQuMSA0LjhjLjMtMSAuOC0xLjggMS40LTIuNS42LS43IDEuNC0xLjMgMi40LTEuNy45LS40IDItLjYgMy4yLS42IDEgMCAxLjkuMSAyLjguNC45LjMgMS42LjcgMi4zIDEuMi42LjUgMS4xIDEuMiAxLjUgMiAuNC44LjYgMS43LjYgMi44IDAgMS0uMiAxLjktLjUgMi43cy0uNyAxLjUtMS4yIDIuMWMtLjUuNi0xLjEgMS4yLTEuOCAxLjYtLjcuNS0xLjMgMS0yIDEuNC0uNy40LTEuNC44LTIuMSAxLjNzLTEuMy45LTEuOSAxLjNjLS42LjUtMS4xIDEtMS41IDEuNXMtLjcgMS4yLS44IDEuOWgxMS42djIuNGgtMTQuOGMuMS0xLjMuMy0yLjUuNy0zLjQuNC0uOS44LTEuOCAxLjQtMi41czEuMi0xLjMgMi0xLjljLjctLjUgMS41LTEgMi4zLTEuNSAxLS42IDEuOC0xLjEgMi41LTEuNnMxLjMtMSAxLjgtMS41LjgtMS4xIDEuMS0xLjcuNC0xLjMuNC0yLjFjMC0uNi0uMS0xLjItLjQtMS43LS4yLS41LS41LS45LS45LTEuM3MtLjktLjYtMS40LS44Yy0uNS0uMi0xLjEtLjMtMS43LS4zLS44IDAtMS41LjItMiAuNS0uNi4zLTEgLjgtMS40IDEuMy0uNC41LS42IDEuMS0uOCAxLjhzLS4yIDEuMy0uMiAySDExNGMtLjMtMS0uMi0yLjEuMS0zLjF6Ii8+PC9zdmc+) no-repeat center;
        background-size: 88%;
        --diameter: 100%;
        --radius: 50%;
        --hand-width: 2%;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid black;
      }

      .clock.simple:after {
        background: #000;
        border-radius: 50%;
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 5%;
        height: 5%;
        z-index: 10;
      }

      .hand {
        background-color: black;
        position: absolute;
        left: calc(var(--radius) - calc(var(--hand-width) / 2));
        transform-origin: 50% 100%;
      }

      #hour   { top: 30%; height: 20%; width: 2.5%; }
      #minute { top: 10%; height: 40%; width: 2%; }
      #second { top: 14%; height: 45%; width: 1%; transform-origin: 50% 80%; }

      .clock.mounted #minute,
      .clock.mounted #second {
        transition: transform 0.2s cubic-bezier(.4, 2.08, .55, .44);
      }
    </style>
    <div id="hour" class="hand"></div>
    <div id="minute" class="hand"></div>
    <div id="second" class="hand"></div>
  </div>
`;

function clone() {
  // firstElementChild is the <div class="clock">; the <style> lives inside it
  // so the template still has a single root element (see note below).
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

function init() {
  // DOM Variables
  const el = clone();
  const hourNode = q(el, "#hour");
  const minuteNode = q(el, "#minute");
  const secondNode = q(el, "#second");

  // State Constants
  const tickThresholdMs = 200; // throttle: don't redraw faster than this

  // State Variables
  let hour;
  let minute;
  let second;
  let mounted;
  let time;
  let rafId = null;

  // DOM Update Functions
  function setHourNode(value) {
    hourNode.style.transform = `rotate(${Math.floor(value)}deg)`;
  }

  function setMinuteNode(value) {
    minuteNode.style.transform = `rotate(${Math.floor(value)}deg)`;
  }

  function setSecondNode(value) {
    secondNode.style.transform = `rotate(${Math.floor(value)}deg)`;
  }

  function setMountedNode(value) {
    el.classList.toggle("mounted", value);
  }

  // State Update Functions
  function setHour(value) {
    if (hour !== value) {
      hour = value;
      setHourNode(getDegree(value, 12));
    }
  }

  function setMinute(value) {
    if (minute !== value) {
      minute = value;
      setMinuteNode(getDegree(value, 60));
    }
  }

  function setSecond(value) {
    if (second !== value) {
      second = value;
      setSecondNode(getDegree(value, 60));
    }
  }

  function setMounted(value) {
    if (mounted !== value) {
      mounted = value;
      setMountedNode(value);
    }
  }

  function setTime(value) {
    if (time !== value) {
      time = value;
      const date = new Date(value);
      // Each child setter is itself gated — setHour et al. skip the DOM write
      // when the coarser unit hasn't changed, so setting time every 200ms only
      // actually touches the seconds hand most of the time.
      setHour(date.getHours());
      setMinute(date.getMinutes());
      setSecond(date.getSeconds());
    }
  }

  // State Logic
  function getDegree(value, max) {
    return 360 * (value / max);
  }

  function tickIfDue() {
    const now = Date.now();
    if (now - time >= tickThresholdMs) {
      setTime(now);
    }
  }

  function stopTicking() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Event Listeners — the rAF callback is named so it shows up in stack traces
  // and the debugger, per the skill's rule for long-lived subscriptions.
  function onFrame() {
    tickIfDue();
    rafId = requestAnimationFrame(onFrame); // keep rafId current every frame
  }

  // Init Functionality
  setTime(Date.now());
  setMounted(true);
  rafId = requestAnimationFrame(onFrame);

  function disconnect() {
    stopTicking();
  }

  // Update
  function update(data = {}) {
    if ("time" in data && data.time != null) {
      // Explicit time = static clock: pause the ticker and freeze on this value.
      stopTicking();
      setTime(Number(data.time));
    }
    return el;
  }

  update.disconnect = disconnect;
  return update;
}

customElements.define(
  "analog-clock",
  class extends HTMLElement {
    #update = null;

    constructor() {
      super();
      // Shadow root in the constructor is fine — it doesn't read children or
      // attributes, which is the spec's actual constraint.
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      // Idempotent: if the element is moved rather than removed+added, we
      // keep the existing view and its rAF loop intact.
      if (this.#update) return;
      this.#update = init();
      const time = this.dataset.time;
      this.shadowRoot.append(this.#update(time ? { time } : {}));
    }

    disconnectedCallback() {
      // Defer teardown: a move triggers disconnect → connect synchronously,
      // so by the microtask we can tell whether this was a real removal.
      queueMicrotask(() => {
        if (this.isConnected) return;
        this.#update?.disconnect?.();
        this.#update = null;
      });
    }

    connectedMoveCallback() {
      // Opt into Element.moveBefore() state preservation (Chrome 133+).
      // Intentionally empty — the view and its rAF loop survive the move.
    }
  },
);
