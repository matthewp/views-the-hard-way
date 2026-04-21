# Writing JavaScript Views the Hard Way

Learn how to build views in plain JavaScript in a way that is maintainable, performant, and fun. _Writing JavaScript Views the Hard Way_ is inspired by such books as [Learn C the Hard Way](https://learncodethehardway.org/c/).

## What is this?

Writing JavaScript Views the Hard Way is a **pattern** — not a library — for writing JavaScript views. It is meant to serve as an alternative to using frameworks and libraries such as [React](https://reactjs.org), [Vue](https://vuejs.org/), and [lit-html](https://lit.dev/).

Because it is a pattern, there is nothing to install and no version to upgrade. This document explains how to write views in a way that avoids the [spaghetti code](https://en.wikipedia.org/wiki/Spaghetti_code) problems that commonly plague low-level imperative code. We call the technique _the hard way_ because it eschews abstractions in favor of directness.

## Why this pattern

- **Low overhead**: direct imperative code reduces abstraction cost and makes DOM work easier to profile. The pattern isn't a performance silver bullet — real wins still depend on avoiding unnecessary layout, paint, and high-frequency DOM churn — but the directness makes that work easier to measure and optimize.
- **Zero dependencies**: your code will _never_ require an upgrade or deal with a breaking change.
- **Portability**: code written this way is portable to any framework, which makes it perfect for low-level components shared across communities.
- **Maintainability**: despite the reputation of imperative code being hard to maintain, views written this way are _extremely_ maintainable because they follow strict conventions. You always know where to look.
- **Browser support**: uses only what the browser gives you. `<template>`, `CustomEvent`, and `AbortController` are everywhere modern; older targets are a small swap away (see Compatibility below).
- **Easier to debug**: stack traces stay shallow because there are no layers between events and your code. Name your functions and you'll get traces that tell you exactly how you got somewhere.
- **Functional (in the non-dogmatic sense)**: no classes, no inheritance, no `this`. Just plain functions — there _is_ mutation, but it's confined to one place per piece of state.

## A complete hello world

Here's the entire pattern in one module. Each piece is explained in the sections that follow.

```javascript
import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = `<div class="greeting">
  Hello <span class="name">world</span>!
</div>`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

function init() {
  // DOM Variables
  const el = clone();
  const nameNode = q(el, ".name");

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
    if ("name" in data) setName(data.name);
    return el;
  }

  return update;
}

export default init;
```

And consuming it:

```html
<!doctype html>
<html lang="en">
  <title>Hello world</title>
  <main></main>
  <script type="module">
    import init from "./view.js";
    const main = document.querySelector("main");
    const update = init();
    main.appendChild(update({ name: "world" }));
  </script>
</html>
```

That's the whole pattern. Every view you write follows this shape.

## The three parts of every view module

### 1. The template

HTML structure defined in a `<template>` element. Use static markup only — no interpolations. Mark elements with classes or data attributes for later querying. Avoid `id` on anything that might be rendered more than once in a page.

```javascript
const template = document.createElement("template");
template.innerHTML = `<div class="greeting">
  Hello <span class="name">world</span>!
</div>`;
```

### 2. `clone()`

Duplicates the template. **Always return an element, never a fragment** — fragments get emptied on `appendChild`, which silently breaks any `update()` call that expects to re-mount the same node.

Prefer `template.content.cloneNode(true)` over `document.importNode`. `importNode` exists to cross document boundaries (e.g. adopting nodes from an `<iframe>`); a template's content lives in the same document, so `cloneNode` is the direct idiom. Guard against a missing root so a template with no root element fails loudly:

```javascript
function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}
```

### 3. `init()`

Creates a closure containing all view state and logic. Returns an `update()` function that parents call to pass props and receive the rendered element.

Because `init()` creates a new view instance, it plays the role a component constructor plays in a framework — setup work happens once here, and subsequent `update()` calls reconcile props without rebuilding anything.

## A recommended helper: `q()`

`querySelector` returns `Element | null`, and a typo in a selector only surfaces on first mutation — often far from the cause. A tiny helper turns that silent failure into an immediate, loud one:

```javascript
// q.js — put in a shared module and import where needed.
export function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}
```

For views with only one or two queries, a direct `el.querySelector(...)` is fine. Past that, prefer the helper.

## Why do so many functions take no arguments?

A common first question: "why does `canDecrement()` take no arguments? Why doesn't `onIncrementClick` receive the count?" The answer is intentional: `init()` creates a **closure**, and every function declared inside it reads and writes the closed-over state directly. Passing `count` into `canDecrement(count)` would be redundant and — more importantly — would leak the invariant the pattern relies on: _state lives in exactly one place, and only state setters transition it_.

The rule:

- Functions at the **boundary** of the closure (things called by parents, or that receive external input) take arguments: `update(data)`, `setName(value)`, `setNameNode(value)`.
- Functions **inside** the closure (helpers, dispatchers, listeners, lifecycle) take no arguments by convention, because they already see everything they need. Event listeners and observer callbacks are the one exception — they receive the native `Event` or entries array, even if most handlers ignore it.

## The sections inside `init()`

`init()` is organized into clearly-marked sections in this exact order. Not every view uses every section — empty sections can be omitted, but the ones present must appear in the order below.

### DOM Variables

Cached references to DOM elements that need updating or that children mount into. Named with the `Node` suffix (the root is conventionally `el`). Prefer `const` — these references are set once.

```javascript
// DOM Variables
const el = clone();
const nameNode = q(el, ".name");
const emailNode = q(el, ".email");
```

### DOM Views

References to child view instances. Named with the `update` prefix. Initial composition (appending child DOM into this view's tree) happens here — this is the one place in the pattern where DOM structure is assembled outside a `set[Node]Node` function, because we're _building_ the view, not updating it.

```javascript
// DOM Views
const updateAvatar = avatarInit();
avatarContainer.appendChild(updateAvatar({ url: initialUrl }));
```

### State Constants

Values fixed for the lifetime of this view instance (bounds, thresholds, configuration). `const`.

```javascript
// State Constants
const min = 0;
```

### State Variables

Non-DOM data (strings, numbers, objects) that can change over the lifetime of the view. Declared with `let`. Leaving them `undefined` initially is deliberate — the first `set[Name]()` call always passes the inequality check, so the DOM reflects the first value received.

```javascript
// State Variables
let name;
let email;
let isActive;
```

### DOM Update Functions

**The only place where DOM mutations occur.** Named `set[Node]Node()` matching the DOM variable name. They take a value and apply it directly — no equality check, that's the state setter's job.

DOM update functions own **structural** and **ARIA** reflection of state (disabled, aria-selected, tabindex, hidden, etc.). They do **not** own focus movement — that's a user-interaction concern, covered in the skill's accessibility section.

```javascript
// DOM Update Functions
function setNameNode(value) {
  nameNode.textContent = value;
}
```

### State Update Functions

Modify state variables and trigger the corresponding DOM update. Named `set[Name]()` matching the state variable. **Always check equality before proceeding** — this is where redundant DOM work is prevented.

```javascript
// State Update Functions
function setName(value) {
  if (name !== value) {
    name = value;
    setNameNode(value);
  }
}
```

Usually one state update function calls exactly one DOM update function. If you find yourself touching multiple DOM nodes from a single state setter, either wrap them in one DOM update function, or split the state into smaller pieces.

### State Logic

Pure helpers for derived state or computations. No arguments: they read closure state directly.

```javascript
// State Logic
function canDecrement() {
  return count - 1 >= min;
}
```

### Event Dispatchers

Functions that emit custom events to parent components. Use `composed: true` so the event crosses shadow DOM boundaries — important if the view is ever embedded inside a web component.

```javascript
// Event Dispatchers
function dispatchChange() {
  el.dispatchEvent(
    new CustomEvent("change", {
      detail: { count },
      bubbles: true,
      composed: true,
    }),
  );
}
```

Mirror native form semantics when you can: `input` for continuous feedback during an ongoing gesture, `change` when the user commits the value.

### Event Listeners

**Named functions** that handle DOM events. Never use anonymous functions — named functions can be removed later and produce better stack traces. The same rule applies to any long-lived subscription callback (`ResizeObserver`, `IntersectionObserver`, `MutationObserver`, `requestAnimationFrame` loops).

Handlers receive the native `Event` as their first argument, even when unused.

```javascript
// Event Listeners
function onIncrementClick(/* event */) {
  setCount(count + 1);
  dispatchChange();
}
```

### Init Functionality

Setup code that runs once:

1. Set initial state values.
2. Bind event listeners via a single `AbortController`.
3. If the view may be removed from the DOM, expose a `disconnect()` so the parent can tear down and cascade to children.

```javascript
// Init Functionality
setCount(0);

const ac = new AbortController();
const { signal } = ac;

incrementNode.addEventListener("click", onIncrementClick, { signal });
decrementNode.addEventListener("click", onDecrementClick, { signal });

function disconnect() {
  // Order matters: abort our own listeners first so we stop reacting to
  // in-flight events, THEN cascade to children. Tearing down children
  // while still listening risks dispatching against half-disconnected state.
  ac.abort();
  updateAvatar.disconnect?.();
}
```

A single `AbortController` is far less error-prone than pairing each `addEventListener` with a matching `removeEventListener`. For static components that never leave the DOM, skip `disconnect()` entirely.

### `update()`

Always the last thing in `init()`. Receives props, calls state setters, returns the element. If `disconnect` is defined, attach it as a property on `update`:

```javascript
function update(data = {}) {
  if ("name" in data) setName(data.name);
  return el;
}

update.disconnect = disconnect; // only if the view supports teardown

return update;
```

The `'name' in data` check is deliberate: passing `{}` skips the field entirely, while passing `{ name: undefined }` explicitly sets it to `undefined`. Callers can clear a field without needing a separate "unset" method.

## Critical rules

### Exclusive mutation

- DOM updates happen only through `set[Node]Node` functions.
- State changes only through `set[Name]` functions.
- The one exception is **initial composition** in DOM Views, where child elements first mount into the tree.

This consolidation means every DOM change and every state transition has exactly one breakpoint location.

### Props down, events up

- Data flows downward through `update(data)`.
- Child events bubble up through `CustomEvent` (with `composed: true` if shadow DOM is in play) or explicit callbacks passed down via `update`.
- Never reach up into parent state.

### Single responsibility

Each state variable maps to one DOM update function. If a state variable affects multiple DOM nodes, either wrap them in one DOM update function or split the state.

### Conditional updates

State setters check for change. DOM setters never do.

```javascript
function setName(value) {
  if (name !== value) {
    // gate here
    name = value;
    setNameNode(value); // unconditional DOM write
  }
}
```

### Cascading disconnect

If a view composes children that expose `update.disconnect`, the parent's `disconnect()` **must** call them — **after** aborting its own listeners. Missing the cascade is the most common memory leak in the pattern; getting the order wrong is the most common source of spurious late events during teardown.

## A complete example — Counter

Putting it all together:

```javascript
import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = `<div class="counter">
  <button class="decrement" type="button" aria-label="Decrement">-</button>
  <span class="count">0</span>
  <button class="increment" type="button" aria-label="Increment">+</button>
</div>`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

function init() {
  // DOM Variables
  const el = clone();
  const countNode = q(el, ".count");
  const incrementNode = q(el, ".increment");
  const decrementNode = q(el, ".decrement");

  // State Constants
  const min = 0;

  // State Variables
  let count;

  // DOM Update Functions
  function setCountNode(value) {
    countNode.textContent = String(value);
    // Reflect disabled state for accessibility whenever count changes.
    decrementNode.disabled = value <= min;
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

  // Event Dispatchers
  function dispatchChange() {
    el.dispatchEvent(
      new CustomEvent("change", {
        detail: { count },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Event Listeners
  function onIncrementClick(/* event */) {
    setCount(count + 1);
    dispatchChange();
  }

  function onDecrementClick(/* event */) {
    if (canDecrement()) {
      setCount(count - 1);
      dispatchChange();
    }
  }

  // Init Functionality
  setCount(0);

  const ac = new AbortController();
  const { signal } = ac;
  incrementNode.addEventListener("click", onIncrementClick, { signal });
  decrementNode.addEventListener("click", onDecrementClick, { signal });

  function disconnect() {
    ac.abort();
  }

  function update(data = {}) {
    if ("count" in data) setCount(data.count);
    return el;
  }

  update.disconnect = disconnect;
  return update;
}

export default init;
```

## Going further

This README covers the core pattern. The full skill documentation adds:

- **TypeScript** — minimal annotations, a typed `q()`, and deriving the view type with `ReturnType<typeof init>`.
- **Throttling and debouncing** — handling high-frequency events (`scroll`, `resize`, `pointermove`, text `input`) with `AbortSignal`-aware helpers so teardown is free.
- **Accessibility** — focus management, focus restoration, focus traps (prefer native `<dialog>` with `showModal()`), keyboard patterns (Escape, arrow keys, roving `tabindex`), and the Popover API for non-modal overlays.
- **Web components interop** — wrapping a factory as a custom element, handling `connectedMoveCallback` and state-preserving `moveBefore()`, deferring teardown with `queueMicrotask` + `isConnected`, attribute reflection without feedback loops, and choosing light DOM vs. shadow DOM.
- **SSR and hydration** — accepting an existing server-rendered root and seeding state directly from a `data-state` attribute without re-rendering.

Each of these builds on the core pattern above without changing it.

## Compatibility

The pattern uses widely-supported browser APIs:

- `<template>` and `DocumentFragment` — everywhere.
- `CustomEvent` with `composed: true` — everywhere modern (the `composed` flag only matters if you use shadow DOM).
- `AbortController` on `addEventListener` — all evergreen browsers.
- `queueMicrotask` — all evergreen browsers.

For older targets, two common swaps:

- **No `AbortController` support for listeners** — keep a list of `[node, event, handler]` triples and loop through them in `disconnect()` calling `removeEventListener`. A little more bookkeeping, same pattern.
- **`CustomEvent` is awkward or unavailable** — pass callbacks as props instead of dispatching events. "Props down" stays the same; "events up" becomes "callbacks up." No structural change otherwise.

With those swaps the pattern works back to IE9, and with a few more (no `const`/`let`, no template literals, no arrow functions) back to IE6. No other change to the structure is needed — the section layout, the exclusive-mutation rule, and the props-down/events-up flow are all just conventions over what every browser has always given you.
