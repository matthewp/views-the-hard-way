import { conditional } from './helpers.js';

const editTemplate = document.createElement('template');
editTemplate.innerHTML = /* html */ `
  <div class="edit-mode">
    <input type="text" id="edit-name">
    <button type="button">Save</button>
  </div>
`;

function editMode() {
  function clone() {
    return document.importNode(editTemplate.content, true).firstElementChild;
  }

  function init() {
    let frag = clone();
    let editModeNode = frag;
    let titleNode = frag.querySelector('#edit-name');
    let saveNode = frag.querySelector('button');
    let statusNode = frag.querySelector('.status');

    /* State variables */
    let title;

    /* DOM update functions */
    function setTitleNode(value) {
      titleNode.value = value;
    }

    /* State update functions */
    function setTitle(value) {
      if(title !== value) {
        title = value;
        setTitleNode(value);
      }
    }

    /* Event dispatchers */
    function dispatchTitleSaved() {
      let ev = new CustomEvent('title-saved', {
        detail: titleNode.value
      });
      editModeNode.dispatchEvent(ev);
    }

    /* Event listeners */
    function onSaveClick() {
      dispatchTitleSaved();
    }

    function onTitleKeyUp(ev) {
      if(ev.keyCode === 13) {
        dispatchTitleSaved();
      }
    }

    saveNode.addEventListener('click', onSaveClick);
    titleNode.addEventListener('keyup', onTitleKeyUp);

    function disconnect() {
      saveNode.removeEventListener('click', onSaveClick);
      titleNode.removeEventListener('keyup', onTitleKeyUp);
    }

    function update(data = {}) {
      if(data.title) setTitle(data.title);
      return frag;
    }

    update.disconnect = disconnect;

    return update;
  }

  return init;
}

function init(frag) {
  /* DOM variables */
  let titleModeNode = frag.querySelector('.title-mode');
  let titleNode = frag.querySelector('#title');
  let editButtonNode = frag.querySelector('#edit-button');
  let statusNode = frag.querySelector('.status');

  /* View variables */
  let updateEditMode = editMode()();
  let editModeNode = updateEditMode();
  let showTitleMode = conditional(titleModeNode, updateEditMode());

  /* State variables */
  let title = titleNode.textContent;
  let status = statusNode.textContent.toLowerCase();

  /* DOM update functions */
  function setTitleNode(value) {
    titleNode.textContent = value;
  }

  function setStatusNode(value) {
    if(value === 'open') {
      statusNode.textContent = 'Open';
      statusNode.classList.remove('closed');
      statusNode.classList.add('open');
    } else {
      statusNode.textContent = 'Closed';
      statusNode.classList.remove('open');
      statusNode.classList.add('closed');
    }
  }

  /* State update functions */
  function setTitle(value) {
    if(title !== value) {
      title = value;
      setTitleNode(value);
    }
  }

  function setStatus(value) {
    if(status !== value) {
      status = value;
      setStatusNode(value);
    }
  }

  /* Event listeners */
  function onEditClick() {
    updateEditMode({ title });
    showTitleMode(false);
  }

  function onTitleSaved(ev) {
    setTitle(ev.detail);
    showTitleMode(true);
  }

  /* Init functionality */
  editButtonNode.addEventListener('click', onEditClick);
  editModeNode.addEventListener('title-saved', onTitleSaved);

  function disconnect() {
    editButtonNode.removeEventListener('click', onEditClick);
    editModeNode.removeEventListener('title-saved', onTitleSaved);
  }

  function update(data = {}) {
    if(data.title) setTitle(data.title);
    if(data.status) setStatus(data.status);
    return frag;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;
