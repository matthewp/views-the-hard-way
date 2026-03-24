---
name: hardview
description: "Create vanilla JavaScript view components using the 'Views the Hard Way' pattern — render templates, bind event handlers, compose child views, and manage component lifecycle with raw DOM manipulation. Use when asked to create a view, component, or UI element with vanilla JavaScript, or when the user mentions 'hardview' or 'views the hard way'."
---

# Views the Hard Way

A pattern—not a library—for building views using plain JavaScript with native browser APIs. This approach emphasizes directness over abstraction, achieving maximum performance with zero dependencies.

## Structure of Every View

Each view module has exactly three parts:

### 1. The Template

HTML structure defined in a `<template>` element. Use static markup only—no interpolations. Mark elements with identifiers (IDs, classes, or data attributes) for later querying.

```javascript
const template = document.createElement('template');
template.innerHTML = `<div class="user-card">
  <span class="name"></span>
  <span class="email"></span>
</div>`;
```

### 2. The Clone Function

A helper that efficiently duplicates the template:

```javascript
function clone() {
  return document.importNode(template.content, true);
}
```

Use `.firstElementChild` when you need an element rather than a fragment:

```javascript
function clone() {
  return document.importNode(template.content, true).firstElementChild;
}
```

### 3. The Init Function

Creates a closure containing all view state and logic. Returns an `update()` function that parent views call to pass props and receive the rendered DOM.

## The Six Sections Inside init()

The `init()` function is organized into clearly-marked sections in this exact order:

### Section 1: DOM Variables

Cached references to DOM elements that need updating. Named with `Node` suffix.

```javascript
// DOM Variables
let frag = clone();
let nameNode = frag.querySelector('.name');
let emailNode = frag.querySelector('.email');
```

### Section 2: DOM Views

References to child view instances. Named with `update` prefix. These are other views composed within this view.

```javascript
// DOM Views
let updateAvatar = avatarInit();
let updateBadge = badgeInit();
```

### Section 3: State Variables

Non-DOM data like strings, numbers, or objects. These enable conditional updates to prevent unnecessary DOM mutations.

```javascript
// State Variables
let name;
let email;
let isActive;
```

### Section 4: DOM Update Functions

**The ONLY place where DOM mutations occur.** Named as `set[Node]Node()` matching the DOM variable name.

```javascript
// DOM Update Functions
function setNameNode(value) {
  nameNode.textContent = value;
}

function setEmailNode(value) {
  emailNode.textContent = value;
}
```

These functions:
- Take a value and apply it directly to the DOM
- Do NOT check if the value changed (that's the state setter's job)
- Are simple and focused—one DOM mutation per function

### Section 5: State Update Functions

Modify state variables and trigger corresponding DOM updates. Named as `set[Name]()` matching the state variable.

```javascript
// State Update Functions
function setName(value) {
  if (name !== value) {
    name = value;
    setNameNode(value);
  }
}

function setEmail(value) {
  if (email !== value) {
    email = value;
    setEmailNode(value);
  }
}
```

These functions:
- **Always check if the value actually changed** before proceeding
- Update the state variable
- Call the corresponding DOM update function
- Prevent redundant DOM operations

### Section 6: State Logic

Helper functions for derived state or computations.

```javascript
// State Logic
function canDecrement() {
  return count - 1 >= min;
}
```

### Section 7: Event Dispatchers

Functions that emit custom events to parent components.

```javascript
// Event Dispatchers
function dispatchChange() {
  el.dispatchEvent(new CustomEvent('change', {
    detail: { count },
    bubbles: true
  }));
}
```

### Section 8: Event Listeners

**Named functions** that handle DOM events. Never use anonymous functions for event listeners—named functions can be removed later and are easier to debug.

```javascript
// Event Listeners
function onIncrementClick() {
  setCount(count + 1);
}

function onDecrementClick() {
  if (canDecrement()) {
    setCount(count - 1);
  }
}
```

### Section 9: Init Functionality

Setup code that runs once. This section:
1. Sets initial state values
2. Defines `connect()` to attach event listeners
3. Calls `connect()` immediately
4. Defines `disconnect()` to remove event listeners (for components that may be removed from the DOM)

```javascript
// Init Functionality
setCount(0);

function connect() {
  incrementNode.addEventListener('click', onIncrementClick);
  decrementNode.addEventListener('click', onDecrementClick);
}
connect();

function disconnect() {
  incrementNode.removeEventListener('click', onIncrementClick);
  decrementNode.removeEventListener('click', onDecrementClick);
}
```

**Note:** The `connect`/`disconnect` pattern is only necessary for components that may be dynamically added or removed from the DOM. For static components, you can simply attach listeners directly in this section without the connect/disconnect functions.

### The Update Function

Always the last thing in `init()`. Receives props from parent, calls state setters, returns the DOM. If using connect/disconnect, attach them as properties on update.

```javascript
function update(data = {}) {
  if ('name' in data) setName(data.name);
  if ('email' in data) setEmail(data.email);
  return frag;
}

// Only if using connect/disconnect pattern:
update.connect = connect;
update.disconnect = disconnect;

return update;
```

## Critical Rules

### Exclusive Mutation

- DOM must **only** be modified through DOM Update Functions (`set[Node]Node`)
- State must **only** be modified through State Update Functions (`set[Name]`)
- This consolidates logic and enables reliable debugging via breakpoints

### Props Down, Events Up

- Data flows downward through `update(data)` function arguments
- Child events bubble up through CustomEvent or callbacks
- Never reach up into parent state

### Single Responsibility

- Each state variable maps to one corresponding DOM update function
- If a state variable affects multiple DOM nodes, either:
  - Create one DOM update function that handles all related nodes
  - Split into multiple state variables

### Conditional Updates

Always guard state setters with an equality check before mutating (see State Update Functions above).

## Complete Example

```javascript
const template = document.createElement('template');
template.innerHTML = `<div class="greeting">
  Hello <span class="name">world</span>!
</div>`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  // DOM Variables
  let frag = clone();
  let nameNode = frag.querySelector('.name');

  // DOM Views
  // (none in this example)

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
    return frag;
  }

  return update;
}

export default init;
```

## Advanced Examples

See reference files for complete examples:
- [COMPOSITION.md](COMPOSITION.md) — Composing child views within a parent view
- [EVENTS.md](EVENTS.md) — Event handling, dispatchers, and connect/disconnect lifecycle
- [TYPESCRIPT.md](TYPESCRIPT.md) — TypeScript typing guidelines and conventions

## When Creating Views

1. **Detect file extension**: Check for `tsconfig.json` or existing `.ts` files in the project. Use `.ts` if found, otherwise `.js`
2. Start with the template HTML structure
3. Identify which elements need dynamic updates
4. Create state variables for each piece of dynamic data
5. Create DOM update functions for each DOM mutation
6. Create state update functions that check for changes
7. Wire up the update function to receive props
8. Add event listeners and dispatchers as needed
