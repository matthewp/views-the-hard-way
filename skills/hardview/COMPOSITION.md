# Child View Composition

How to compose child views within a parent view using the hardview pattern.

```javascript
import avatarInit from './avatar.js';

const template = document.createElement('template');
template.innerHTML = `<div class="user-card">
  <div class="avatar-container"></div>
  <div class="info">
    <span class="name"></span>
    <span class="role"></span>
  </div>
</div>`;

function clone() {
  return document.importNode(template.content, true).firstElementChild;
}

function init() {
  // DOM Variables
  let el = clone();
  let avatarContainer = el.querySelector('.avatar-container');
  let nameNode = el.querySelector('.name');
  let roleNode = el.querySelector('.role');

  // DOM Views
  let updateAvatar = avatarInit();
  avatarContainer.appendChild(updateAvatar());

  // State Variables
  let name;
  let role;
  let avatarUrl;

  // DOM Update Functions
  function setNameNode(value) {
    nameNode.textContent = value;
  }

  function setRoleNode(value) {
    roleNode.textContent = value;
  }

  // State Update Functions
  function setName(value) {
    if (name !== value) {
      name = value;
      setNameNode(value);
    }
  }

  function setRole(value) {
    if (role !== value) {
      role = value;
      setRoleNode(value);
    }
  }

  function setAvatarUrl(value) {
    if (avatarUrl !== value) {
      avatarUrl = value;
      updateAvatar({ url: value });
    }
  }

  // Update
  function update(data = {}) {
    if ('name' in data) setName(data.name);
    if ('role' in data) setRole(data.role);
    if ('avatarUrl' in data) setAvatarUrl(data.avatarUrl);
    return el;
  }

  return update;
}

export default init;
```
