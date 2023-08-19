// ==UserScript==
// @name         Isolate iFrame and Video elements from pages
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Isolate iframes and video elements on the page. Allows you to view the elements without the distractions of the rest of the page
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Check if the script is running in the top-level window
  if (window.self !== window.top) {
    return; // Do nothing if running in an iframe
  }

  function createButton () {
    const button = document.createElement('button');
    button.textContent = 'Organize Elements';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
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
      const moveButton = document.createElement('button');
      moveButton.textContent = 'Move';
      moveButton.addEventListener('click', () => moveElement(element.element));
      const identifyButton = document.createElement('button');
      identifyButton.textContent = 'Identify';
      identifyButton.addEventListener('click', () => identifyElement(element.element));
      cell.appendChild(moveButton);
      cell.appendChild(identifyButton);
      cell.appendChild(document.createTextNode(` (${element.type})`));
      row.appendChild(cell);
      table.appendChild(row);
    });

    const moveAllButton = document.createElement('button');
    moveAllButton.textContent = 'Move All Elements';
    moveAllButton.addEventListener('click', () => {
      elements.forEach(element => moveElement(element.element));
      container.remove();
    });

    const hideButton = document.createElement('button');
    hideButton.textContent = 'Hide Body';
    hideButton.addEventListener('click', () => {
      document.body.style.display = 'none';
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Body';
    deleteButton.addEventListener('click', () => {
      deleteBody();
    });

    container.appendChild(table);
    container.appendChild(moveAllButton);
    container.appendChild(hideButton);
    container.appendChild(deleteButton);
    document.body.appendChild(container);
  }

  function moveElement (element) {
    document.body.parentElement.appendChild(element); // Append to the parent of body
  }

  function deleteBody () {
    const body = document.body;
    const parent = body.parentElement;
    parent.removeChild(body);
  }

  function identifyElement (element) {
    const originalBoxShadow = element.style.boxShadow;
    element.style.boxShadow = '0 0 10px 2px red'; // Change the values to adjust shadow size
    setTimeout(() => {
      element.style.boxShadow = originalBoxShadow;
    }, 3000);
  }

  window.addEventListener('load', createButton);
})();