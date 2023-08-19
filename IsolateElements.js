// ==UserScript==
// @name         Isolate iFrame and Video elements from pages
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Isolate iframes and video elements on the page. Allows you to view the elements without the distractions of the rest of the page
// @author       Bryan Dennehy
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.self !== window.top) {
    return;
  }

  // Store information about deleted elements
  const deletedElements = [];

  function createButton () {
    const button = document.createElement('button');
    button.textContent = 'Organize Elements';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '5px 10px';
    button.style.margin = '5px';
    button.style.backgroundColor = '#fff';
    button.style.color = '#000';
    button.style.border = '1px solid #ccc';
    button.addEventListener('click', organizeElements);
    document.body.appendChild(button);
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

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '9999';
    container.style.backgroundColor = 'white';
    container.style.border = '1px solid #ccc';
    container.style.padding = '10px';
    container.style.maxHeight = '200px';
    container.style.overflowY = 'scroll';

    const table = document.createElement('table');
    table.style.width = '100%';

    elementObjs.forEach((elementObj, index) => {
      const row = document.createElement('tr');
      const cell = document.createElement('td');

      const moveButton = createStyledButton('Move');
      moveButton.addEventListener('click', () => moveElement(elementObj.element));

      const identifyButton = createStyledButton('Identify');
      identifyButton.addEventListener('click', () => identifyElement(elementObj.element));

      const toggleButton = createStyledButton('Delete');
      toggleButton.addEventListener('click', () => toggleDeleteRestore({ elementObj, toggleButton, elementIndex: index }));

      cell.appendChild(moveButton);
      cell.appendChild(identifyButton);
      cell.appendChild(toggleButton);
      cell.appendChild(document.createTextNode(` (${elementObj.type})`));
      row.appendChild(cell);
      table.appendChild(row);
    });

    const moveAllButton = createStyledButton('Move All Elements');
    moveAllButton.addEventListener('click', () => {
      elementObjs.forEach(elementObj => moveElement(elementObj.element));
      container.remove();
    });

    const hideButton = createStyledButton('Hide Body');
    hideButton.addEventListener('click', () => {
      document.body.style.display = 'none';
    });

    const deleteButton = createStyledButton('Delete Body');
    deleteButton.addEventListener('click', () => {
      deleteBody();
    });

    container.appendChild(table);
    container.appendChild(moveAllButton);
    container.appendChild(hideButton);
    container.appendChild(deleteButton);
    document.body.appendChild(container);
  }

  function createStyledButton (text) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.padding = '5px 10px';
    button.style.margin = '5px';
    button.style.backgroundColor = '#fff';
    button.style.color = '#000';
    button.style.border = '1px solid #ccc';
    button.style.textTransform = 'none';
    return button;
  }

  function moveElement (element) {
    document.body.parentElement.appendChild(element);
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
      toggleButton.style.backgroundColor = '#fff';
      toggleButton.style.color = '#000';
    } else {
      deleteElement({ elementObj, elementIndex });
      toggleButton.textContent = 'Restore';
      toggleButton.style.backgroundColor = 'green';
      toggleButton.style.color = 'white';
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

  window.addEventListener('load', createButton);
})();
