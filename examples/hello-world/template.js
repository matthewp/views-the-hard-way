const template = document.createElement('template');
template.innerHTML = /* html */ `
  <div>Hello <span id="name"></span></div>
  <input type="value" name="name">
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let nameNode = frag.querySelector('#name');
  let inputNode = frag.querySelector('[name=name]');

  /* State variables */
  let name;

  /* DOM update functions */
  function setNameNode(value) {
    nameNode.textContent = value;
  }

  function setInputNode(value) {
    inputNode.value = value;
  }

  /* State update functions */
  function setName(value) {
    if(name !== value) {
      name = value;
      setNameNode(value);
      setInputNode(value);
    }
  }

  /* Event listeners */
  function onInputName(ev) {
    setName(ev.target.value);
  }

  /* Init functionality */
  inputNode.addEventListener('keyup', onInputName);

  function disconnect() {
    inputNode.removeEventListener('keyup', onInputName);
  }

  function update(data = {}) {
    if(data.name) setName(data.name);

    return frag;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;