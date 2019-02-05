const template = document.createElement('template');
template.innerHTML = /* html */ `
  <div>Hello <span id="name"></span></div>
  <input type="text" name="first">
  <input type="text" name="last">
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let nameNode = frag.querySelector('#name');
  let firstNode = frag.querySelector('[name=first]');
  let lastNode = frag.querySelector('[name=last]');

  /* State variables */
  let fullName, first = '', last = '';

  /* DOM update functions */
  function setNameNode(value) {
    nameNode.textContent = value;
  }

  /* State update functions */
  function setFullName(value) {
    if(fullName !== value) {
      fullName = value;
      setNameNode(value);
    }
  }

  function setFirst(value) {
    if(first !== value) {
      first = value;
      setFullName(fullNameFromParts());
    }
  }

  function setLast(value) {
    if(last !== value) {
      last = value;
      setFullName(fullNameFromParts());
    }
  }

  /* Logic functions */
  function fullNameFromParts() {
    return first + ' ' + last;
  }

  /* Event listeners */
  function onFirstKeyUp(ev) {
    setFirst(ev.target.value);
  }

  function onLastKeyUp(ev) {
    setLast(ev.target.value);
  }

  /* Init functionality */
  firstNode.addEventListener('keyup', onFirstKeyUp);
  lastNode.addEventListener('keyup', onLastKeyUp);

  function disconnect() {
    firstNode.removeEventListener('keyup', onFirstKeyUp);
    lastNode.removeEventListener('keyup', onLastKeyUp);
  }

  function update(data = {}) {
    if(data.first) setFirst(data.first);
    if(data.last) setLast(data.last);
    return frag;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;