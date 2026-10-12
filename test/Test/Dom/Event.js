// Dispatches a keydown. If nothing cancelled it, the key is typed into the
// input, as a browser would; happy-dom does not do that itself.
export const press = (key) => (element) => () => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  const proceeded = element.dispatchEvent(event);
  if (proceeded && key.length === 1) {
    element.value += key;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
};
