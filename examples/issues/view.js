import commentInit from "./comment-view.js";
import commentsInit from "./comments-view.js";
import postCommentInit from "./post-comment-view.js";
import { q } from "./q.js";
import titleInit from "./title-view.js";

export default function init(existingRoot) {
  if (!existingRoot) throw new Error("hardview: main view requires existing root");

  // DOM Variables
  const el = existingRoot;
  const headerNode = q(el, "header");
  const issueCommentNode = q(el, ".body > .comment");
  const commentBlockNode = q(el, ".comment-block");
  const commentsNode = q(el, ".comments");

  // DOM Views — hydrate each child from its server-rendered root.
  const updateTitle = titleInit(headerNode);
  const updatePostComment = postCommentInit(commentBlockNode);
  const updateComments = commentsInit(commentsNode);
  const updateIssueComment = commentInit(issueCommentNode);

  // Event Listeners
  function onComment(event) {
    updateComments({ comment: event.detail.comment });
  }

  function onStatus(event) {
    const { status } = event.detail;
    updateTitle({ status });
    updatePostComment({ status });
  }

  // Init Functionality
  const ac = new AbortController();
  const { signal } = ac;

  commentBlockNode.addEventListener("comment-saved", onComment, { signal });
  commentBlockNode.addEventListener("status", onStatus, { signal });

  function disconnect() {
    ac.abort();
    updateTitle.disconnect?.();
    updatePostComment.disconnect?.();
    updateComments.disconnect?.();
    updateIssueComment.disconnect?.();
  }

  // Update
  function update(/* data = {} */) {
    // No top-level props currently flow in; kept for API consistency.
    return el;
  }

  update.disconnect = disconnect;
  return update;
}
