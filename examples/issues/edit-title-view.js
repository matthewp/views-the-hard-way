import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = /* html */ `
  <div class="edit-mode">
    <input type="text" id="edit-name">
    <button type="button">Save</button>
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
  const inputNode = q(el, "#edit-name");
  const saveNode = q(el, "button");

  // State Variables
  let title;

  // DOM Update Functions
  function setInputNode(value) {
    inputNode.value = value;
  }

  // State Update Functions
  function setTitle(value) {
    if (title !== value) {
      title = value;
      setInputNode(value);
    }
  }

  // Event Dispatchers
  function dispatchTitleSaved() {
    el.dispatchEvent(
      new CustomEvent("title-saved", {
        detail: { title: inputNode.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  function onSaveClick(/* event */) {
    dispatchTitleSaved();
  }

  function onInputKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      dispatchTitleSaved();
    }
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  saveNode.addEventListener("click", onSaveClick, { signal });
  inputNode.addEventListener("keydown", onInputKeydown, { signal });

  function disconnect() {
    ac.abort();
  }

  // Update
  function update(data = {}) {
    if ("title" in data) setTitle(data.title);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}

// User-intent focus helper (called from parent's edit-click listener).
init.focusInput = (el) => q(el, "#edit-name").focus();
