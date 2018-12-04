import commentView from './comment-view.js';

function commentList() {
  function init() {
    /* DOM variables */
    let root = this;
  
    /* DOM functions */
    function appendComment(text) {
      let updateComment = commentView();
      let node = updateComment({ text });
      node.addEventListener('delete-comment', ev => {
        root.removeChild(node);
        updateComment.disconnect();
      }, { once: true })
      root.appendChild(node);
    }
  
    function update(data = {}) {
      if(data.comment) appendComment(data.comment);
      return root;
    }
  
    return update;
  }

  return init;
}

export default commentList();