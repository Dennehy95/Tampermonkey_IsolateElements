// ==UserScript==
// @name         Isolate iFrame and Video elements from pages
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Isolate iframes and video elements on the page. Allows you to view the elements without the distractions of the rest of the page
// @author       Bryan Dennehy
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const BUTTON_STYLE = {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    color: '#000',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    margin: '5px',
    padding: '5px 10px',
    textTransform: 'none'
  }

  function addCustomVideoControls (videoElement, index) {
    // Define the custom controls HTML with a unique ID
    const customControlsHTML = `
        <div>
            <button id="playPauseButton-${index}">Play</button>
            <input type="range" id="volumeControl-${index}" min="0" max="1" step="0.1" value="1">
        </div>
    `;

    const container = document.createElement('div');
    container.id = `isolatorVideoControl-${index}`;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.innerHTML = customControlsHTML;

    video.id = `video-${index}`;
    console.log(videoElement)
    video.src = videoElement.src; // Set the video source
    video.controls = true; // Enable native video controls
    container.appendChild(video);

    // Create the custom controls div with a unique ID
    const customControls = document.createElement('div');
    customControls.id = `customControls-${index}`;
    customControls.style.display = 'flex';
    customControls.style.alignItems = 'center';

    // Create custom control buttons
    const playPauseButton = document.createElement('button');
    playPauseButton.id = `playPauseButton-${index}`;
    playPauseButton.textContent = 'Play';
    playPauseButton.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playPauseButton.textContent = 'Pause';
      } else {
        video.pause();
        playPauseButton.textContent = 'Play';
      }
    });

    const volumeControl = document.createElement('input');
    volumeControl.id = `volumeControl-${index}`;
    volumeControl.type = 'range';
    volumeControl.min = 0;
    volumeControl.max = 1;
    volumeControl.step = 0.1;
    volumeControl.value = 1;
    volumeControl.addEventListener('input', () => {
      video.volume = volumeControl.value;
    });

    // Append custom control buttons to the custom controls div
    customControls.appendChild(playPauseButton);
    customControls.appendChild(volumeControl);

    // Append the custom controls div to the container
    container.appendChild(customControls);

    document.documentElement.appendChild(container);
  }

  if (window.self !== window.top) {
    return;
  }
  const appContainer = document.createElement('div');
  const buttonContainer = document.createElement('div');
  const menuContainer = document.createElement('div');
  let openButton;

  const deletedElements = [];

  let isTableOpen = false;
  async function createAppContainer () {
    appContainer.style.backgroundColor = '#fff';
    appContainer.style.boxShadow = '0 0 3px 2px #42b14b';
    appContainer.style.display = 'flex';
    appContainer.style.margin = '8px';
    appContainer.style.flexDirection = 'column';
    appContainer.style.position = 'fixed';
    appContainer.style.top = '0px';
    appContainer.style.right = '0px';
    appContainer.style.zIndex = '9999';

    document.documentElement.appendChild(appContainer);
    await createOpenButton();
    await organizeElements();
  }

  function createOpenButton () {
    openButton = createStyledButton('Open Organize Elements');
    openButton.addEventListener('click', toggleTable);
    openButton.style.fontSize = '18px';
    openButton.style.margin = '0px';
    openButton.style.transition = 'background-color 0.3s'; // Smooth transition on background color
    openButton = addButtonHoverListeners({ button: openButton });

    return appContainer.appendChild(openButton);
  }

  function toggleTable () {
    if (isTableOpen) {
      openButton.textContent = 'Open Organize Elements'
      menuContainer.style.display = 'none'; // Close the table
      isTableOpen = false;
    } else {
      openButton.textContent = 'Close Organize Elements'
      menuContainer.style.display = 'block'; // Open the table
      isTableOpen = true;
    }
  }

  function addButtonHoverListeners ({ button, enterColor, leaveColor }) {
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = enterColor || '#ccc';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = leaveColor || BUTTON_STYLE.backgroundColor;
    });

    return button;
  }

  function organizeElements () {
    const elementObjs = [];
    const iframes = document.querySelectorAll('iframe');
    const videos = document.querySelectorAll('video');

    iframes.forEach(iframe => {
      if (!iframe.parentElement.closest('iframe')) {
        elementObjs.push({ type: 'iframe', element: iframe });
      }
    });

    videos.forEach(video => {
      if (!video.parentElement.closest('iframe')) {
        elementObjs.push({ type: 'video', element: video });
      }
    });

    menuContainer.style.display = 'none';

    menuContainer.style.zIndex = '9999';
    menuContainer.style.backgroundColor = '#fff';
    menuContainer.style.padding = '8px';
    menuContainer.style.maxHeight = '200px';
    menuContainer.style.overflowY = 'scroll';

    const table = document.createElement('table');
    table.style.margin = '0, 0, 5px';
    table.style.width = '100%';

    elementObjs.forEach((elementObj, index) => {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.style.padding = '4px'

      let moveButton = createStyledButton('Move');
      moveButton.addEventListener('click', () => moveElement(elementObj.element, index));
      moveButton = addButtonHoverListeners({ button: moveButton });

      let identifyButton = createStyledButton('Identify');
      identifyButton.addEventListener('click', () => identifyElement(elementObj.element));
      identifyButton = addButtonHoverListeners({ button: identifyButton });

      let toggleButton = createStyledButton('Delete');
      toggleButton.style.backgroundColor = '#ff5e5e';
      toggleButton.addEventListener('click', () => toggleDeleteRestore({ elementObj, toggleButton, elementIndex: index }));
      toggleButton = addButtonHoverListeners({ button: toggleButton, enterColor: '#ff7f7f', leaveColor: '#ff5e5e' });

      cell.appendChild(moveButton);
      cell.appendChild(identifyButton);
      cell.appendChild(toggleButton);
      cell.appendChild(document.createTextNode(` (${elementObj.type})`));
      row.appendChild(cell);
      table.appendChild(row);
    });

    let moveAllButton = createStyledButton('Move All Elements');
    moveAllButton.addEventListener('click', () => {
      elementObjs.forEach(elementObj => moveElement(elementObj.element));
      menuContainer.remove();
    });
    moveAllButton = addButtonHoverListeners({ button: moveAllButton });

    let hideButton = createStyledButton('Hide Body');
    hideButton.addEventListener('click', () => {
      document.body.style.display = 'none';
    });
    hideButton = addButtonHoverListeners({ button: hideButton });

    let deleteButton = createStyledButton('Delete Body');
    deleteButton.addEventListener('click', () => {
      deleteBody();
    });
    deleteButton = addButtonHoverListeners({ button: deleteButton });

    menuContainer.appendChild(table);
    menuContainer.appendChild(moveAllButton);
    menuContainer.appendChild(hideButton);
    menuContainer.appendChild(deleteButton);
    return appContainer.appendChild(menuContainer);
  }

  function createStyledButton (text) {
    const button = document.createElement('button');
    for (const style in BUTTON_STYLE) {
      button.style[style] = BUTTON_STYLE[style];
    }
    button.textContent = text;
    return button;
  }

  function moveElement (element, index) {
    if (element.type === 'video') {
      //APpend controls with index,
      // append video into that
      console.log(element)
      console.log(index)
      addCustomVideoControls(element, index);
    } else {
      document.body.parentElement.appendChild(element);
    }
  }

  function deleteElement ({ elementObj, elementIndex }) {
    const { element, index } = elementObj;
    elementObj.removed = true;
    const parentElement = elementObj.element.parentElement;
    deletedElements.push({ element, parentElement: parentElement, elementIndex });
    element.remove();
  }

  function toggleDeleteRestore ({ elementObj, toggleButton, elementIndex }) {
    const { element, removed } = elementObj;
    if (removed) {
      if (!(elementIndex >= 0)) return
      const deletedElement = deletedElements.find(deletedElement => deletedElement.elementIndex === elementIndex)
      const parentElement = deletedElement.parentElement
      parentElement.appendChild(element);
      elementObj.removed = false;
      toggleButton.textContent = 'Delete';
      toggleButton.style.backgroundColor = '#ff5e5e';
      toggleButton = addButtonHoverListeners({ button: toggleButton, enterColor: '#ff7f7f', leaveColor: '#ff5e5e' });
      toggleButton.style.color = '#000';
    } else {
      deleteElement({ elementObj, elementIndex });
      toggleButton.textContent = 'Restore';
      toggleButton.style.backgroundColor = '#42b14b';
      toggleButton = addButtonHoverListeners({ button: toggleButton, enterColor: '#77cf7e', leaveColor: '#42b14b' });
    }
  }

  function deleteBody () {
    const body = document.body;
    const parent = body.parentElement;
    parent.removeChild(body);
  }

  function identifyElement (element) {
    const originalBoxShadow = element.style.boxShadow;
    element.style.boxShadow = '0 0 10px 2px red';
    setTimeout(() => {
      element.style.boxShadow = originalBoxShadow;
    }, 3000);
  }

  window.addEventListener('load', createAppContainer);
})();
