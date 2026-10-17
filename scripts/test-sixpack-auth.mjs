import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transformWithEsbuild } from 'vite';

// Render the actual shell Views, so dropping uid at the integration boundary fails.
const file = new URL('../src/App.jsx', import.meta.url);
const source = await readFile(file, 'utf8');
const { code } = await transformWithEsbuild(`${source}\nexport { Views };`, file.pathname, { loader: 'jsx', format: 'cjs', jsxFactory: 'h', jsxFragment: 'Fragment' });
const sixpack = function SixPack() {};
const module = { exports: {} };
vm.runInNewContext(code, {
  module, exports: module.exports, Fragment: 'fragment',
  h: (type, props, ...children) => ({ type, props, children }),
  require: name => name.includes('SixPackPromiseCard') ? { __esModule: true, default: sixpack } : { __esModule: true, default: () => null },
});
function find(node) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === sixpack) return node;
  for (const child of (node.children || []).flat(Infinity)) {
    const found = find(child);
    if (found) return found;
  }
  return null;
}
for (const uid of ['alice', 'bob', null]) {
  const routes = [];
  const tree = module.exports.Views({ tab: 'sixpack', user: uid ? { uid } : null, navigate: (...args) => routes.push(args) });
  const view = find(tree);
  assert(view, '6pack remains embedded in the shell');
  assert.equal(view.props.uid, uid);
  assert.equal(view.props.key, uid || 'anonymous', 'changing account remounts the app');
  view.props.onSubNav('today');
  assert.equal(routes[0].join('/'), 'fitness/today');
}
// Execute the real photo auth adapter against an existing shell Firebase session.
const authSource = await readFile(new URL('../6pack-app/photoAuth.js', import.meta.url), 'utf8');
const stripped = authSource.replace(/^import .*;\n/gm, '');
const authCode = await transformWithEsbuild(stripped, 'photoAuth.js', { format: 'cjs' });
const shellApp = { name: '[DEFAULT]', options: { projectId: 'fitness-aos' } };
const user = { uid: 'alice' };
const authModule = { exports: {} };
vm.runInNewContext(authCode.code, {
  module: authModule, exports: authModule.exports,
  config: { projectId: 'fitness-aos' },
  getApps: () => [shellApp], getApp: () => shellApp,
  initializeApp: () => { throw Error('must reuse shell app'); },
  getAuth: app => { assert.equal(app, shellApp); return { currentUser: user }; },
  onAuthStateChanged: (auth, callback) => { callback(auth.currentUser); return () => {}; },
});
let observed;
authModule.exports.watchPhotoUser(value => { observed = value; });
assert.equal(observed, user, 'selfies receive the existing logged-in shell user');
console.log('6pack shell auth: existing Firebase login, UID propagation, account remount and navigation passed.');
