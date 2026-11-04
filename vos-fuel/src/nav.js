// Hash-Navigation von vos-fuel: Home = "#/", Seiten = "#/<key>" (key aus fuel-app/routes.js oder "menu").
export function go(route) {
  window.location.hash = route === "home" ? "#/" : `#/${route}`;
}
