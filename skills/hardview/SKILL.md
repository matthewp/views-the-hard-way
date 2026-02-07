---
name: hardview
description: Create vanilla JavaScript view components using the "Views the Hard Way" pattern. Use when asked to create a view, component, or UI element with raw/vanilla JavaScript DOM manipulation, or when the user mentions "hardview" or "views the hard way".
---

# Views the Hard Way

A pattern—not a library—for building views using plain JavaScript with native browser APIs. This approach emphasizes directness over abstraction, achieving maximum performance with zero dependencies.

## Why This Pattern?

- **Performance**: Direct imperative code eliminates unnecessary operations
- **Zero dependencies**: Code never requires upgrades or breaking changes
- **Portability**: Views work across frameworks and communities
- **Maintainability**: Strict conventions ensure consistency
- **Debugging**: Shallow stack traces make troubleshooting straightforward
- **Functional approach**: Plain functions without classes or side effects

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

Always check if values changed in state setters:

```javascript
function setName(value) {
  if (name !== value) {  // ALWAYS check
    name = value;
    setNameNode(value);
  }
}
```

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

## Example with Child Views

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

## Example with Events (Counter)

```javascript
const template = document.createElement('template');
template.innerHTML = `<div class="counter">
  <button class="decrement">-</button>
  <span class="count">0</span>
  <button class="increment">+</button>
</div>`;

function clone() {
  return document.importNode(template.content, true).firstElementChild;
}

function init() {
  // DOM Variables
  let el = clone();
  let countNode = el.querySelector('.count');
  let incrementNode = el.querySelector('.increment');
  let decrementNode = el.querySelector('.decrement');

  // State Constants
  const min = 0;

  // State Variables
  let count;

  // DOM Update Functions
  function setCountNode(value) {
    countNode.textContent = value;
  }

  // State Update Functions
  function setCount(value) {
    if (count !== value) {
      count = value;
      setCountNode(value);
    }
  }

  // State Logic
  function canDecrement() {
    return count - 1 >= min;
  }

  // Event Listeners
  function onIncrementClick() {
    setCount(count + 1);
  }

  function onDecrementClick() {
    if (canDecrement()) {
      setCount(count - 1);
    }
  }

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

  // Update
  function update(data = {}) {
    if ('count' in data) setCount(data.count);
    return el;
  }

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

export default init;
```

## TypeScript

When using TypeScript, add types minimally and let inference handle most things. Only add explicit types where TypeScript can't infer correctly.

### What to type explicitly

**Props interface** - Define an interface for the data parameter:

```typescript
interface CounterProps {
  count?: number;
}
```

**DOM query results** - querySelector returns `Element | null`, so cast to the specific element type:

```typescript
let countNode = el.querySelector('.count') as HTMLSpanElement;
let buttonNode = el.querySelector('.increment') as HTMLButtonElement;
```

**Clone return** - `firstElementChild` can be null, so assert:

```typescript
function clone() {
  return document.importNode(template.content, true).firstElementChild as HTMLElement;
}
```

### What to let TypeScript infer

- Return type of `init()` - inferred from the function body
- Return type of `update()` - inferred as the element type
- State variable types (usually) - inferred from initial assignment
- Internal function signatures - inferred from usage

### Export the view type

Use `ReturnType` to derive the view type from the implementation, then export it for consumers:

```typescript
export type CounterView = ReturnType<typeof init>;
```

This keeps the type in sync with the implementation automatically.

## When Creating Views

1. **Detect file extension**: Check for `tsconfig.json` or existing `.ts` files in the project. Use `.ts` if found, otherwise `.js`
2. Start with the template HTML structure
3. Identify which elements need dynamic updates
4. Create state variables for each piece of dynamic data
5. Create DOM update functions for each DOM mutation
6. Create state update functions that check for changes
7. Wire up the update function to receive props
8. Add event listeners and dispatchers as needed
