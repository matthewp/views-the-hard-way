# Event Handling

How to handle DOM events and implement connect/disconnect lifecycle in the hardview pattern.

## Counter Example with Events

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

## Event Dispatchers

Functions that emit custom events to parent components:

```javascript
// Event Dispatchers
function dispatchChange() {
  el.dispatchEvent(new CustomEvent('change', {
    detail: { count },
    bubbles: true
  }));
}
```

## Connect/Disconnect Pattern

The `connect`/`disconnect` pattern is only necessary for components that may be dynamically added or removed from the DOM. For static components, attach listeners directly in the Init Functionality section without wrapping them.
