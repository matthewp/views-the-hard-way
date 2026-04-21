function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}

const template = document.createElement("template");
template.innerHTML = `
  <div class="counter">
    <h2>count: <span class="count">0</span></h2>
    <button type="button" class="increment">Increment +</button>
    <button type="button" class="decrement">Decrement -</button>
    <button type="button" class="reset">Reset</button>
  </div>
`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init() {
  // DOM Variables
  const el = clone();
  const countNode = q(el, ".count");
  const incrementNode = q(el, ".increment");
  const decrementNode = q(el, ".decrement");
  const resetNode = q(el, ".reset");

  // State Constants
  const min = 0;

  // State Variables
  let count;

  // DOM Update Functions
  function setCountNode(value) {
    countNode.textContent = String(value);
    // Reflect disabled state on every count change — keeps button state and
    // canDecrement() in sync without the caller having to remember.
    decrementNode.disabled = value <= min;
  }

  // State Update Functions
  function setCount(value) {
    if (count !== value) {
      count = value;
      setCountNode(value);
    }
  }

  // State Logic
  function canDecrement() {
    return count - 1 >= min;
  }

  // Event Dispatchers
  function dispatchChange() {
    el.dispatchEvent(
      new CustomEvent("change", {
        detail: { count },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  function onIncrementClick(/* event */) {
    setCount(count + 1);
    dispatchChange();
  }

  function onDecrementClick(/* event */) {
    if (canDecrement()) {
      setCount(count - 1);
      dispatchChange();
    }
  }

  function onResetClick(/* event */) {
    setCount(min);
    dispatchChange();
  }

  // Init Functionality
  setCount(0);

  // One AbortController for all listeners. disconnect() just calls ac.abort()
  // and every registration made with `signal` is torn down — no pairing
  // addEventListener/removeEventListener calls by hand.
  const ac = new AbortController();
  const { signal } = ac;

  incrementNode.addEventListener("click", onIncrementClick, { signal });
  decrementNode.addEventListener("click", onDecrementClick, { signal });
  resetNode.addEventListener("click", onResetClick, { signal });

  function disconnect() {
    ac.abort();
  }

  // Update
  function update(data = {}) {
    // 'count' in data — not `if (data.count)` — so `{ count: 0 }` is honoured.
    if ("count" in data) setCount(data.count);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
