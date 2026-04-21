import { q } from "./q.js";

export default function init(existingRoot) {
  if (!existingRoot) throw new Error("hardview: post-comment view requires existing root");

  // DOM Variables
  const el = existingRoot;
  const textareaNode = q(el, "textarea");
  const closeNode = q(el, "#close-issue");
  const submitNode = q(el, "#submit-comment");

  // State Variables
  let text = "";
  let hasText = false;
  let isOpen = true;

  // DOM Update Functions
  function setCloseNode(value) {
    closeNode.textContent = value;
  }

  function setTextareaNode(value) {
    textareaNode.value = value;
  }

  function setSubmitNode(value) {
    submitNode.disabled = !value;
  }

  // State Logic
  function closeButtonText() {
    const verb = isOpen ? "Close" : "Reopen";
    return hasText ? `${verb} issue and comment` : `${verb} issue`;
  }

  // State Update Functions
  function setHasText(value) {
    if (hasText !== value) {
      hasText = value;
      setCloseNode(closeButtonText());
      setSubmitNode(value);
    }
  }

  function setText(value, reflectToInput) {
    if (text !== value) {
      text = value;
      setHasText(text.length > 0);
      if (reflectToInput) setTextareaNode(text);
    }
  }

  function setStatus(value) {
    const nextOpen = value === "open";
    if (isOpen !== nextOpen) {
      isOpen = nextOpen;
      setCloseNode(closeButtonText());
    }
  }

  // Event Dispatchers
  function dispatchCommentSaved() {
    el.dispatchEvent(
      new CustomEvent("comment-saved", {
        detail: { comment: text },
        bubbles: true,
        composed: true,
      }),
    );
  }

  function dispatchStatusChange() {
    el.dispatchEvent(
      new CustomEvent("status", {
        detail: { status: isOpen ? "closed" : "open" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  function onTextareaInput(event) {
    setText(event.target.value);
  }

  function onSubmitClick(/* event */) {
    if (!hasText) return;
    dispatchCommentSaved();
    setText("", true);
  }

  function onCloseClick(/* event */) {
    if (hasText) {
      dispatchCommentSaved();
      setText("", true);
    }
    dispatchStatusChange();
  }

  // Init Functionality
  setCloseNode(closeButtonText()); // initial label paint
  setSubmitNode(false); // submit disabled until there's text

  const ac = new AbortController();
  const { signal } = ac;

  textareaNode.addEventListener("input", onTextareaInput, { signal });
  submitNode.addEventListener("click", onSubmitClick, { signal });
  closeNode.addEventListener("click", onCloseClick, { signal });

  function disconnect() {
    ac.abort();
  }

  // Update
  function update(data = {}) {
    if ("status" in data) setStatus(data.status);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
