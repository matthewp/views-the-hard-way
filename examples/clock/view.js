const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    .clock {
      position: relative;
      background: #fff url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjYuNiAyMzMuOCI+PHBhdGggZD0iTTEwNS41IDIyLjdWNi40aC01LjlWNC4zYy44IDAgMS41LS4xIDIuMi0uMi43LS4xIDEuNC0uMyAyLS43LjYtLjMgMS4xLS44IDEuNS0xLjMuNC0uNi43LTEuMy44LTIuMWgyLjF2MjIuN2gtMi43ek0xMTQuMSA0LjhjLjMtMSAuOC0xLjggMS40LTIuNS42LS43IDEuNC0xLjMgMi40LTEuNy45LS40IDItLjYgMy4yLS42IDEgMCAxLjkuMSAyLjguNC45LjMgMS42LjcgMi4zIDEuMi42LjUgMS4xIDEuMiAxLjUgMiAuNC44LjYgMS43LjYgMi44IDAgMS0uMiAxLjktLjUgMi43cy0uNyAxLjUtMS4yIDIuMWMtLjUuNi0xLjEgMS4yLTEuOCAxLjYtLjcuNS0xLjMgMS0yIDEuNC0uNy40LTEuNC44LTIuMSAxLjNzLTEuMy45LTEuOSAxLjNjLS42LjUtMS4xIDEtMS41IDEuNXMtLjcgMS4yLS44IDEuOWgxMS42djIuNGgtMTQuOGMuMS0xLjMuMy0yLjUuNy0zLjQuNC0uOS44LTEuOCAxLjQtMi41czEuMi0xLjMgMi0xLjljLjctLjUgMS41LTEgMi4zLTEuNSAxLS42IDEuOC0xLjEgMi41LTEuNnMxLjMtMSAxLjgtMS41LjgtMS4xIDEuMS0xLjcuNC0xLjMuNC0yLjFjMC0uNi0uMS0xLjItLjQtMS43LS4yLS41LS41LS45LS45LTEuM3MtLjktLjYtMS40LS44Yy0uNS0uMi0xLjEtLjMtMS43LS4zLS44IDAtMS41LjItMiAuNS0uNi4zLTEgLjgtMS40IDEuMy0uNC41LS42IDEuMS0uOCAxLjhzLS4yIDEuMy0uMiAySDExNGMtLjMtMS0uMi0yLjEuMS0zLjF6TTE2Ni41IDM4LjJWMjEuOWgtNS45di0yLjJjLjggMCAxLjUtLjEgMi4yLS4yLjctLjEgMS40LS4zIDItLjcuNi0uMyAxLjEtLjggMS41LTEuMy40LS42LjctMS4zLjgtMi4xaDIuMXYyMi43aC0yLjd6TTE5OC45IDU5LjJjLjMtMSAuOC0xLjggMS40LTIuNS42LS43IDEuNC0xLjMgMi40LTEuNy45LS40IDItLjYgMy4yLS42IDEgMCAxLjkuMSAyLjguNC45LjMgMS42LjcgMi4zIDEuMi42LjUgMS4xIDEuMiAxLjUgMiAuNC44LjYgMS43LjYgMi44IDAgMS0uMiAxLjktLjUgMi43cy0uNyAxLjUtMS4yIDIuMWMtLjUuNi0xLjEgMS4yLTEuOCAxLjYtLjcuNS0xLjMgMS0yIDEuNC0uNy40LTEuNC44LTIuMSAxLjNzLTEuMy45LTEuOSAxLjNjLS42LjUtMS4xIDEtMS41IDEuNXMtLjcgMS4yLS44IDEuOWgxMS42Vjc3SDE5OGMuMS0xLjMuMy0yLjUuNy0zLjQuNC0uOS44LTEuOCAxLjQtMi41czEuMi0xLjMgMi0xLjljLjctLjUgMS41LTEgMi4zLTEuNSAxLS42IDEuOC0xLjEgMi41LTEuNnMxLjMtMSAxLjgtMS41LjgtMS4xIDEuMS0xLjcuNC0xLjMuNC0yLjFjMC0uNi0uMS0xLjItLjQtMS43LS4yLS41LS41LS45LS45LTEuM3MtLjktLjYtMS40LS44Yy0uNS0uMi0xLjEtLjMtMS43LS4zLS44IDAtMS41LjItMiAuNS0uNi4zLTEgLjgtMS40IDEuMy0uNC41LS42IDEuMS0uOCAxLjhzLS4yIDEuMy0uMiAyaC0yLjdjLS4yLTEuMS0uMS0yLjEuMi0zLjF6TTIxNy42IDExNS4xSDIxOC41Yy42IDAgMS4xLS4xIDEuNi0uMnMxLS40IDEuNC0uN2MuNC0uMy43LS43LjktMS4yLjItLjUuNC0xIC40LTEuNiAwLTEuMi0uNC0yLjEtMS4yLTIuNy0uOC0uNi0xLjctLjktMi45LS45LS43IDAtMS40LjEtMS45LjQtLjUuMy0xIC42LTEuMyAxLjEtLjQuNC0uNiAxLS44IDEuNi0uMi42LS4zIDEuMi0uMyAxLjloLTIuN2MwLTEuMS4yLTIuMS41LTNzLjgtMS43IDEuMy0yLjNjLjYtLjYgMS4zLTEuMSAyLjItMS41LjktLjQgMS45LS41IDMtLjUgMSAwIDEuOS4xIDIuNy40czEuNi42IDIuMiAxLjFjLjYuNSAxLjEgMS4xIDEuNSAxLjlzLjUgMS43LjUgMi43YzAgMS0uMyAxLjktLjkgMi43LS42LjgtMS4zIDEuNC0yLjIgMS44di4xYzEuNC4zIDIuNCAxIDMuMSAyIC43IDEgMSAyLjIgMSAzLjYgMCAxLjEtLjIgMi4xLS42IDMtLjQuOS0xIDEuNi0xLjcgMi4ycy0xLjUgMS0yLjUgMS4zLTIgLjQtMyAuNGMtMS4yIDAtMi4yLS4yLTMuMS0uNS0uOS0uMy0xLjctLjgtMi40LTEuNC0uNy0uNi0xLjItMS40LTEuNS0yLjMtLjQtLjktLjUtMi0uNS0zLjFoMi43YzAgMS41LjUgMi43IDEuMyAzLjYuOC45IDIgMS40IDMuNiAxLjQuNyAwIDEuMy0uMSAxLjktLjMuNi0uMiAxLjEtLjUgMS42LS45cy44LS44IDEuMS0xLjQuNC0xLjIuNC0xLjhjMC0uNy0uMS0xLjMtLjQtMS45cy0uNi0xLTEtMS40LS45LS43LTEuNS0uOC0xLjItLjMtMS45LS4zYy0uNiAwLTEuMSAwLTEuNi4xVjExNWMtLjEuMSAwIC4xLjEuMXpNMjE0LjIgMTczLjh2Mi40aC0zLjF2NS4zaC0yLjZ2LTUuM2gtMTB2LTIuNmwxMC4zLTE0LjhoMi4ydjE1aDMuMnptLTUuNi0xMS4xbC03LjYgMTEuMWg3LjZ2LTExLjF6TTE2My43IDE5OS40bC0xLjIgNi41LjEuMWMuNS0uNiAxLjEtMSAxLjktMS4yLjgtLjMgMS42LS40IDIuMy0uNCAxIDAgMiAuMiAyLjguNS45LjMgMS43LjggMi4zIDEuNS43LjcgMS4yIDEuNSAxLjYgMi40cy42IDIuMS42IDMuNGMwIDEtLjIgMS45LS41IDIuOC0uMy45LS44IDEuNy0xLjUgMi40cy0xLjUgMS4zLTIuNSAxLjctMi4xLjYtMy41LjZjLTEgMC0xLjktLjEtMi44LS40cy0xLjYtLjctMi4zLTEuMi0xLjItMS4yLTEuNi0yYy0uNC0uOC0uNi0xLjctLjYtMi44aDIuN2MwIC42LjIgMS4xLjQgMS42cy42LjkgMSAxLjMuOS43IDEuNS45Yy42LjIgMS4yLjMgMS45LjMuNiAwIDEuMy0uMSAxLjgtLjMuNi0uMiAxLjEtLjYgMS41LTEgLjQtLjQuOC0xIDEtMS43LjMtLjcuNC0xLjUuNC0yLjQgMC0uNy0uMS0xLjQtLjQtMi4xcy0uNi0xLjItMS0xLjYtMS0uOC0xLjYtMS4xLTEuMy0uNC0yLjEtLjRjLS45IDAtMS43LjItMi40LjYtLjcuNC0xLjMuOS0xLjggMS42bC0yLjMtLjEgMi4xLTExLjhoMTEuMnYyLjRoLTl6TTExNi40IDIxNC4xYy0uNy0uNi0xLjUtLjktMi42LS45LTEuMiAwLTIuMS4zLTIuOC44cy0xLjMgMS4zLTEuNiAyLjEtLjcgMS44LS44IDIuOGMtLjEgMS0uMiAxLjktLjMgMi44bC4xLjFjLjYtMSAxLjQtMS44IDIuNC0yLjMuOS0uNSAyLS43IDMuMy0uNyAxLjEgMCAyLjEuMiAyLjkuNi45LjQgMS42LjkgMi4yIDEuNnMxIDEuNCAxLjQgMi4zYy4zLjkuNSAxLjkuNSAyLjkgMCAuOC0uMSAxLjctLjQgMi42LS4zLjktLjcgMS43LTEuMyAyLjQtLjYuNy0xLjQgMS4zLTIuMyAxLjgtMSAuNS0yLjIuNy0zLjYuNy0xLjcgMC0zLS4zLTQuMS0xcy0xLjgtMS42LTIuNC0yLjZjLS42LTEuMS0uOS0yLjItMS4xLTMuNS0uMi0xLjMtLjMtMi41LS4zLTMuNyAwLTEuNi4xLTMuMS40LTQuNS4zLTEuNS43LTIuOCAxLjQtMy45LjYtMS4xIDEuNS0yIDIuNi0yLjcgMS4xLS43IDIuNC0xIDQtMSAxLjkgMCAzLjQuNSA0LjUgMS41czEuNyAyLjQgMS45IDQuM2gtMi43Yy0uMi0xLjEtLjYtMS45LTEuMy0yLjV6bS00LjkgNy41Yy0uNi4zLTEuMS42LTEuNSAxLjEtLjQuNS0uNyAxLS45IDEuNi0uMi42LS4zIDEuMy0uMyAycy4xIDEuNC4zIDJjLjIuNi41IDEuMi45IDEuNi40LjQuOS44IDEuNSAxLjEuNi4zIDEuMy40IDIgLjRzMS40LS4xIDItLjRjLjYtLjMgMS0uNiAxLjQtMS4xLjQtLjUuNy0xIC45LTEuNnMuMy0xLjIuMy0xLjktLjEtMS40LS4zLTJjLS4yLS42LS41LTEuMi0uOC0xLjYtLjQtLjUtLjktLjgtMS40LTEuMXMtMS4yLS40LTItLjRjLS45LS4xLTEuNS4xLTIuMS4zek02NC45IDIwMy40Yy0xIDEuNi0xLjkgMy4yLTIuNyA1LS44IDEuOC0xLjQgMy42LTEuOSA1LjVzLS44IDMuNy0uOSA1LjVoLTNjLjEtMS45LjQtMy44LjktNS42LjUtMS44IDEuMS0zLjYgMS45LTUuMnMxLjctMy4zIDIuNy00LjhjMS0xLjUgMi4xLTIuOSAzLjMtNC4xSDUzLjVWMTk3aDE0Ljd2Mi4zYy0xLjIgMS4yLTIuMyAyLjUtMy4zIDQuMXpNMTUuMiAxNjIuMWMuNC0uNy45LTEuMyAxLjUtMS44czEuMy0uOSAyLjEtMS4xYy44LS4zIDEuNi0uNCAyLjUtLjQgMS4yIDAgMi4zLjIgMy4yLjUuOS4zIDEuNi44IDIuMSAxLjNzLjkgMS4yIDEuMiAxLjljLjMuNy40IDEuNC40IDIuMSAwIDEtLjMgMi0uOCAyLjhzLTEuMyAxLjUtMi4zIDEuOWMxLjQuNCAyLjQgMS4xIDMgMi4xczEgMi4yIDEgMy42YzAgMS4xLS4yIDIuMS0uNiAyLjktLjQuOS0uOSAxLjYtMS42IDIuMnMtMS41IDEtMi40IDEuMy0xLjkuNC0yLjkuNGMtMS4xIDAtMi4xLS4xLTMtLjQtLjktLjMtMS44LS43LTIuNC0xLjNzLTEuMi0xLjMtMS42LTIuMmMtLjQtLjktLjYtMS45LS42LTMgMC0xLjMuMy0yLjUgMS0zLjVzMS43LTEuNyAyLjktMi4yYy0xLS40LTEuNy0xLTIuMy0xLjktLjYtLjktLjktMS44LS45LTIuOC0uMS0uOS4xLTEuNy41LTIuNHptMi45IDE2LjJjLjkuOCAyLjEgMS4yIDMuNSAxLjIuNyAwIDEuMy0uMSAxLjktLjMuNi0uMiAxLjEtLjUgMS41LS45cy43LS45IDEtMS40LjMtMS4xLjMtMS44YzAtLjYtLjEtMS4yLS40LTEuN3MtLjYtMS0xLTEuNC0uOS0uNy0xLjUtLjljLS42LS4yLTEuMi0uMy0xLjgtLjMtLjcgMC0xLjMuMS0xLjkuMy0uNi4yLTEuMS41LTEuNS45LS40LjQtLjguOC0xIDEuNC0uMi41LS40IDEuMS0uNCAxLjgtLjEgMS4yLjMgMi4zIDEuMyAzLjF6bS0uMy0xMmMuMi41LjUuOC45IDEuMS40LjMuOC41IDEuMy43LjUuMSAxIC4yIDEuNi4yIDEuMSAwIDItLjMgMi43LTEgLjctLjYgMS4xLTEuNSAxLjEtMi43cy0uNC0yLTEuMS0yLjZjLS43LS42LTEuNi0uOS0yLjctLjktLjUgMC0xIC4xLTEuNS4ycy0uOS40LTEuMy43Yy0uNC4zLS42LjctLjggMS4xLS4yLjQtLjMuOS0uMyAxLjUtLjIuNy0uMSAxLjIuMSAxLjd6TTQuNSAxMjUuMWMuOC42IDEuNy45IDIuOC45IDEuNyAwIDIuOS0uNyAzLjctMi4yczEuMy0zLjYgMS40LTYuNmwtLjEtLjFjLS41IDEtMS4yIDEuNy0yLjIgMi4zLS45LjYtMiAuOC0zLjEuOC0xLjIgMC0yLjItLjItMy4xLS42LS45LS40LTEuNi0uOS0yLjMtMS42LS42LS43LTEuMS0xLjUtMS40LTIuNC0uMy0uOS0uNS0yLS41LTMuMXMuMi0yLjEuNS0zYy40LS45LjktMS43IDEuNS0yLjMuNy0uNyAxLjUtMS4yIDIuNC0xLjUuOS0uNCAxLjktLjUgMy0uNXMyLjEuMiAzIC41Yy45LjMgMS44LjkgMi41IDEuNy43LjggMS4zIDEuOSAxLjcgMy4zLjQgMS40LjYgMy4yLjYgNS4zIDAgMy45LS42IDYuOS0xLjkgOS0xLjIgMi4xLTMuMiAzLjItNiAzLjItMS45IDAtMy41LS41LTQuNy0xLjRzLTItMi40LTIuMS00LjRoMi43Yy40IDEuMi45IDIuMSAxLjYgMi43em03LjItMTQuMmMtLjItLjYtLjUtMS4yLS45LTEuNnMtLjktLjktMS41LTEuMWMtLjYtLjMtMS4yLS40LTItLjRzLTEuNS4xLTIuMS40LTEgLjctMS40IDEuMmMtLjQuNS0uNiAxLjEtLjggMS43LS4yLjYtLjIgMS4zLS4yIDIgMCAuNi4xIDEuMi4zIDEuOC4yLjYuNSAxLjEuOSAxLjUuNC40LjkuOCAxLjQgMS4xczEuMS40IDEuOC40IDEuMy0uMSAxLjktLjQgMS4xLS42IDEuNS0xLjFjLjQtLjUuNy0xIC45LTEuNi4yLS42LjMtMS4yLjMtMS45LjItLjcuMS0xLjQtLjEtMnpNMTMuNiA3NlY1OS44SDcuOHYtMi4yYy44IDAgMS41LS4xIDIuMi0uMi43LS4xIDEuNC0uMyAyLS43LjYtLjMgMS4xLS44IDEuNS0xLjMuNC0uNi43LTEuMy44LTIuMWgyLjFWNzZoLTIuOHpNMjEuOSA2Mi4zYzAtLjkuMS0xLjguMy0yLjYuMi0uOS40LTEuNy43LTIuNC4zLS44LjgtMS40IDEuMy0yIC42LS42IDEuMy0xIDIuMS0xLjRzMS45LS41IDMtLjVjMS4yIDAgMi4yLjIgMyAuNXMxLjUuOCAyLjEgMS40Yy42LjYgMSAxLjIgMS4zIDIgLjMuOC42IDEuNi43IDIuNC4yLjkuMyAxLjcuMyAyLjZzLjEgMS44LjEgMi42IDAgMS43LS4xIDIuNi0uMSAxLjgtLjMgMi42Yy0uMi45LS40IDEuNy0uNyAyLjRzLS44IDEuNC0xLjMgMmMtLjYuNi0xLjIgMS0yLjEgMS40cy0xLjguNS0zIC41LTIuMi0uMi0zLS41LTEuNS0uOC0yLjEtMS40Yy0uNi0uNi0xLTEuMi0xLjMtMnMtLjYtMS42LS43LTIuNGMtLjItLjktLjMtMS43LS4zLTIuNiAwLS45LS4xLTEuOC0uMS0yLjYuMS0uOC4xLTEuNy4xLTIuNnptMi45IDUuNGMuMSAxLjEuMiAyIC41IDMgLjMuOS44IDEuNyAxLjQgMi40czEuNSAxIDIuNyAxYzEuMiAwIDItLjMgMi43LTFzMS4xLTEuNCAxLjQtMi40Yy4zLS45LjUtMS45LjUtMyAuMS0xLjEuMS0yIC4xLTIuOVY2M2MwLS43LS4xLTEuMy0uMi0ycy0uMi0xLjMtLjQtMmMtLjItLjYtLjQtMS4yLS44LTEuN3MtLjgtLjktMS4zLTEuMi0xLjItLjQtMi0uNC0xLjQuMS0yIC40Yy0uNS4zLTEgLjctMS4zIDEuMi0uNC41LS42IDEtLjggMS43LS4yLjYtLjMgMS4zLS40IDItLjEuNy0uMSAxLjMtLjIgMnYxLjhjLjEuOS4xIDEuOS4xIDIuOXoiLz48Zz48cGF0aCBkPSJNNTMuNSAzOC4yVjIxLjloLTUuOXYtMi4yYy44IDAgMS41LS4xIDIuMi0uMi43LS4xIDEuNC0uMyAyLS43LjYtLjMgMS4xLS44IDEuNS0xLjMuNC0uNi43LTEuMy44LTIuMWgyLjF2MjIuN2gtMi43ek02OS4xIDM4LjJWMjEuOWgtNS45di0yLjJjLjggMCAxLjUtLjEgMi4yLS4yLjctLjEgMS40LS4zIDItLjcuNi0uMyAxLjEtLjggMS41LTEuMy40LS42LjctMS4zLjgtMi4xaDIuMXYyMi43aC0yLjd6Ii8+PC9nPjwvc3ZnPg==) no-repeat center;
      background-size: 88%;
      --diameter: 100%;
      --radius: 50%;
      --hand-width: 2%;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid black;
    }

    .clock.simple:after {
      background: #000;
      border-radius: 50%;
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 5%;
      height: 5%;
      z-index: 10;
    }

    .hand {
      background-color: black;
      position: absolute;
      left: calc(var(--radius) - calc(var(--hand-width) / 2));
      transform-origin: 50% 100%;
    }

    #hour {
      top: 30%;
      height: 20%;
      width: 2.5%;
    }

    #minute {
      top: 10%;
      height: 40%;
      width: 2%;
    }

    #second {
      top: 14%;
      height: 45%;
      width: 1%;
      transform-origin: 50% 80%;
    }

    .clock.mounted #minute,
    .clock.mounted #second {
      transition: transform 0.2s cubic-bezier(.4,2.08,.55,.44);
    }
  </style>
  <div class="clock simple">
    <div id="hour" class="hand"></div>
    <div id="minute" class="hand"></div>
    <div id="second" class="hand"></div>
  </div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();
  let clockNode = frag.querySelector('.clock');
  let hourNode = frag.querySelector('#hour');
  let minuteNode = frag.querySelector('#minute');
  let secondNode = frag.querySelector('#second');

  /* State variables */
  let hour, minute, second, mounted;
  let threshold = 200;
  let time = Date.now() - threshold;
  let rafId;

  /* DOM update functions */
  function setHourNode(value) {
    hourNode.style.transform = `rotate(${Math.floor(value)}deg)`;
  }

  function setMinuteNode(value) {
    minuteNode.style.transform = `rotate(${Math.floor(value)}deg)`;
  }

  function setSecondNode(value) {
    secondNode.style.transform = `rotate(${Math.floor(value)}deg)`;
  }

  function setClockNode(value) {
    clockNode.classList.add(value);
  }

  /* State update functions */
  function setHour(value) {
    hour = value;
    setHourNode(getDegree(hour, 12));
  }

  function setMinute(value) {
    minute = value;
    setMinuteNode(getDegree(minute, 60));
  }

  function setSecond(value) {
    second = value;
    setSecondNode(getDegree(second, 60));
  }

  function setMounted(value) {
    mounted = value;
    setClockNode('mounted');
  }

  /* State logic */
  function updateTime(newTime) {
    time = newTime;
    let date = new Date(time);
    setHour(date.getHours());
    setMinute(date.getMinutes());
    setSecond(date.getSeconds());
  }

  function setTime() {
    let last = time;
    let now = Date.now();
    let diff = now - last;

    if(diff >= threshold) {
      updateTime(now);
    }
  }

  function setExplicitTime(time) {
    cancelAnimationFrame(rafId);
    updateTime(Number(time));
  }

  function getDegree(value, max) {
    let fraction = value / max;
    return 360 * fraction;
  }

  /* Event listeners */
  function onNewFrame() {
    setTime();
    requestAnimationFrame(onNewFrame);
  }

  /* Init functionality */
  setTime();
  setMounted(true);
  rafId = requestAnimationFrame(onNewFrame);

  function disconnect() {
    cancelAnimationFrame(rafId);
  }

  function update(data = {}) {
    if(data.time) setExplicitTime(data.time);
    return frag;
  }

  update.disconnect = disconnect;

  return update;
}


customElements.define('analog-clock', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._update = init();
    this.shadowRoot.appendChild(this._update({
      time: this.dataset.time
    }));
  }

  disconnectedCallback() {
    this._update.disconnect();
  }
});