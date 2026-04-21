---
name: hardview
description: Create vanilla JavaScript view components using the "Views the Hard Way" pattern. Use when asked to create a view, component, or UI element with raw/vanilla JavaScript DOM manipulation, or when the user mentions "hardview" or "views the hard way".
---

# Views the Hard Way

A pattern — not a library — for building views using plain JavaScript with native browser APIs. This approach favors explicit, low-overhead DOM work with zero runtime dependencies. The pattern itself isn't a performance silver bullet — real wins still depend on avoiding unnecessary layout, paint, and high-frequency DOM churn — but the directness makes that work easier to measure and optimize.

## Why this pattern

- **Low overhead**: direct imperative code reduces abstraction cost and makes DOM work easier to profile.
- **Zero dependencies**: code never requires upgrades or breaking changes.
- **Portability**: views work across frameworks and communities.
- **Maintainability**: strict conventions ensure consistency.
- **Debugging**: shallow stack traces make troubleshooting straightforward.
- **Functional approach**: plain functions without classes or side effects.

## Why functions without arguments?

A common first question about this pattern is "why do so many functions take no arguments?". The answer is intentional: `init()` creates a **closure**, and every function declared inside it reads and writes the closed-over state directly. Passing `count` into `canDecrement(count)` would be redundant and — more importantly — would leak the invariant the pattern relies on: _state lives in exactly one place, and only state setters transition it_.

The rule is:

- Functions at the **boundary** of the closure (things called by parents, or that receive external input) take arguments: `update(data)`, `setName(value)`, `setNameNode(value)`.
- Functions **inside** the closure (helpers, dispatchers, listeners, lifecycle) take no arguments by convention, because they already see everything they need. Event listeners and observer callbacks are the one exception — they receive the native `Event` or entries array, even if most handlers ignore it.

## Structure of every view

Each view module has exactly three parts:

### 1. The template

HTML structure defined in a `<template>` element. Use static markup only — no interpolations. Mark elements with identifiers (IDs, classes, or data attributes) for later querying.

```javascript
const template = document.createElement("template");
template.innerHTML = `<div class="user-card">
  <span class="name"></span>
  <span class="email"></span>
</div>`;
```

### 2. The clone function

A helper that efficiently duplicates the template. **Always return an element, never a fragment** — fragments get emptied on `appendChild`, which silently breaks any `update()` call that expects to re-mount the same node.

Prefer `template.content.cloneNode(true)` over `document.importNode`. `importNode` exists to cross document boundaries (e.g. pulling a node out of an `<iframe>`); a template's content fragment lives in the same document, so `cloneNode` is the direct idiom and skips the adoption machinery. Guard against the null case so a template without a root element fails loudly:

```javascript
function clone() {
  // firstElementChild is the root of the template; it survives appendChild.
  // (A DocumentFragment would be emptied the first time you append it.)
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}
```

### 3. The init function

Creates a closure containing all view state and logic. Returns an `update()` function that parent views call to pass props and receive the rendered DOM element.

## A recommended helper: q()

`querySelector` returns `Element | null`, and a typo in a selector only surfaces on first mutation — often far from the cause. A tiny helper turns that silent failure into an immediate, loud one, and is recommended as the default DOM query in both JavaScript and TypeScript codebases:

```javascript
// Put this in a shared module (e.g. hardview/q.js) and import where needed.
export function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}
```

Every example below uses `q()`. For views with only one or two queries, a direct `el.querySelector(...)` is fine — but any view with more than that should prefer the helper.

## The sections inside init()

`init()` is organized into clearly-marked sections in this exact order. Not every view uses every section — empty sections can be omitted, but the ones present must appear in the order below.

### Section 1 — DOM variables

Cached references to DOM elements that need updating. Named with the `Node` suffix. Prefer `const` — these references are set once.

```javascript
// DOM Variables
const el = clone();
const nameNode = q(el, ".name");
const emailNode = q(el, ".email");
```

### Section 2 — DOM views

