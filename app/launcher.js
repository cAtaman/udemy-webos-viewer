(function () {
  'use strict';
  var destinations = {
    learning: 'https://www.udemy.com/home/my-courses/learning/',
    login: 'https://www.udemy.com/join/login-popup/',
    home: 'https://www.udemy.com/'
  };
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-target]'));
  var status = document.getElementById('status');
  function openUdemy(event) {
    var target = destinations[event.currentTarget.getAttribute('data-target')];
    if (!target) { return; }
    if (navigator.onLine === false) {
      status.textContent = 'Connect the TV to the internet, then try again.';
      return;
    }
    status.textContent = 'Opening Udemy…';
    // Top-level navigation is intentional: iframe embedding can be blocked,
    // and Udemy must handle its own cookies, authentication and video player.
    // This stays in the webOS app; no browser app or Luna browser launch is used.
    window.location.assign(target);
  }
  buttons.forEach(function (button) { button.addEventListener('click', openUdemy); });
  document.addEventListener('keydown', function (event) {
    var index = buttons.indexOf(document.activeElement);
    var direction = event.keyCode === 37 || event.keyCode === 38 ? -1 :
      event.keyCode === 39 || event.keyCode === 40 ? 1 : 0;
    if (direction) {
      event.preventDefault();
      buttons[(index < 0 ? 0 : (index + direction + buttons.length) % buttons.length)].focus();
    }
    // Enter/OK activates the focused native button through its click event.
    // Back is managed by webOS using the normal history API.
  });
  window.addEventListener('pageshow', function () {
    status.textContent = 'Use the arrow keys and OK to select.';
    buttons[0].focus();
  });
  buttons[0].focus();
}());
