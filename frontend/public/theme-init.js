// Set the dial before first paint so there is no flash of the wrong one.
// The instrument's native state is the dark dial.
try {
  var t = localStorage.getItem("flowmate-theme");
  var light =
    t === "light" ||
    (!t && window.matchMedia("(prefers-color-scheme: light)").matches);
  if (!light) document.documentElement.classList.add("dark");
} catch (err) {
  if (err) document.documentElement.classList.add("dark");
}
