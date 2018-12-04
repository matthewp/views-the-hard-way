#!/usr/bin/env node
const template = `const template = document.createElement('template');
template.innerHTML = /* html */ \`
  <div>Hello <span id="name"></span></div>
\`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let nameNode = frag.querySelector('#name');

  /* State variables */
  let name;

  /* DOM update functions */
  function setNameNode(value) {
    nameNode.textContent = value;
  }

  /* State update functions */
  function setName(value) {
    if(name !== value) {
      name = value;
      setNameNode(value);
    }
  }

  /* Event listeners */

  /* Init functionality */
  function disconnect() {
    
  }

  function update(data = {}) {
    if(data.name) setName(data.name);

    return frag;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;
`;

process.stdout.write(template);