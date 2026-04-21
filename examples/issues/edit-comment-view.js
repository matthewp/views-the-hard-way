import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = /* html */ `
  <div class="comment-edit-mode comment-block">
    <textarea></textarea>
    <div class="actions">
      <button type="button" class="cancel-update">Cancel</button>
      <button type="button" class="update-comment success">Update comment</button>
    </div>
  </div>
`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

function init() {
  // DOM Variables
  const el = clone();
  const textareaNode = q(el, "textarea");
  const cancelNode = q(el, ".cancel-update");
  const updateNode = q(el, ".update-comment");

  // State Variables
  let comment;

  // DOM Update Functions
  function setTextareaNode(value) {
    textareaNode.value = value;
  }

  // State Update Functions
  function setComment(value) {
    if (comment !== value) {
      comment = value;
      setTextareaNode(value);
    }
  }

  // Event Dispatchers
  function dispatchClose() {
    el.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  function dispatchUpdate() {
    el.dispatchEvent(
      new CustomEvent("update", {
        detail: { comment: textareaNode.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  function onCancelClick(/* event */) {
    dispatchClose();
  }

  function onUpdateClick(/* event */) {
    dispatchUpdate();
    dispatchClose();
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  cancelNode.addEventListener("click", onCancelClick, { signal });
  updateNode.addEventListener("click", onUpdateClick, { signal });

  function disconnect() {
    ac.abort();
  }

  // Update
  function update(data = {}) {
    if ("comment" in data) setComment(data.comment);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}

// Expose textarea focus for the parent after mounting — focus is user-intent,
// so the parent calls this from its onEditClick listener.
init.focusTextarea = (el) => q(el, "textarea").focus();

export default init;