References to child view instances. Named with the `update` prefix. Initial composition (appending child DOM into this view's tree) happens here; this is the one place in the pattern where DOM structure is assembled outside a `set[Node]Node` function, because we're building the view, not _updating_ it.

```javascript
// DOM Views
const updateAvatar = avatarInit();
avatarContainer.appendChild(updateAvatar({ url: initialUrl })); // mount once with initial props
```

### Section 3 — State constants

Values fixed for the lifetime of this view instance (bounds, thresholds, configuration). Declared with `const`.

```javascript
// State Constants
const min = 0;
```

### Section 4 — State variables

Non-DOM data (strings, numbers, objects) that can change over the lifetime of the view. Declared with `let`. Leaving them `undefined` initially lets the first `set[Name]()` call always pass the inequality check.

```javascript
// State Variables
let name;
let email;
let isActive;
```

### Section 5 — DOM update functions

**The only place where DOM mutations occur.** Named `set[Node]Node()` matching the DOM variable name. They take a value and apply it directly — no equality check, that's the state setter's job.

DOM update functions own **structural** and **ARIA** reflection of state (disabled, aria-selected, tabindex, hidden, etc.). They do **not** own focus movement — that's a user-interaction concern (see the Accessibility section for why).

```javascript
// DOM Update Functions
function setNameNode(value) {
  nameNode.textContent = value;
}

function setEmailNode(value) {
  emailNode.textContent = value;
}
```

### Section 6 — State update functions

Modify state variables and trigger the corresponding DOM update. Named `set[Name]()` matching the state variable. **Always check equality before proceeding** — this is where redundant DOM work is prevented.

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

### Section 7 — State logic

Pure helpers for derived state or computations. No arguments: they read closure state directly.

```javascript
// State Logic
function canDecrement() {
  return count - 1 >= min;
}
```

### Section 8 — Event dispatchers

Functions that emit custom events to parent components. Use `composed: true` so the event crosses shadow DOM boundaries — important if the view is ever embedded inside a web component.

```javascript
// Event Dispatchers
function dispatchChange() {
  el.dispatchEvent(
    new CustomEvent("change", {
      detail: { count },
      bubbles: true,
      composed: true, // cross shadow DOM boundaries
    }),
  );
}
```

#### Common dispatch patterns

**`input` vs. `change` — rate of firing.** Mirror native form semantics: `input` fires on every keystroke or drag tick for continuous feedback, `change` fires only when the user commits the value (blur, Enter, releasing a slider). A debounced search field dispatches both — `input` for the live count, `change` for the final query sent upstream.

```javascript
// Fires on every keystroke — parent can show live preview, debounced suggestions, etc.
function dispatchInput() {
  el.dispatchEvent(
    new CustomEvent("input", {
      detail: { value: query },
      bubbles: true,
      composed: true,
    }),
  );
}

// Fires only when the user commits (blur, Enter). Parent does expensive work here.
function dispatchChange() {
  el.dispatchEvent(
    new CustomEvent("change", {
      detail: { value: query },
      bubbles: true,
      composed: true,
    }),
  );
}
```

**Payloads with context.** `detail` is arbitrary — include everything the parent needs so it doesn't have to reach back into the view. For a selectable list item, send the identifier, the index, and any modifier keys that were pressed:

```javascript
function dispatchSelect(event) {
  el.dispatchEvent(
    new CustomEvent("select", {
      detail: {
        id: itemId,
        index: itemIndex,
        // Modifier keys — the parent decides what multi-select means.
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
      },
      bubbles: true,
      composed: true,
    }),
  );
}
```

This is the only legitimate reason to pass the native event _into_ a dispatcher: to forward modifier state the dispatcher couldn't otherwise see. Keep the payload serializable — no DOM nodes, no functions. If the parent needs the target element, it can read `event.target` on the received CustomEvent.

**Cancelable dispatches.** For events the parent should be able to veto (before-close, before-delete, before-submit), set `cancelable: true` and check `defaultPrevented` after dispatch. The dispatch function returns a boolean so the caller knows whether to proceed:

```javascript
// Returns true if the event ran to completion, false if the parent called preventDefault().
function dispatchBeforeClose() {
  const event = new CustomEvent("beforeclose", {
    detail: { reason: "user" },
    bubbles: true,
    composed: true,
    cancelable: true, // enables event.preventDefault() in listeners
  });
  el.dispatchEvent(event);
  return !event.defaultPrevented;
}

// Called from the event listener that would close the dialog:
function onCloseClick() {
  if (dispatchBeforeClose()) {
    setOpen(false);
  }
  // If the parent called preventDefault(), we do nothing.
}
```

The parent listens like this:

```javascript
dialogEl.addEventListener("beforeclose", (event) => {
  if (hasUnsavedChanges) event.preventDefault(); // blocks the close
});
```

Use cancelable events sparingly — they couple the child to the parent's decision timing (the parent must respond synchronously, before the dispatcher returns). For async confirmation ("are you sure?" dialogs), a request/response pattern via two separate events is cleaner than trying to make `beforeclose` async.

### Section 9 — Event listeners

**Named functions** that handle DOM events. Never use anonymous functions for listeners — named functions can be removed later and produce better stack traces. The same rule applies to any **long-lived subscription callback**: `ResizeObserver`, `IntersectionObserver`, `MutationObserver`, and `requestAnimationFrame` loops all show up in stack traces and debugger breakpoints, so they deserve names too.

Handlers receive the native `Event` as their first argument. Include the parameter even when unused; it documents the signature and lets future maintainers reach for `event.preventDefault()` or `event.target` without restructuring.

```javascript
// Event Listeners
function onIncrementClick(/* event */) {
  setCount(count + 1);
}

function onDecrementClick(/* event */) {
  if (canDecrement()) {
    setCount(count - 1);
  }
}
```

#### Throttling and debouncing

High-frequency events — `scroll`, `resize`, `pointermove`, `input` on text fields, `wheel` — fire faster than the DOM can reasonably respond. Throttle or debounce them at the listener, not at the state setter, so the state-equality check still short-circuits no-op updates correctly.

The distinction:

- **Throttle** — run the handler at most once every N milliseconds. Use for continuous feedback during an ongoing gesture (scroll position, live resize). The user should see _something_ updating while they interact.
- **Debounce** — wait until N milliseconds of silence, then run the handler once. Use for "finished typing" or "finished resizing" semantics where intermediate values are noise.

The `throttle` helper below fires on both the **leading** and **trailing** edge: it invokes immediately on the first call, then at most once per `wait` ms, with a final trailing call if the last invocation fell inside the cooldown window. That's the right default for UI — it feels responsive and never drops the final value — but if you need leading-only or trailing-only behavior, add options to taste.

Both helpers accept an `AbortSignal` so the view's existing `AbortController` tears them down automatically — no separate cleanup logic needed.

```javascript
// Utilities — put in a shared module (e.g. hardview/rate-limit.js).

// Throttle with leading + trailing calls (see note above).
export function throttle(fn, wait, { signal } = {}) {
  let lastCall = 0;
  let trailingTimer = null;
  let lastArgs = null;

  function invoke(args) {
    lastCall = performance.now();
    fn(...args);
  }

  function throttled(...args) {
    const now = performance.now();
    const remaining = wait - (now - lastCall);
    lastArgs = args;
    if (remaining <= 0) {
      if (trailingTimer) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
      }
      invoke(args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        trailingTimer = null;
        invoke(lastArgs);
      }, remaining);
    }
  }

  signal?.addEventListener(
    "abort",
    () => {
      if (trailingTimer) clearTimeout(trailingTimer);
    },
    { once: true },
  );

  return throttled;
}

// Debounce — fires once, `wait` ms after the last call.
export function debounce(fn, wait, { signal } = {}) {
  let timer = null;

  function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  }

  signal?.addEventListener(
    "abort",
    () => {
      if (timer) clearTimeout(timer);
    },
    { once: true },
  );

  return debounced;
}
```

**Scroll — throttle.** Update a progress bar as the user scrolls, at most every 100ms. For scroll specifically, pass `{ passive: true }` to the listener so the browser doesn't wait on the handler before scrolling — this is the single biggest scroll-performance win.

```javascript
import { throttle } from "./rate-limit.js";

// Event Listeners
const onScroll = throttle(
  function () {
    // runs at most every 100ms
    setScrollProgress(window.scrollY / document.documentElement.scrollHeight);
  },
  100,
  { signal },
);

// Init Functionality
window.addEventListener("scroll", onScroll, { signal, passive: true });
```

**Resize — debounce.** Recomputing layout is expensive; waiting 150ms after the user stops dragging the window edge is almost always fine.

```javascript
import { debounce } from "./rate-limit.js";

// Event Listeners
const onResize = debounce(
  function () {
    setViewportWidth(window.innerWidth);
  },
  150,
  { signal },
);

// Init Functionality
window.addEventListener("resize", onResize, { signal });
```

For element-level resize observation, use [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) instead of the `resize` event — it's debounced by the browser and scoped to specific elements. Give the callback a name for better stack traces, and disconnect in `disconnect()`:

```javascript
// DOM Variables / Views
function onElementResize(entries) {
  setWidth(entries[0].contentRect.width);
}
const ro = new ResizeObserver(onElementResize);
ro.observe(el);

function disconnect() {
  ro.disconnect(); // observers don't respect AbortSignal — tear down first…
  ac.abort(); // …then abort event listeners.
}
```

**Input — debounce for expensive work, fire immediately for cheap UI.** A search field that hits the network wants debounced dispatch; a character counter next to the input should update on every keystroke.

```javascript
import { debounce } from "./rate-limit.js";

// Event Listeners
function onInput(event) {
  setQuery(event.target.value); // cheap: updates the character counter immediately
  dispatchInputDebounced(); // expensive: parent kicks off network request
}

// The debounced dispatcher wraps the normal one.
const dispatchInputDebounced = debounce(
  function () {
    dispatchInput(); // the actual CustomEvent dispatch from Section 8
  },
  250,
  { signal },
);

// Init Functionality
inputNode.addEventListener("input", onInput, { signal });
```

Note the separation: the state setter (`setQuery`) runs synchronously so the UI feels responsive, while the side effect that leaves the component (`dispatchInput`) is rate-limited. This is almost always the right split — debouncing state updates makes the component itself feel laggy.

**Choosing the delay.** Rough defaults: scroll 50–100ms throttle, resize 100–200ms debounce, search input 200–300ms debounce, mousemove/pointermove 16ms throttle (≈60fps). Tune by measuring, not by guessing.

### Section 10 — Init functionality

Setup code that runs once:

1. Set initial state values.
2. Bind event listeners.
3. For components that may be dynamically removed from the DOM, expose a `disconnect()` so the parent can tear down listeners and cascade to children.

The pattern uses [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for listener management. A single `abort()` call removes every listener bound with the controller's signal, which is far less error-prone than pairing each `addEventListener` with a matching `removeEventListener`.

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

**Note:** `disconnect()` is only needed for components that may be removed from the DOM. For static components, skip it entirely.

### The update function

Always the last thing in `init()`. Receives props from the parent, calls state setters, returns the element. If `disconnect` is defined, attach it as a property on `update` so the parent can call `child.disconnect()`.

```javascript
function update(data = {}) {
  if ("name" in data) setName(data.name);
  if ("email" in data) setEmail(data.email);
  return el;
}

// Only if the component supports teardown:
update.disconnect = disconnect;

return update;
```

Note that `update(data = {})` uses `'name' in data` semantics: passing `{}` skips the field entirely, while passing `{ name: undefined }` explicitly sets it to `undefined`. This distinction is deliberate — callers can clear a field without needing a separate "unset" method.

## Critical rules

### Exclusive mutation

- DOM updates must only happen through `set[Node]Node` functions.
- State must only change through `set[Name]` functions.
- The one exception is **initial composition** in Section 2 (DOM Views), where child elements are first mounted into the tree.

This consolidation means every DOM change and every state transition has exactly one breakpoint location.

**Focus movement is not DOM mutation for the purposes of this rule.** `.focus()` belongs in the event listener that represents user intent (see Accessibility), not in a DOM update function that also runs during parent-driven prop changes.

### Props down, events up

- Data flows downward through the `update(data)` argument.
- Child events bubble up through `CustomEvent` (with `composed: true` if shadow DOM is in play) or explicit callbacks passed down via `update`.
- Never reach up into parent state.

### Single responsibility

- Each state variable maps to one DOM update function.
- If a state variable affects multiple DOM nodes, either wrap them in one DOM update function or split the state.

### Conditional updates

State setters always check for change. DOM setters never do.

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

If this view composes child views that expose `update.disconnect`, the parent's `disconnect()` **must** call them — **after** aborting its own listeners. Missing the cascade is the most common memory leak in the pattern; getting the order wrong is the most common source of spurious late events during teardown.

## Complete example

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

## Example with child views

```javascript
import { q } from "./q.js";
import avatarInit from "./avatar.js";

const template = document.createElement("template");
template.innerHTML = `<div class="user-card">
  <div class="avatar-container"></div>
  <div class="info">
    <span class="name"></span>
    <span class="role"></span>
  </div>
</div>`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

function init() {
  // DOM Variables
  const el = clone();
  const avatarContainer = q(el, ".avatar-container");
  const nameNode = q(el, ".name");
  const roleNode = q(el, ".role");

  // DOM Views — mount children once, with any initial props they need.
  const updateAvatar = avatarInit();
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
      // Delegate to the child view — no direct DOM touch here.
      updateAvatar({ url: value });
    }
  }

  // Init Functionality — cascade disconnect to the avatar child view.
  // No listeners of our own, so no AbortController is needed here.
  function disconnect() {
    updateAvatar.disconnect?.();
  }

  // Update
  function update(data = {}) {
    if ("name" in data) setName(data.name);
    if ("role" in data) setRole(data.role);
    if ("avatarUrl" in data) setAvatarUrl(data.avatarUrl);
    return el;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;
```

## Example with events (Counter)

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

  // One AbortController manages every listener this view binds.
  const ac = new AbortController();
  const { signal } = ac;

  incrementNode.addEventListener("click", onIncrementClick, { signal });
  decrementNode.addEventListener("click", onDecrementClick, { signal });

  function disconnect() {
    ac.abort(); // removes every listener registered with this signal in one call
  }

  // Update
  function update(data = {}) {
    if ("count" in data) setCount(data.count);
    return el;
  }

  update.disconnect = disconnect;

  return update;
}

export default init;
```

## TypeScript

Add types minimally and let inference handle the rest. Only annotate where TypeScript can't figure it out on its own.

### The typed q() helper

The helper takes a generic element type in TypeScript:

```typescript
export function q<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node as T;
}

