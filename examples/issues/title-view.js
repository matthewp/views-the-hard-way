import { conditional } from "./conditional.js";
import editTitleInit from "./edit-title-view.js";
import { q } from "./q.js";

export default function init(existingRoot) {
  if (!existingRoot) throw new Error("hardview: title view requires existing root (header element)");

  // DOM Variables
  const el = existingRoot;
  const titleModeNode = q(el, ".title-mode");
  const titleNode = q(el, "#title");
  const editButtonNode = q(el, "#edit-button");
  const statusNode = q(el, ".status");

  // DOM Views — edit mode is created up-front but not mounted until edit is clicked.
  const updateEditMode = editTitleInit();
  const editModeNode = updateEditMode();
  const showTitleMode = conditional(titleModeNode, editModeNode);

  // State Variables — seeded from hydrated DOM so first equality check short-circuits.
  let title = titleNode.textContent;
  let status = statusNode.textContent.trim().toLowerCase();

  // DOM Update Functions
  function setTitleNode(value) {
    titleNode.textContent = value;
  }

  function setStatusNode(value) {
    const isOpen = value === "open";
    statusNode.textContent = isOpen ? "Open" : "Closed";
    statusNode.classList.toggle("open", isOpen);
    statusNode.classList.toggle("closed", !isOpen);
  }

  // State Update Functions
  function setTitle(value) {
    if (title !== value) {
      title = value;
      setTitleNode(value);
    }
  }

  function setStatus(value) {
    if (status !== value) {
      status = value;
      setStatusNode(value);
    }
  }

  // Event Listeners
  function onEditClick(/* event */) {
    updateEditMode({ title });
    showTitleMode(false);
    editTitleInit.focusInput(editModeNode); // user-intent focus
  }

  function onTitleSaved(event) {
    setTitle(event.detail.title);
    showTitleMode(true);
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  editButtonNode.addEventListener("click", onEditClick, { signal });
  editModeNode.addEventListener("title-saved", onTitleSaved, { signal });

  function disconnect() {
    ac.abort();
    updateEditMode.disconnect?.();
  }

  // Update
  function update(data = {}) {
    if ("title" in data) setTitle(data.title);
    if ("status" in data) setStatus(data.status);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
