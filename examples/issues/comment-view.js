import { conditional } from './helpers.js';

function editComment() {
  const template = document.createElement('template');
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
    return document.importNode(template.content, true).firstElementChild;
  }

  function init() {
    /* DOM variables */
    let root = clone();
    let textareaNode = root.querySelector('textarea');
    let cancelNode = root.querySelector('.cancel-update');
    let updateNode = root.querySelector('.update-comment');

    /* DOM functions */
    function setTextareaNode(value) {
      textareaNode.value = value;
    }

    /* Event dispatchers */
    function dispatchClose() {
      let ev = new CustomEvent('close');
      root.dispatchEvent(ev);
    }

    function dispatchUpdate() {
      let ev = new CustomEvent('update', {
        detail: textareaNode.value
      });
      root.dispatchEvent(ev);
    }

    /* Event listeners */
    function onCancelClick() {
      dispatchClose();
    }

    function onUpdateClick() {
      dispatchUpdate();
      dispatchClose();
    }

    /* Initialization */
    cancelNode.addEventListener('click', onCancelClick);
    updateNode.addEventListener('click', onUpdateClick);

    function disconnect() {
      cancelNode.removeEventListener('click', onCancelClick);
      updateNode.removeEventListener('click', onUpdateClick);
    }

    function update(data = {}) {
      if(data.comment) setTextareaNode(data.comment);
      return root;
    }

    return update;
  }

  return init;
}

const editCommentView = editComment();

function comment() {
  const template = document.createElement('template');
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
    return document.importNode(template.content, true).firstElementChild;
  }

  function init(frag = clone()) {
    /* DOM variables */
    let articleNode = frag;
    let pNode = frag.querySelector('p');
    let deleteNode = frag.querySelector('.delete-comment');
    let editNode = frag.querySelector('.edit-comment');
    let editModeRootNode;

    /* DOM views */
    let updateEditMode, showCommentMode;

    /* State variables */
    let builtEdit = false;
    let editMode = false;
    let comment = pNode.textContent;

    /* DOM functions */
    function setPNode(value) {
      pNode.textContent = value;
    }

    function setDeletedNode() {
      articleNode.classList.add('deleted');
    }

    /* State functions */
    function setText(value) {
      if(comment !== value) {
        comment = value;
        setPNode(value);
      }
    }

    function setBuiltEdit() {
      builtEdit = true;
      updateEditMode = editCommentView();
      editModeRootNode = updateEditMode();
      showCommentMode = conditional(pNode, editModeRootNode);
      editModeRootNode.addEventListener('close', onEditModeClose);
      editModeRootNode.addEventListener('update', onEditModeUpdate);
    }

    /* Event dispatchers */
    function dispatchDelete() {
      let ev = new CustomEvent('delete-comment');
      articleNode.dispatchEvent(ev);
    }

    /* Event listeners */
    function onDeleteClick() {
      setDeletedNode();
      articleNode.addEventListener('animationend', () => {
        dispatchDelete();
      }, { once: true });
    }

    function onEditClick() {
      if(!builtEdit) {
        setBuiltEdit();
      }
      updateEditMode({ comment });
      showCommentMode(false);
    }

    function onEditModeClose() {
      showCommentMode(true);
    }

    function onEditModeUpdate(ev) {
      setText(ev.detail);
    }

    /* Initialize stuff */
    if(deleteNode) {
      deleteNode.addEventListener('click', onDeleteClick);
    }
    
    editNode.addEventListener('click', onEditClick);

    function disconnect() {
      if(deleteNode) {
        deleteNode.removeEventListener('click', onDeleteClick);
      }

      if(editModeRootNode) {
        editModeRootNode.removeEventListener('close', onEditModeClose);
        editModeRootNode.removeEventListener('update', onEditModeUpdate);
      }
      
      editNode.removeEventListener('click', onEditClick);
    }

    function update(data = {}) {
      if(data.text) setText(data.text);
      return articleNode;
    }

    update.disconnect = disconnect;

    return update;
  }

  return init;
}

const commentView = comment();

export default commentView;