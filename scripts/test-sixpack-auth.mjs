import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as esbuild from 'esbuild';

// Render the actual shell router: der sixpack-Tab laeuft seit 88ac3bf ueber CoreSkillsApp (Skills-CSS/-Theme, Shell-Auth).
const file = new URL('../src/shell/ShellAppRouter.jsx', import.meta.url);
const source = await readFile(file, 'utf8');
const { code } = await esbuild.transform(source, { loader: 'jsx', format: 'cjs', jsxFactory: 'h', jsxFragment: 'Fragment' });
const sixpackApp = function CoreSkillsApp() {};
const module = { exports: {} };
vm.runInNewContext(code, {
  module, exports: module.exports, Fragment: 'fragment',
  h: (type, props, ...children) => ({ type, props, children }),
  require: name => name.includes('CoreSkillsApp') ? { __esModule: true, default: sixpackApp } : { __esModule: true, default: () => null },
});
function find(node) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === sixpackApp) return node;
  for (const child of (node.children || []).flat(Infinity)) {
    const found = find(child);
    if (found) return found;
  }
  return null;
}
for (const uid of ['alice', 'bob', null]) {
  const routes = [];
  const tree = module.exports.default({ tab: 'sixpack', user: uid ? { uid } : null, navigate: (...args) => routes.push(args) });
  const view = find(tree);
  assert(view, '6Pack remains embedded in the shell via CoreSkillsApp');
  assert.match(view.props.initialRoute, /^sixpack\/?/, 'sixpack tab opens the 6Pack route');
  assert.equal(view.props.user?.uid || null, uid);
  view.props.onNavigate('fitness', 'today');
  assert.equal(routes[0].join('/'), 'fitness/today');
}
const wrapper = await readFile(new URL('../prod/src/shell/CoreSkillsApp.jsx', import.meta.url), 'utf8');
assert.match(wrapper, /uid=\{uid\}/, 'wrapper forwards the shell account to 6Pack');
assert.match(wrapper, /loadRemoteProgram=\{loadProgram\}/, 'wrapper uses shared cloud program persistence');
assert.match(wrapper, /onWorkoutComplete=\{complete\}/, 'wrapper logs finished workouts');
assert.match(wrapper, /skills-app\/skills\.css/, '6Pack in the shell uses the Skills CSS');
assert.match(wrapper, /data-theme="skills"/, '6Pack in the shell uses the Skills theme');
// Execute the real photo auth adapter against an existing shell Firebase session.
const authSource = await readFile(new URL('../6pack-app/photoAuth.js', import.meta.url), 'utf8');
const stripped = authSource.replace(/^import .*;\n/gm, '');
const authCode = await esbuild.transform(stripped, { format: 'cjs' });
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
console.log('6pack shell auth: existing Firebase login, UID forwarding and navigation passed.');
