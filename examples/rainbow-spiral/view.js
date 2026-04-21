import pickerInit, { timingFunctions } from "./animation-picker.js";
import cursorInit from "./cursor.js";
import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = `<div id="main">
  <div class="picker-wrapper"></div>
  <div id="main-cursor"></div>
  <div id="cursors"></div>
</div>`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init() {
  // DOM Variables
  const el = clone();
  const pickerWrapperNode = q(el, ".picker-wrapper");
  const mainCursorNode = q(el, "#main-cursor");
  const cursorsNode = q(el, "#cursors");

  // DOM Views — mount children once with their initial props.
  const updateMainCursor = cursorInit();
  mainCursorNode.appendChild(updateMainCursor({ label: true, x: 0, y: 0, big: false }));

  const updatePicker = pickerInit();
  pickerWrapperNode.appendChild(updatePicker({ value: "requestAnimationFrame" }));

  // State Constants
  const COUNT = 200;
  const LOOPS = 6;
  const TOUCH = navigator.maxTouchPoints > 1;

  // State Variables
  const cursors = []; // child cursor update fns, indexed 0..max-1
  let x = 0;
  let y = 0;
  let big = false;
  let counter = 0;
  let timing; // current { start, clear }
  let timerId; // handle returned by timing.start

  // DOM Update Functions
  // counter drives the render; x/y/big are *read* here but don't schedule their
  // own redraw — the animation loop picks them up on the next frame, matching
  // the original behavior.
  function setCursorsNode() {
    const max = COUNT + Math.round(Math.sin((counter / 90) * 2 * Math.PI) * COUNT * 0.5);

    let frag;
    for (let i = 0; i < max; i++) {
      const f = (i / max) * LOOPS;
      const θ = f * 2 * Math.PI;
      const m = 20 + i * 2;
      const hue = (f * 255 + counter * 10) % 255;
      const props = {
        big,
        color: `hsl(${hue},100%,50%)`,
        x: (x + Math.sin(θ) * m) | 0,
        y: (y + Math.cos(θ) * m) | 0,
      };

      let childUpdate = cursors[i];
      if (!childUpdate) {
        childUpdate = cursors[i] = cursorInit();
        if (!frag) frag = document.createDocumentFragment();
        frag.appendChild(childUpdate(props));
      } else {
        childUpdate(props);
      }
    }
    if (frag) cursorsNode.appendChild(frag);

    // Shrink: drop anything past `max` from the tail of both the array and the DOM.
    while (cursors.length > max) {
      cursors.pop().disconnect?.();
      cursorsNode.removeChild(cursorsNode.lastChild);
    }
  }

  // State Update Functions
  function setX(value) {
    if (x !== value) x = value;
  }

  function setY(value) {
    if (y !== value) y = value;
  }

  function setBig(value) {
    if (big !== value) big = value;
  }

  function setCounter(value) {
    if (counter !== value) {
      counter = value;
      setCursorsNode();
      updateMainCursor({ x, y, big });
    }
  }

  // State Logic
  function startLoop(nextTiming) {
    stopLoop();
    timing = nextTiming;
    function loop() {
      setCounter(counter + 1);
      timerId = timing.start(loop);
    }
    timerId = timing.start(loop);
  }

  function stopLoop() {
    if (timing && timerId != null) {
      timing.clear(timerId);
      timerId = undefined;
    }
  }

  // Event Listeners
  function onPointerMove(event) {
    const source = event.touches ? event.touches[0] : event;
    setX(source.pageX);
    setY(source.pageY);
  }

  function onPointerDown(event) {
    setBig(true);
    event.preventDefault(); // matches the Preact original; also subsumes the
    // old module-level touchstart preventDefault.
  }

  function onPointerUp(/* event */) {
    setBig(false);
  }

  function onTimingFunction(event) {
    startLoop(event.detail);
  }

  function onTimingStop(/* event */) {
    stopLoop();
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  const moveEvent = TOUCH ? "touchmove" : "mousemove";
  const downEvent = TOUCH ? "touchstart" : "mousedown";
  const upEvent = TOUCH ? "touchend" : "mouseup";

  window.addEventListener(moveEvent, onPointerMove, { signal, passive: true });
  window.addEventListener(downEvent, onPointerDown, { signal });
  window.addEventListener(upEvent, onPointerUp, { signal });

  el.addEventListener("timing-function", onTimingFunction, { signal });
  el.addEventListener("stop", onTimingStop, { signal });

  startLoop(timingFunctions.requestAnimationFrame);

  function disconnect() {
    ac.abort(); // stop reacting to input first…
    stopLoop(); // …then cancel the animation timer…
    updateMainCursor.disconnect?.();
    updatePicker.disconnect?.();
    for (const childUpdate of cursors) childUpdate.disconnect?.();
  }

  function update() {
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
