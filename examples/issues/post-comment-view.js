
function init(frag) {
  /* DOM variables */
  let textareaNode = frag.querySelector('textarea');
  let closeNode = frag.querySelector('#close-issue');
  let submitNode = frag.querySelector('#submit-comment');

  /* State variables */
  let hasText = false, isOpen = true, text;

  /* DOM update functions */
  function setCloseNode(value) {
    closeNode.textContent = value;
  }

  function setTextareaNode(value) {
    textareaNode.value = value;
  }

  /* State update functions */
  function setHasText(value) {
    if(hasText !== value) {
      hasText = value;
      setCloseNode(getCloseTextValue());
    }
  }

  function setText(value, saveToInput) {
    if(text !== value) {
      text = value;
      setHasText(text.length > 0);

      if(saveToInput) {
        setTextareaNode(text);
      }
    }
  }

  function setStatus(status) {
    isOpen = status === 'open';
    setCloseNode(getCloseTextValue());
  }

  function submitComment() {
    dispatchComment(text);
    setText('', true);
  }

  function getCloseTextValue() {
    let status = isOpen ? 'Close' : 'Reopen';
    if(hasText) {
      return status + ' issue and comment';
    } else {
      return status + ' issue';
    }
  } 

  /* Event dispatchers */
  function dispatchComment(value) {
    let ev = new CustomEvent('comment-saved', {
      bubbles: true,
      detail: value
    });
    frag.dispatchEvent(ev);
  }

  function dispatchStatus(status) {
    let ev = new CustomEvent('status', {
      detail: status
    });
    frag.dispatchEvent(ev);
  }

  /* Event listeners */
  function onTextareaKeyup(ev) {
    setText(ev.target.value);
  }

  function onSubmitClick() {
    submitComment();
  }

  function onCloseClick() {
    if(hasText) {
      submitComment();
    }
    dispatchStatus(isOpen ? 'closed' : 'open');
  }

  /* Initialization stuff */
  textareaNode.addEventListener('keyup', onTextareaKeyup);
  submitNode.addEventListener('click', onSubmitClick);
  closeNode.addEventListener('click', onCloseClick);

  function update(data = {}) {
    if(data.status) setStatus(data.status);
    return frag;
  }

  return update;
}

export default init;