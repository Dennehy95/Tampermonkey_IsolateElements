// ==UserScript==
// @name         Isolate iFrame and Video elements from pages
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Isolate iframes and video elements on the page. Allows you to view the elements without the distractions of the rest of the page
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (window.self !== window.top) {
    return;
  }

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
    const elements = [];
    const iframes = document.querySelectorAll('iframe');
    const videos = document.querySelectorAll('video');

    iframes.forEach(iframe => {
      if (!iframe.parentElement.closest('iframe')) {
        elements.push({ type: 'iframe', element: iframe });
      }
    });

    videos.forEach(video => {
      if (!video.parentElement.closest('iframe')) {
        elements.push({ type: 'video', element: video });
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

    elements.forEach((element, index) => {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const moveButton = createStyledButton('Move');
      moveButton.addEventListener('click', () => moveElement(element.element));
      const identifyButton = createStyledButton('Identify');
      identifyButton.addEventListener('click', () => identifyElement(element.element));
      const deleteButton = createStyledButton('Delete');
      deleteButton.addEventListener('click', () => toggleDeleteRestore(element, deleteButton));
      cell.appendChild(moveButton);
      cell.appendChild(identifyButton);
      cell.appendChild(deleteButton);
      cell.appendChild(document.createTextNode(` (${element.type})`));
      row.appendChild(cell);
      table.appendChild(row);
    });

    const moveAllButton = createStyledButton('Move All Elements');
    moveAllButton.addEventListener('click', () => {
      elements.forEach(element => moveElement(element.element));
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

  function deleteElement (element) {
    element.remove();
  }

  function toggleDeleteRestore (element, button) {
    if (element.removed) {
      element.removed = false;
      button.textContent = 'Delete';
      button.style.backgroundColor = 'white';
      button.style.color = 'black';
      moveElement(element.element);
    } else {
      element.removed = true;
      button.textContent = 'Restore';
      button.style.backgroundColor = 'green';
      button.style.color = 'white';
      deleteElement(element.element);
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