// Usage — prefer this over inline `as HTMLSpanElement` casts:
const countNode = q<HTMLSpanElement>(el, ".count");
const buttonNode = q<HTMLButtonElement>(el, ".increment");
```

A blind `el.querySelector('.count') as HTMLSpanElement` hides a missing element until the first write. The helper fails loudly at query time.

### Props interface

```typescript
interface CounterProps {
  count?: number;
}
```

### The TypeScript clone()

Same null guard as the JS version, with an explicit return type:

```typescript
function clone(): HTMLElement {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root as HTMLElement;
}
```

### What to let TypeScript infer

- Return type of `init()` — inferred from the function body.
- Return type of `update()` — inferred as the element type.
- State variable types (usually) — inferred from initial assignment.
- Internal function signatures — inferred from usage.

### Export the view type

Use `ReturnType` to derive the view type from the implementation:

```typescript
export type CounterView = ReturnType<typeof init>;
```

This keeps the consumer-facing type in sync with the implementation automatically.

## Web components interop

The `disconnect()` naming echoes `disconnectedCallback` on purpose — wrapping a hardview factory inside a custom element is straightforward, and adds attribute reflection on top. A few spec details shape the wrapper:

1. **Custom element constructors must not touch children or attributes.** That rules out creating the view as a field initializer. Build it lazily in `connectedCallback`.
2. **`connectedCallback` can fire multiple times.** Moving an element in the DOM (`otherParent.appendChild(existingEl)`) triggers `disconnectedCallback` followed by `connectedCallback`. The wrapper must be idempotent.
3. **Once an `AbortController` is aborted, it cannot be reused.** If you abort on every `disconnectedCallback`, a subsequent `connectedCallback` finds a dead view. The 2026-idiomatic solution is to defer teardown with `queueMicrotask` and check `isConnected` — if the element was only moved, it's already reconnected by the time the microtask runs, and we skip the teardown.
4. **`connectedMoveCallback` + `Element.moveBefore()` (Chrome 133+; Firefox/Safari in progress)**. When a node is moved via `moveBefore()` rather than `insertBefore`/`appendChild`, the browser calls `connectedMoveCallback` (if defined) _instead of_ the disconnect/connect pair — state is preserved, focus isn't dropped, iframes don't reload. Defining even an empty `connectedMoveCallback` is enough to opt in. This is a modernization, not a correctness fix: the `queueMicrotask` pattern above already handles moves correctly because [the spec keeps the element connected during the microtask](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore). But when available, `connectedMoveCallback` is cheaper and clearer.

### Light DOM vs. Shadow DOM

Before writing the wrapper, decide where the view lives. Both examples below use **light DOM** (`this.appendChild(...)`), which is the right default when the component needs to participate in the host page's styling and composition:

- Utility CSS frameworks (Tailwind, open-props) don't pierce shadow boundaries — rules in the host stylesheet apply naturally to light-DOM children.
- Design-token systems that rely on inherited CSS custom properties work in both, but descendant selectors on tokens don't cross the boundary.
- Form participation: `<input>` inside shadow DOM doesn't automatically submit with the outer form unless you opt into form-associated custom elements (`static formAssociated = true` + `ElementInternals`). Light DOM is simpler.
- Test hooks, analytics selectors, and devtools inspection are all easier in light DOM.

Use **shadow DOM** (`this.attachShadow({ mode: "open" })` in the constructor, then `this.shadowRoot.append(this.#update())` in `connectedCallback`) when:

- The component is a self-contained widget distributed to unknown consumers (a date picker shipped as a package) and needs style isolation from whatever CSS the host page happens to have.
- The internal DOM shouldn't be exposed as part of the component's public API — consumers should program against attributes/properties/events, not query the internals.
- You want scoped `<style>` that can't collide with host styles.

A mid-ground worth knowing: **declarative shadow DOM** (`<template shadowrootmode="open">`) pairs well with the SSR section — the server emits the shadow root in HTML, and hydration picks it up without a client-side re-render. Only relevant if you've already chosen shadow DOM for other reasons.

The examples that follow stick with light DOM because that's what most in-app components want. The shadow-DOM version is a one-line swap: change `this.appendChild(...)` to `this.shadowRoot.append(...)` after attaching the root in the constructor.

### Minimal wrapper

```javascript
import counterInit from "./counter.js";

customElements.define(
  "app-counter",
  class extends HTMLElement {
    #update = null;

    connectedCallback() {
      // Idempotent against moves and repeated connects.
      if (this.#update) return;
      this.#update = counterInit();
      this.appendChild(this.#update());

      // If a framework or script set `el.count = 5` BEFORE this definition
      // loaded, `count` is sitting as an instance property shadowing our
      // prototype setter. Re-apply it so the setter runs.
      this.#upgradeProperty("count");
    }

    disconnectedCallback() {
      // Defer: if this was a move via insertBefore/appendChild, the follow-up
      // connectedCallback re-runs synchronously and isConnected is true again
      // before our microtask fires.
      queueMicrotask(() => {
        if (this.isConnected) return;
        this.#update?.disconnect?.();
        this.#update = null;
      });
    }

    // Defining this (even empty) opts into state-preserving moves when the
    // caller uses Element.moveBefore() instead of insertBefore/appendChild.
    // Without it, the browser falls back to disconnect/connect pair.
    connectedMoveCallback() {
      // No-op: the view's internal state already survives the move because
      // we never tore it down.
    }

    set count(value) {
      const next = Number(value);
      if (Number.isNaN(next)) return; // ignore garbage; don't poison state
      this.#update?.({ count: next });
    }

    get count() {
      return Number(this.getAttribute("count") ?? 0);
    }

    #upgradeProperty(name) {
      if (Object.prototype.hasOwnProperty.call(this, name)) {
        const value = this[name];
        delete this[name];
        this[name] = value; // now routes through the prototype setter
      }
    }
  },
);
```

### With attribute reflection

To make the component usable from HTML (`<app-counter count="5">`) and to reflect internal changes back to attributes for CSS selectors and devtools:

```javascript
import counterInit from "./counter.js";

customElements.define(
  "app-counter",
  class extends HTMLElement {
    // Tell the browser which attributes to observe.
    static observedAttributes = ["count"];

    #update = null;
    #internalChange = false; // guard against attribute/property feedback loops

    connectedCallback() {
      if (this.#update) return;

      this.#update = counterInit();
      this.appendChild(this.#update());

      // Initial sync: read any pre-existing attribute into the view.
      if (this.hasAttribute("count")) {
        this.#update({ count: Number(this.getAttribute("count")) });
      }

      // Reflect the view's own changes back onto the host as attributes.
      this.addEventListener("change", this.#onInternalChange);

      // Handle any property set on the instance before this definition loaded.
      this.#upgradeProperty("count");
    }

    disconnectedCallback() {
      queueMicrotask(() => {
        if (this.isConnected) return;
        this.removeEventListener("change", this.#onInternalChange);
        this.#update?.disconnect?.();
        this.#update = null;
      });
    }

    // Opt into state-preserving moves via Element.moveBefore().
    connectedMoveCallback() {
      // Intentionally empty — the view and its listeners survive the move.
    }

    // Fires when an observed attribute changes from outside (HTML, setAttribute).
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (this.#internalChange) return; // skip our own reflections
      if (!this.#update) return; // attribute set before connection
      if (name === "count") {
        const next = Number(newValue);
        if (Number.isNaN(next)) return; // ignore garbage
        this.#update({ count: next });
      }
    }

    #onInternalChange = (e) => {
      // Mark this setAttribute as "internal" so attributeChangedCallback ignores it.
      this.#internalChange = true;
      this.setAttribute("count", String(e.detail.count));
      this.#internalChange = false;
    };

    // Property interface — mirrors the attribute, keeps numeric typing.
    get count() {
      return Number(this.getAttribute("count") ?? 0);
    }
    set count(value) {
      const next = Number(value);
      if (Number.isNaN(next)) return;
      this.setAttribute("count", String(next));
    }

    #upgradeProperty(name) {
      if (Object.prototype.hasOwnProperty.call(this, name)) {
        const value = this[name];
        delete this[name];
        this[name] = value;
      }
    }
  },
);
```

Key details:

- `observedAttributes` is static; the browser only calls `attributeChangedCallback` for listed names.
- Always guard against feedback loops when you both _read_ and _write_ the same attribute — the `#internalChange` flag pattern above is the standard trick.
- `attributeChangedCallback` can fire before `connectedCallback` if the attribute is present in the parsed HTML; the `if (!this.#update) return` guard handles that — the initial sync inside `connectedCallback` picks up the attribute anyway.
- Reflect numbers, booleans, and short strings as attributes. Reflect objects and arrays as properties only — they don't serialize cleanly to HTML.
- **Don't reflect high-frequency values to attributes.** Every attribute write triggers `attributeChangedCallback`, MutationObserver callbacks, style-selector invalidation, and devtools churn. A slider dragging at 60fps or a live mouse position belongs in a property (and probably in an internal dispatcher), not in the attribute table.
- **Don't overwrite author-provided global attributes.** `role`, `tabindex`, `class`, `aria-*`, and `id` can be set by the page author for legitimate reasons (landmark overrides, keyboard groups, utility classes, test hooks). If the wrapper needs to add its own, merge rather than replace — or expose its needs as documented semantics and let the author opt in.
- Dispatchers already use `composed: true`, so `change` events from inside a shadow root reach light-DOM listeners without extra work.

## Accessibility

The pattern doesn't force accessibility, but it doesn't excuse skipping it either. The baseline below is non-negotiable for any interactive view; the focus-management and keyboard sections cover the common patterns.

### Baseline

- Native semantic elements where possible (`<button type="button">`, not `<div role="button">`).
- `aria-label` or visible text for every interactive control.
- `aria-live` **only** for updates that assistive-technology users might otherwise miss — content arriving from the background (incoming messages, search results, status changes), not content that changes as a direct result of the user's own action. Prefer `polite` unless interruption is essential. Overusing live regions produces noise and trains users to tune them out.
- Keyboard handling for anything that isn't already a native interactive element.
- `disabled` reflected in the DOM when an action is unavailable (see `setCountNode` in the counter).

### Focus management

**Focus movement is user-interaction state, not view state.** That's why it doesn't belong in DOM update functions — those also run during parent-driven prop updates, and stealing focus there is a bug. Put `.focus()` in the event listener that represents the user's intent.

Three common scenarios, in order of frequency:

**Programmatic focus on state change.** When a state change should move focus (opening an inline editor, activating a panel), keep the structural change in the DOM setter and the focus call in the listener that triggered it:

```javascript
// DOM Update Functions
function setEditingNode(value) {
  inputNode.hidden = !value;
  // No .focus() here — see below.
}

// Event Listeners
function onEditClick(/* event */) {
  setEditing(true);
  inputNode.focus(); // user clicked "Edit" → focus the input
}
```

If the parent drives `setEditing(true)` via `update({ editing: true })`, focus stays wherever the user had it — which is what you want.

**Focus restoration.** When a component takes focus (dialog, menu), remember where focus was and return it on close. The current `document.activeElement` returns the host when focus is inside a shadow root, so use a deep walk if your component might be wrapped in a custom element with a shadow root:

```javascript
function deepActiveElement() {
  let a = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

// State Variables
let open;
let previouslyFocused;

// State Update Functions
function setOpen(value) {
  if (open === value) return;
  if (value) {
    previouslyFocused = deepActiveElement(); // capture before taking focus
  }
  open = value;
  setOpenNode(value);
  if (!value && previouslyFocused instanceof HTMLElement) {
    previouslyFocused.focus(); // restore on close
    previouslyFocused = null;
  }
}
```

This is the rare case where focus lives near a setter — but it's gated on a transition (close), not a value update, and only restores focus that the component itself took. It never steals focus.

**Focus trap (modals).** For a true modal, focus must stay inside the dialog while it's open. The 2026-idiomatic way is the native `<dialog>` element with `showModal()`, which traps focus, renders in the top layer, marks the rest of the document `inert`, and handles Escape-to-close — use it whenever the semantics are "modal". If you must trap manually, the pattern is: capture `Tab` and `Shift+Tab`, compute the first/last focusable descendants, and wrap around.

**Non-modal overlays — the Popover API.** For dropdowns, tooltips, disclosure panels, and any transient overlay that should _not_ trap focus, reach for the native [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) (the `popover` attribute, `popovertarget`, and `showPopover()`) before building your own. It gives you top-layer rendering (no z-index fights), light-dismiss (click outside or Escape), and correct accessibility defaults for free — and unlike `<dialog>`, it doesn't inert the rest of the page. `popover="auto"` is the common case; `popover="manual"` when you need to control dismissal yourself. Inside a hardview component, the pattern is the same as any other DOM mutation: toggle the attribute (or call `showPopover()`/`hidePopover()`) from a DOM update function, and let the user-interaction handler decide when to invoke it.

### Keyboard patterns

Most views need at most two of these:

- **Enter / Space activation** — free on `<button>`. For non-button elements that must act like buttons (rare; prefer the native element), listen for `keydown` on both keys.
- **Escape to close / cancel** — for dialogs, menus, and inline editors. Bind at the component's root:
  ```javascript
  function onKeydown(event) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }
  el.addEventListener("keydown", onKeydown, { signal });
  ```
- **Arrow-key navigation** — for composite widgets (menus, tabs, radio groups, listboxes). Pair with a [roving `tabindex`](https://www.w3.org/WAI/ARIA/apg/patterns/): exactly one descendant has `tabindex="0"` at a time, all others have `tabindex="-1"`; arrow keys move both the `tabindex` and focus.

```javascript
// Inside a tablist view.
//
// DOM reflection of the active tab (tabindex + aria-selected) lives in the
// DOM setter. Focus movement does NOT — it lives in the keyboard listener,
// because it's a user-interaction concern. If the parent calls
// update({ activeIndex: 0 }), we want to sync ARIA state WITHOUT stealing
// focus from wherever the user currently is.

// DOM Update Functions
function setActiveIndexNode(value) {
  tabNodes.forEach((node, i) => {
    const active = i === value;
    node.tabIndex = active ? 0 : -1;
    node.setAttribute("aria-selected", String(active));
  });
}

// State Update Functions
function setActiveIndex(value) {
  if (activeIndex !== value) {
    activeIndex = value;
    setActiveIndexNode(value);
  }
}

// Event Listeners — user intent owns focus.
function onTablistKeydown(event) {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  const delta = event.key === "ArrowRight" ? 1 : -1;
  const next = (activeIndex + delta + tabNodes.length) % tabNodes.length;
  setActiveIndex(next);
  tabNodes[next].focus(); // user-driven → focus follows
}
```

The split — ARIA attributes in the DOM setter, focus in the keyboard handler — is what keeps the "exclusive mutation" rule intact while satisfying the WAI-ARIA tabs pattern.

## SSR and hydration

The pattern is client-first, but it can hydrate server-rendered HTML without a client-side re-render. The idiom:

1. The server emits HTML that **matches the template structure exactly** — same tags, same classes, same text content as the fully-rendered state.
2. The server also embeds the initial state as a JSON `data-state` attribute on the root element (or in a nearby `<script type="application/json">`), so the client doesn't have to re-derive it.
3. On the client, `init()` accepts an optional existing root. When provided, it skips `clone()`, seeds state variables from `data-state`, and binds listeners — never touching the rendered DOM.

`JSON.parse` throws on malformed input. The server is normally trusted, but a try/catch keeps a single bad byte from taking down the whole page:

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

function readInitialState(el) {
  if (!el.dataset.state) return {};
  try {
    return JSON.parse(el.dataset.state);
  } catch (err) {
    // Dev-only warning; fall back to defaults so the page still works.
    if (typeof console !== "undefined") {
      console.warn("hardview: malformed data-state, using defaults", err);
    }
    return {};
  }
}

// init() now takes an optional existing root for hydration.
function init(existingRoot) {
  const hydrating = existingRoot != null;
  const el = existingRoot ?? clone();

  // DOM Variables
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
  function onIncrementClick() {
    setCount(count + 1);
    dispatchChange();
  }

  function onDecrementClick() {
    if (canDecrement()) {
      setCount(count - 1);
      dispatchChange();
    }
  }

  // Init Functionality
  if (hydrating) {
    // Read serialized state from the server. Because `count` was undefined a
    // moment ago, this first assignment sets it — but we bypass setCount so
    // setCountNode is NOT called, preserving the server-rendered DOM.
    const initial = readInitialState(el);
    count = initial.count ?? 0;
  } else {
    setCount(0); // client-only mount: normal path, writes DOM
  }

  // Event listeners bind identically in both cases.
  const ac = new AbortController();
  const { signal } = ac;
  incrementNode.addEventListener("click", onIncrementClick, { signal });
  decrementNode.addEventListener("click", onDecrementClick, { signal });

  function update(data = {}) {
    if ("count" in data) setCount(data.count);
    return el;
  }

  update.disconnect = () => ac.abort();
  return update;
}

export default init;
```

The critical rule: **on hydration, never call state setters that would trigger DOM writes during init**. Assign directly to the state variable instead (`count = initial.count`), because the DOM already reflects that value. The next `update()` call from the parent works normally — if it passes the same value, the equality check short-circuits; if it passes a new value, setters run as expected.

### Server-side rendering of the template

There are two common strategies for generating the matching HTML on the server:

- **Share the template string.** Keep the `innerHTML` string in a `.js` module that both server and client import. The server substitutes text content into a cloned `linkedom` (lighter) or `jsdom` instance before serializing.
- **Hand-write the server template.** Duplicate the HTML in a server template engine. Brittle, but avoids loading a DOM implementation server-side. Acceptable for small views.

Either way, the test that matters is: _do the server HTML and a freshly-cloned template produce identical DOM for the same state?_ If yes, hydration works; if no, you'll get a mismatch on the first `update()`.

## When creating views

1. **Detect file extension**: check for `tsconfig.json` or existing `.ts` files in the project. Use `.ts` if found, otherwise `.js`.
2. Start with the template HTML.
3. Identify which elements need dynamic updates.
4. Create state variables for each piece of dynamic data.
5. Create DOM update functions for each DOM mutation. Remember: ARIA attributes belong here; focus does not.
6. Create state update functions that check for changes.
7. Wire up `update()` to receive props.
8. Add event listeners (via a single `AbortController`) and dispatchers as needed. Put focus movement in the listener that represents user intent.
9. If the view may be removed from the DOM, expose `disconnect()` — abort listeners first, then cascade to child views.
10. If the view will be wrapped in a custom element: choose light DOM vs. shadow DOM based on styling strategy; build the factory lazily in `connectedCallback`; defer teardown with `queueMicrotask` + `isConnected`; define `connectedMoveCallback` (even empty) to opt into state-preserving moves; add `#upgradeProperty` for any reflected properties to handle pre-upgrade assignments; sanitize numeric setters (reject `NaN`); reach for native `<dialog>` / Popover API before building your own overlay primitives.
11. If the view will be server-rendered, accept an optional root in `init()` and seed state directly from `data-state` (wrapped in try/catch).
