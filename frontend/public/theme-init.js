// Apply the persisted theme before first paint to avoid a flash.
try {
  var t = localStorage.getItem("flowmate-theme");
  var dark =
    t === "dark" ||
    (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.classList.add("dark");
} catch (e) {}
