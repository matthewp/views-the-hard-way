import titleView from './title-template.js';
import postCommentView from './post-comment-view.js';
import commentsView from './comments-view.js';
import commentView from './comment-view.js';

function init() {
  /* DOM variables */
  let frag = this;
  let headerNode = frag.querySelector('header');
  let titleNode = frag.querySelector('#title');
  let issueCommentNode = frag.querySelector('.comment');
  let commentBlockNode = frag.querySelector('.comment-block');
  let commentsNode = frag.querySelector('.comments');

  /* View variables */
  let updateTitle = titleView(headerNode);
  let updatePostComment = postCommentView(commentBlockNode);
  let updateComments = commentsView.call(commentsNode);
  let updateIssueComment = commentView(issueCommentNode);

  /* State variables */
  let title;

  /* DOM update functions */
  function setTitleNode(value) {
    titleNode.textContent = value;
  }

  /* State update functions */
  function setTitle(value) {
    if(title !== value) {
      title = value;
      setTitleNode(value);
    }
  }

  /* Event listeners */
  function onComment(ev) {
    let comment = ev.detail;
    updateComments({ comment });
  }

  function onStatus(ev) {
    let status = ev.detail;
    updateTitle({ status  });
    updatePostComment({ status });
  }

  /* Init functionality */
  commentBlockNode.addEventListener('comment-saved', onComment);
  commentBlockNode.addEventListener('status', onStatus);

  function disconnect() {
    commentBlockNode.removeEventListener('comment-saved', onComment);
    commentBlockNode.removeEventListener('status', onStatus);
  }

  function update(data = {}) {
    if(data.name) setName(data.name);

    return frag;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;
