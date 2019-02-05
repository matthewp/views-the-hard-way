import cursorView from './cursor.js';
import pickerView from './animation-picker.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
<div id="main">
  <div class="picker-wrapper"></div>
  <div id="main-cursor"></div>
  <div id="cursors"></div>
</div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let pickerWrapperNode = frag.querySelector('.picker-wrapper');
  let mainCursorNode = frag.querySelector('#main-cursor');
  let cursorsNode = frag.querySelector('#cursors');

  /* DOM views */
  let updateMainCursor, updatePicker;

  /* State constants */
  const COUNT = 200;
  const LOOPS = 6;
  const TOUCH = navigator.maxTouchPoints>1;

  /* State variables */
  let cursors = [];
  let x = 0, y = 0, big = false, counter = 0;
  let timing, timerId;

  /* DOM update functions */
  function setMainCursorNode(value) {
    mainCursorNode.appendChild(value);
  }

  function removeCursorAt(i) {
    cursorsNode.removeChild(cursorsNode.childNodes[i]);
  }

  function appendPickerWrapperNode(frag) {
    pickerWrapperNode.appendChild(frag);
  }

  /* State update functions */
  function draw() {
    let max = COUNT + Math.round(Math.sin(counter/90*2*Math.PI)*COUNT*0.5);
    let frag;
    let i = max;
    
    for (; i--; ) {
			let f = i/max * LOOPS,
				θ = f * 2 * Math.PI,
				m = 20 + i*2,
        hue = (f*255 + counter*10) % 255;

      let props = {
        big,
        color: 'hsl('+hue+',100%,50%)',
        x: (x + Math.sin(θ)*m) |0,
        y: (y + Math.cos(θ)*m) |0
      }
        
      let update = cursors[i];
      if(!update) {
        update = cursors[i] = cursorView();

        if(!frag) {
          frag = document.createDocumentFragment();
        }
        frag.appendChild(update(props));
      } else {
        update(props);
      }
    }
    
    if(frag) {
      cursorsNode.appendChild(frag);
    }

    let spliceStart = max;
    let spliceCount = 0;
    i = cursors.length - 1;
    while(i > max + 1) {
      removeCursorAt(i);
      spliceCount++;
      i--;
    }
    cursors.splice(spliceStart, spliceCount);

    updateMainCursor({ label: true, x, y, big });
  }

  function setMouse({ pageX: newX, pageY: newY }) {
    x = newX;
    y = newY;
	}

  function loop() {
    draw();
    counter++;
    timerId = timing.start(loop);
  }

  /* Event listeners */
  function onTouch(e) {
    setMouse(e.touches ? e.touches[0] : e);
  }

  function onTimingFunction(ev) {
    if(timing) {
      timing.clear(timerId);
    }
    timing = ev.detail;
    timerId = timing.start(loop);
  }

  function onTimingStop() {
    if(timing) {
      timing.clear(timerId);
    }
  }

  /* Initialization */
  addEventListener(TOUCH?'touchmove':'mousemove', onTouch);
  pickerWrapperNode.addEventListener('timing-function', onTimingFunction);
  pickerWrapperNode.addEventListener('stop', onTimingStop);

  updateMainCursor = cursorView();
  updatePicker = pickerView();

  setMainCursorNode(updateMainCursor());
  appendPickerWrapperNode(updatePicker());

  function update() {
    return frag;
  }

  return update;
}

export default init;

// normally below is just:  import { Component, render, h } from 'preact';
//let { Component, render, h, options } = preact;

/** @jsx h */     // tells Babel to convert JSX to h() calls



/** This component controls the app itself.
 *	It wires up some global mouse events (this is uncommon).
 *	When component state changes, it gets re-rendered automatically.
 */

/*
class Main extends Component {
	state = { x:0, y:0, big:false, counter:0 };

	componentDidMount() {
		let touch = navigator.maxTouchPoints>1;
		
		// set mouse position state on move:
		addEventListener(touch?'touchmove':'mousemove', e => {
			this.setMouse(e.touches ? e.touches[0] : e);
		});
		
		// holding the mouse down enables big mode:
		addEventListener(touch?'touchstart':'mousedown', e => { this.setBig(true); e.preventDefault(); });
		addEventListener(touch?'touchend':'mouseup', e => this.setBig(false));

		this.increment();
	}
	
	componentDidUpdate() {
		// invoking setState() in componentDidUpdate() creates an animation loop:
		this.increment();
	}

	increment() {
		this.state.counter++;   // avoids an object allocation
		this.setState();
	}
	
	setMouse({ pageX:x, pageY:y }) {
		this.setState({ x, y });
		return false;
	}

	setBig(big) {
		this.setState({ big });
	}

	// builds and returns a brand new DOM (every time)
	render(props, { x, y, big, counter }) {
		let max = COUNT + Math.round(Math.sin(counter/90*2*Math.PI)*COUNT*0.5),
			cursors = [];
		
		// the advantage of JSX is that you can use the entirety of JS to "template":
		for (let i=max; i--; ) {
			let f = i/max * LOOPS,
				θ = f * 2 * Math.PI,
				m = 20 + i*2,
				hue = (f*255 + counter*10) % 255;
			cursors[i] = (
				<Cursor
					big={big}
					color={ 'hsl('+hue+',100%,50%)' }
					x={ (x + Math.sin(θ)*m) |0 }
					y={ (y + Math.cos(θ)*m) |0 }
				/>
			);
		}

		return (
			<div id="main">
				<AnimationPicker />
				<Cursor label x={x} y={y} big={big} />
				{ cursors }
			</div>
		);
	}
}



// Mount the top-level component to the DOM:
render(<Main />, document.body);

*/


// Addendum: disable dragging on mobile
addEventListener('touchstart', e => (e.preventDefault(), false) );
