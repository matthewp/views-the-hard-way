import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = `<label class="animation-picker">
  Timing:
  <select>
    <option value="requestAnimationFrame">requestAnimationFrame</option>
    <option value="requestIdleCallback">requestIdleCallback</option>
    <option value="setTimeout(0)">setTimeout(0)</option>
    <option value="setTimeout(100)">setTimeout(100)</option>
    <option value="setTimeout(20000)">setTimeout(20000)</option>
    <option value="stop">stop</option>
  </select>
</label>`;

const setTimeoutFn = (ms) => (fn) => setTimeout(fn, ms);
const clearTimeoutFn = (id) => clearTimeout(id);

// Exported so the parent can pick an initial default without a round-trip event.
export const timingFunctions = {
  requestAnimationFrame: {
    start: (fn) => requestAnimationFrame(fn),
    clear: (id) => cancelAnimationFrame(id),
  },
  requestIdleCallback: {
    start: (fn) => requestIdleCallback(fn),
    clear: (id) => cancelIdleCallback(id),
  },
  "setTimeout(0)": { start: setTimeoutFn(0), clear: clearTimeoutFn },
  "setTimeout(100)": { start: setTimeoutFn(100), clear: clearTimeoutFn },
  // Original used 5000ms despite the "20000" label — behavior preserved.
  "setTimeout(20000)": { start: setTimeoutFn(5000), clear: clearTimeoutFn },
};

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init() {
  // DOM Variables
  const el = clone();
  const selectNode = q(el, "select");

  // State Variables
  let selectedName;

  // DOM Update Functions
  function setSelectedNameNode(value) {
    selectNode.value = value;
  }

  // State Update Functions
  function setSelectedName(value) {
    if (selectedName !== value) {
      selectedName = value;
      setSelectedNameNode(value);
    }
  }

  // Event Dispatchers
  function dispatchTimingFunction() {
    el.dispatchEvent(
      new CustomEvent("timing-function", {
        detail: timingFunctions[selectedName],
        bubbles: true,
        composed: true,
      }),
    );
  }

  function dispatchStop() {
    el.dispatchEvent(new CustomEvent("stop", { bubbles: true, composed: true }));
  }

  // Event Listeners
  function onPickerMouseDown(event) {
    event.stopPropagation();
  }

  function onSelectChange(event) {
    const value = event.target.value;
    if (value === "stop") {
      dispatchStop();
    } else {
      setSelectedName(value);
      dispatchTimingFunction();
    }
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  el.addEventListener("mousedown", onPickerMouseDown, { signal });
  selectNode.addEventListener("change", onSelectChange, { signal });

  function disconnect() {
    ac.abort();
  }

  function update(data = {}) {
    if ("value" in data) setSelectedName(data.value);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
