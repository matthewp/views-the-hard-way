import { conditional } from "./conditional.js";
import editCommentInit from "./edit-comment-view.js";
import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = /* html */ `
  <article class="comment">
    <div class="actions">
      <button type="button" class="edit-comment">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 368v80h80l235.727-235.729-79.999-79.998L64 368zm377.602-217.602c8.531-8.531 8.531-21.334 0-29.865l-50.135-50.135c-8.531-8.531-21.334-8.531-29.865 0l-39.468 39.469 79.999 79.998 39.469-39.467z"/></svg>
      </button>
      <button type="button" class="delete-comment">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 405.429C128 428.846 147.198 448 170.667 448h170.667C364.802 448 384 428.846 384 405.429V160H128v245.429zM416 96h-80l-26.785-32H202.786L176 96H96v32h320V96z"/></svg>
      </button>
    </div>
    <p></p>
  </article>
`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init(existingRoot) {
  const hydrating = existingRoot != null;

  // DOM Variables
  const el = existingRoot ?? clone();
  const pNode = q(el, "p");
  const editNode = q(el, ".edit-comment");
  // The seed issue comment in the HTML has no delete button; new comments do.
  const deleteNode = el.querySelector(".delete-comment");

  // DOM Views — edit-mode child is built lazily on first edit click.
  let updateEditMode;
  let editModeNode;
  let showCommentMode;
  let builtEdit = false;

  // State Variables
  //   Seed from existing DOM when hydrating so the first equality check hits.
  let comment = hydrating ? pNode.textContent : undefined;

  // DOM Update Functions
  function setPNode(value) {
    pNode.textContent = value;
  }

  function setDeletedNode() {
    el.classList.add("deleted");
  }

  // State Update Functions
  function setComment(value) {
    if (comment !== value) {
      comment = value;
      setPNode(value);
    }
  }

  // State Logic
  function buildEditMode() {
    updateEditMode = editCommentInit();
    editModeNode = updateEditMode();
    showCommentMode = conditional(pNode, editModeNode);
    editModeNode.addEventListener("close", onEditModeClose, { signal });
    editModeNode.addEventListener("update", onEditModeUpdate, { signal });
    builtEdit = true;
  }

  // Event Dispatchers
  function dispatchDelete() {
    el.dispatchEvent(
      new CustomEvent("delete-comment", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  function onDeleteClick(/* event */) {
    setDeletedNode();
    el.addEventListener("animationend", onDeleteAnimationEnd, { signal, once: true });
  }

  function onDeleteAnimationEnd(/* event */) {
    dispatchDelete();
  }

  function onEditClick(/* event */) {
    if (!builtEdit) buildEditMode();
    updateEditMode({ comment: comment ?? "" });
    showCommentMode(false);
    editCommentInit.focusTextarea(editModeNode); // user-intent focus
  }

  function onEditModeClose(/* event */) {
    showCommentMode(true);
  }

  function onEditModeUpdate(event) {
    setComment(event.detail.comment);
    // Close fires right after update from the child, so mode-switch is handled there.
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  editNode.addEventListener("click", onEditClick, { signal });
  if (deleteNode) {
    deleteNode.addEventListener("click", onDeleteClick, { signal });
  }

  function disconnect() {
    ac.abort(); // our own listeners first
    updateEditMode?.disconnect?.(); // then cascade to the lazily-built child
  }

  // Update
  function update(data = {}) {
    if ("text" in data) setComment(data.text);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
