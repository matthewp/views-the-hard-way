function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}

const template = document.createElement("template");
template.innerHTML = /* html */ `
  <div class="full-name">
    <div>Hello <span class="name"></span></div>
    <label>First name
      <input type="text" data-field="first" autocomplete="given-name">
    </label>
    <label>Last name
      <input type="text" data-field="last" autocomplete="family-name">
    </label>
  </div>
`;

function clone() {
  // firstElementChild is .full-name — single root, survives appendChild,
  // and because we use classes and data-attributes instead of ids, multiple
  // instances can coexist on the same page without id collisions.
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init() {
  // DOM Variables
  const el = clone();
  const nameNode = q(el, ".name");
  const firstNode = q(el, '[data-field="first"]');
  const lastNode = q(el, '[data-field="last"]');

  // State Variables
  let fullName;
  let first = "";
  let last = "";

  // DOM Update Functions
  function setNameNode(value) {
    nameNode.textContent = value;
  }

  function setFirstNode(value) {
    // Guard the input-value write: avoid stomping on the user's caret position
    // when the incoming value already matches what they typed.
    if (firstNode.value !== value) firstNode.value = value;
  }

  function setLastNode(value) {
    if (lastNode.value !== value) lastNode.value = value;
  }

  // State Update Functions
  function setFullName(value) {
    if (fullName !== value) {
      fullName = value;
      setNameNode(value);
    }
  }

  function setFirst(value) {
    if (first !== value) {
      first = value;
      setFirstNode(value);
      setFullName(fullNameFromParts());
    }
  }

  function setLast(value) {
    if (last !== value) {
      last = value;
      setLastNode(value);
      setFullName(fullNameFromParts());
    }
  }

  // State Logic
  function fullNameFromParts() {
    // filter(Boolean) skips empty parts so "John " or " Smith" never appear.
    return [first, last].filter(Boolean).join(" ");
  }

  // Event Dispatchers
  // input: fires on every keystroke — parents do live preview / debounced work.
  function dispatchInput() {
    el.dispatchEvent(
      new CustomEvent("input", {
        detail: { first, last, fullName },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // change: fires on commit (blur) — parents do expensive work (save, validate).
  function dispatchChange() {
    el.dispatchEvent(
      new CustomEvent("change", {
        detail: { first, last, fullName },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  //
  // 'input' captures paste, autofill, IME, drag-drop, cut, spellcheck
  // corrections, and programmatic value changes — anything that mutates
  // the field. 'change' only fires on commit (blur or Enter).
  function onFirstInput(event) {
    setFirst(event.target.value);
    dispatchInput();
  }

  function onLastInput(event) {
    setLast(event.target.value);
    dispatchInput();
  }

  function onFirstChange(/* event */) {
    dispatchChange();
  }

  function onLastChange(/* event */) {
    dispatchChange();
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  firstNode.addEventListener("input", onFirstInput, { signal });
  lastNode.addEventListener("input", onLastInput, { signal });
  firstNode.addEventListener("change", onFirstChange, { signal });
  lastNode.addEventListener("change", onLastChange, { signal });

  function disconnect() {
    ac.abort();
  }

  // Update
  function update(data = {}) {
    // `?? ""` coalesces null/undefined from the parent. Setting an input's
    // .value to undefined stringifies it to "undefined" — defensive coercion
    // is worth the two extra characters.
    if ("first" in data) setFirst(data.first ?? "");
    if ("last" in data) setLast(data.last ?? "");
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
