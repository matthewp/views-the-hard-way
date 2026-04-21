#!/usr/bin/env node
const template = `const template = document.createElement('template');
template.innerHTML = /* html */ \`
  <div class="greeting">
    Hello <span class="name"></span>!
  </div>
\`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error('hardview: template has no root element');
  return root;
}

function init() {
  // DOM Variables
  const el = clone();
  const nameNode = el.querySelector('.name');

  // State Variables
  let name;

  // DOM Update Functions
  function setNameNode(value) {
    nameNode.textContent = value;
  }

  // State Update Functions
  function setName(value) {
    if (name !== value) {
      name = value;
      setNameNode(value);
    }
  }

  // Update
  function update(data = {}) {
    if ('name' in data) setName(data.name);
    return el;
  }

  return update;
}

export default init;
`;
process.stdout.write(template);
