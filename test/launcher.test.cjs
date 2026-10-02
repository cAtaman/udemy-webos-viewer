const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function launch(online = true) {
  const events = {};
  const status = { textContent: '' };
  const locations = [];
  const document = { activeElement: null, addEventListener: (name, cb) => { events[name] = cb; } };
  const buttons = ['learning', 'login', 'home'].map(target => ({
    handlers: {},
    getAttribute: () => target,
    addEventListener(name, cb) { this.handlers[name] = cb; },
    focus() { document.activeElement = this; }
  }));
  document.querySelectorAll = () => buttons;
  document.getElementById = () => status;
  const window = { location: { assign: url => locations.push(url) }, addEventListener: (name, cb) => { events[name] = cb; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app/launcher.js'), 'utf8'), { document, window, navigator: { onLine: online } });
  return { buttons, document, status, locations, events };
}

test('remote arrows cycle focus; returning restores the default selection', () => {
  const app = launch();
  assert.equal(app.document.activeElement, app.buttons[0]);
  app.events.keydown({ keyCode: 37, preventDefault() {} });
  assert.equal(app.document.activeElement, app.buttons[2]);
  app.events.keydown({ keyCode: 39, preventDefault() {} });
  assert.equal(app.document.activeElement, app.buttons[0]);
  app.events.pageshow();
  assert.equal(app.document.activeElement, app.buttons[0]);
});

test('each selection navigates directly to the intended HTTPS Udemy page', () => {
  const app = launch();
  app.buttons.forEach(button => button.handlers.click({ currentTarget: button }));
  assert.deepEqual(app.locations, [
    'https://www.udemy.com/home/my-courses/learning/',
    'https://www.udemy.com/join/login-popup/',
    'https://www.udemy.com/'
  ]);
});

test('offline selection shows recovery instructions without navigating', () => {
  const app = launch(false);
  app.buttons[0].handlers.click({ currentTarget: app.buttons[0] });
  assert.equal(app.locations.length, 0);
  assert.match(app.status.textContent, /Connect the TV/);
});
