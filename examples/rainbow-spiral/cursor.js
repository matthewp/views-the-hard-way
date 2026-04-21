import { q } from "./q.js";

const template = document.createElement("template");
template.innerHTML = `<div>
  <span></span>
</div>`;

function clone() {
  const root = template.content.cloneNode(true).firstElementChild;
  if (!root) throw new Error("hardview: template has no root element");
  return root;
}

export default function init() {
  // DOM Variables
  const el = clone();
  const spanNode = q(el, "span");

  // State Variables
  let x;
  let y;
  let color;
  let big;
  let label;

  // DOM Update Functions
  function setPositionNode() {
    el.style.left = (x || 0) + "px";
    el.style.top = (y || 0) + "px";
  }

  function setColorNode(value) {
    el.style.borderColor = value;
  }

  function setClassNode() {
    let cl = "cursor";
    if (big) cl += " big";
    if (label) cl += " label";
    el.className = cl;
  }

  function setLabelNode() {
    spanNode.className = label ? "label" : "";
    spanNode.textContent = label ? `${x},${y}` : "";
  }

  // State Update Functions
  function setX(value) {
    if (x !== value) {
      x = value;
      setPositionNode();
      if (label) setLabelNode();
    }
  }

  function setY(value) {
    if (y !== value) {
      y = value;
      setPositionNode();
      if (label) setLabelNode();
    }
  }

  function setColor(value) {
    if (color !== value) {
      color = value;
      setColorNode(value);
    }
  }

  function setBig(value) {
    if (big !== value) {
      big = value;
      setClassNode();
    }
  }

  function setLabel(value) {
    if (label !== value) {
      label = value;
      setClassNode();
      setLabelNode();
    }
  }

  // Update — x/y set first so setLabelNode reads fresh values if label flips on.
  function update(data = {}) {
    if ("x" in data) setX(data.x);
    if ("y" in data) setY(data.y);
    if ("color" in data) setColor(data.color);
    if ("big" in data) setBig(data.big);
    if ("label" in data) setLabel(data.label);
    return el;
  }

  return update;
}
