const template = document.createElement('template');
template.innerHTML = `
  <h1>Counter</h1>
  <h2>count: <span id="count"></span></h2>

  <button type="button" id="increment">Increment +</button>
  <button type="button" id="decrement">Decrement -</button>
  <button type="button" id="reset">Reset</button>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let countNode = frag.querySelector('#count');
  let incrementNode = frag.querySelector('#increment');
  let decrementNode = frag.querySelector('#decrement');
  let resetNode = frag.querySelector('#reset');

  /* State constants */
  const min = 0;

  /* State variables */
  let count;
  
  /* DOM update functions */
  function setCountNode(value) {
    countNode.textContent = value;
  }

  /* State update functions */
  function setCount(value) {
    if(count !== value) {
      count = value;
      setCountNode(value);
    }
  }

  /* State logic */
  function canDecrement() {
    return count - 1 >= min;
  }

  /* Event listeners */
  function onIncrementClick() {
    setCount(count + 1);
  }

  function onDecrementClick() {
    if(canDecrement()) {
      setCount(count - 1);
    }
  }

  function onResetClick() {
    setCount(0);
  }

  /* Init functionality */
  setCount(0);

  function connect() {
    incrementNode.addEventListener('click', onIncrementClick);
    decrementNode.addEventListener('click', onDecrementClick);
    resetNode.addEventListener('click', onResetClick);
  }
  connect();

  function disconnect() {
    incrementNode.addEventListener('click', onIncrementClick);
    decrementNode.addEventListener('click', onDecrementClick);
    resetNode.addEventListener('click', onResetClick);
  }

  function update(data = {}) {
    if(data.count) setCount(data.count);
    return frag;
  }

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

export default init;