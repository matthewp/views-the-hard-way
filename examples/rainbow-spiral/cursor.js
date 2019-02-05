const template = document.createElement('template');
template.innerHTML = `
  <div>
    <span> </span>
  </div>
`;

function clone() {
  return document.importNode(template.content, true).firstElementChild;
}

function init() {
  /* DOM variables */
  let root = clone();
  let spanNode = root.firstElementChild;

  /* State variables */
  let x, y, label, color, big;

  /* DOM update functions */
  function setRootNodeClass(value) {
    root.className = value;
  }

  function setRootNodeStyle(value) {
    Object.assign(root.style, value);
  }

  function setSpanNode(value) {
    spanNode.firstChild.nodeValue = value;
  }

  function setSpanNodeClass(value) {
    if(spanNode.className !== value) {
      spanNode.className = value;
    }
  }

  /* State update functions */
  function setStyle(data) {
    if(data.x !== x || data.y !== y || data.color !== color) {
      x = data.x;
      y = data.y;
      color = data.color;
      setRootNodeStyle({
        borderColor: color,
        left: (x || 0) + 'px',
        top: (y || 0) + 'px'
      });
    }
  }

  function setClass(data) {
    if(data.big !== big || data.label !== label) {
      big = data.big;
      label = data.label;
      setRootNodeClass(getClass());
    }
  }

  function setCoords(data) {
    if(data.label) {
      setSpanNodeClass('label');
      setSpanNode(x + ',' + y);
    }
  }

  /* Logic functions */
  function getClass() {
		let cl = 'cursor';
		if (big) cl += ' big';
		if (label) cl += ' label';
		return cl;
  }

  function coordsChanged(data) {
    return x !== data.x || y !== data.y;
  }

  /* Initialization */
  function update(data = {}) {
    let shouldUpdate = coordsChanged(data);
    if(shouldUpdate)
      setStyle(data);
    setClass(data);
    if(shouldUpdate)
      setCoords(data);
    return root; 
  }

  return update;
}

export default init;