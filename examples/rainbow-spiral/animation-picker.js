const template = document.createElement('template');
template.innerHTML = /* html */ `
  <label class="animation-picker">
  Timing:
  <select value="requestAnimationFrame">
    <option value="requestAnimationFrame">requestAnimationFrame</option>
    <option value="requestIdleCallback">requestIdleCallback</option>
    <option value="setTimeout(0)">setTimeout(0)</option>
    <option value="setTimeout(100)">setTimeout(100)</option>
    <option value="setTimeout(20000)">setTimeout(20000)</option>
    <option value="stop">stop</option>
  </select>
  </label>
`;

const setTimeoutFn = ms => fn => setTimeout(fn, ms);
const clearTimeoutFn = id => clearTimeout(id)

const timingFunctions = {
  'requestAnimationFrame': {
    start: fn => requestAnimationFrame(fn),
    clear: id => cancelAnimationFrame(id)
  },
  'requestIdleCallback': {
    start: fn => requestIdleCallback(fn),
    clear: id => cancelIdleCallback(id)
  },
  'setTimeout(0)': {
    start: setTimeoutFn(0),
    clear: clearTimeoutFn
  },
  'setTimeout(100)': {
    start: setTimeoutFn(100),
    clear: clearTimeoutFn
  },
  'setTimeout(20000)': {
    start: setTimeoutFn(5000),
    clear: clearTimeoutFn
  }
}

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let pickerNode = frag.querySelector('.animation-picker');
  let selectNode = frag.querySelector('select');

  /* State variables */
  let started = false;
  let timingFunctionName = selectNode.value;
  let timingFunction = timingFunctions[timingFunctionName];

  /* State update functions */
  function ensureStarted() {
    if(!started) {
      started = true;
      setTimeout(dispatchTimingFunction);
    }
  }

  /* Event dispatchers */
  function dispatchTimingFunction() {
    let ev = new CustomEvent('timing-function', {
      detail: timingFunction,
      bubbles: true
    });
    pickerNode.dispatchEvent(ev);
  }

  function dispatchStop() {
    let ev = new CustomEvent('stop', { bubbles: true });
    pickerNode.dispatchEvent(ev);
  }

  /* Event listeners */
  function onPickerMouseDown(ev) {
    ev.stopPropagation();
  }

  function onSelectChange(ev) {
    let value = ev.target.value;
    switch(value) {
      case 'stop':
        dispatchStop();
        break;
      default:
        timingFunctionName = value;
        timingFunction = timingFunctions[value];
        dispatchTimingFunction();
        break;
    }
  }

  /* Initialization */
  pickerNode.addEventListener('mousedown', onPickerMouseDown);
  selectNode.addEventListener('change', onSelectChange);

  function update() {
    ensureStarted();
    return frag;
  }
  
  return update;
}

export default init;

/*

class AnimationPicker extends Component {
	state = {
		timingFunction: 'requestAnimationFrame'
	};

	IDLE_TIMEOUT = { timeout: 50 };

	timingFunctions = {
		'setImmediate/MessageChannel (default)': null,		// default
		'requestAnimationFrame': requestAnimationFrame,
		'requestIdleCallback': f => requestIdleCallback(f, this.IDLE_TIMEOUT),
		'setTimeout(0)': f => setTimeout(f, 0),
		'setTimeout(100)': f => setTimeout(f, 100),
		'Promise': f => Promise.resolve().then(f)
	};

	componentDidUpdate() {
		options.debounceRendering = this.timingFunctions[this.state.timingFunction];
	}

	noBubble(e) {
		e.stopPropagation();
	}

	render({ }, { timingFunction }) {
		return (
			<label class="animation-picker" onMouseDown={this.noBubble}>
				Timing:
				<select value={timingFunction} onChange={linkState(this, 'timingFunction')}>
					{ Object.keys(this.timingFunctions).map( name => (
						<option value={name} disabled={this.timingFunctions[name]===undefined}>{name}</option>
					)) }
				</select>
			</label>
		);
	}
}
*/
