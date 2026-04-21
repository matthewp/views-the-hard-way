import commentInit from "./comment-view.js";

export default function init(existingRoot) {
  if (!existingRoot) throw new Error("hardview: comments view requires existing root");

  // DOM Variables
  const el = existingRoot;

  // DOM Views — children added/removed dynamically; tracked for cleanup.
  const children = new Map(); // node -> update fn

  // Event Listeners
  function onCommentDelete(event) {
    const node = event.currentTarget;
    const updateComment = children.get(node);
    el.removeChild(node);
    updateComment?.disconnect?.();
    children.delete(node);
  }

  // State Logic
  function appendComment(text) {
    const updateComment = commentInit(); // fresh clone, no existing root
    const node = updateComment({ text });
    children.set(node, updateComment);
    node.addEventListener("delete-comment", onCommentDelete, { signal, once: true });
    el.appendChild(node);
  }

  // Init Functionality — we only bind listeners on child nodes, via signal.
  const ac = new AbortController();
  const { signal } = ac;

  function disconnect() {
    ac.abort();
    for (const updateComment of children.values()) {
      updateComment.disconnect?.();
    }
    children.clear();
  }

  // Update
  function update(data = {}) {
    if ("comment" in data) appendComment(data.comment);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
