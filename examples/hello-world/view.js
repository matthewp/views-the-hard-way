function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}

const template = document.createElement("template");
template.innerHTML = /* html */ `
  <div class="hello">
    <div>Hello <span class="name"></span></div>
    <label>Your name
      <input type="text" data-field="name">
    </label>
  </div>
`;

function clone() {
  // firstElementChild is .hello — single root, survives appendChild, and
  // because we use class/data-attr selectors (not ids) multiple instances
  // can coexist on the same page.
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init() {
  // DOM Variables
  const el = clone();
  const nameNode = q(el, ".name");
  const inputNode = q(el, '[data-field="name"]');

  // State Variables
  let name;

  // DOM Update Functions
  // One state variable → one DOM update function, even though it touches
  // two nodes. The inner guard on the input isn't a "state changed?"
  // check (setName already handles that) — it's a "does the DOM already
  // match?" check. When the user types, the character is already in the
  // input by the time the event fires; assigning it back is a pointless
  // write that can also disturb selection on some engines.
  function setNameNode(value) {
    nameNode.textContent = value;
    if (inputNode.value !== value) inputNode.value = value;
  }

  // State Update Functions
  function setName(value) {
    if (name !== value) {
      name = value;
      setNameNode(value);
    }
  }

  // Event Listeners
  // 'input' — catches paste, autofill, IME, drag-drop, cut, spellcheck
  // corrections, and programmatic value changes.
  function onNameInput(event) {
    setName(event.target.value);
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  inputNode.addEventListener("input", onNameInput, { signal });

  function disconnect() {
    ac.abort();
  }

  // Update
  function update(data = {}) {
    // `?? ""` so a parent clearing with `{ name: null }` works the same
    // as `{ name: "" }` — avoids `.value = "undefined"` stringification.
    if ("name" in data) setName(data.name ?? "");
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
