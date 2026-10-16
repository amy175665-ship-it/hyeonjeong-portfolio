// Writes inline styles (CSS properties or custom properties) only when their value changes. Scroll-driven parts set
// many styles every frame; writing an unchanged value still makes the browser recalculate styles, which adds up while
// scrolling or while a loop runs. An empty value removes the style.
export function styleWriter() {
  const written = new WeakMap<HTMLElement, Map<string, string>>();
  return (element: HTMLElement, name: string, value: string) => {
    let values = written.get(element);
    if (!values) {
      values = new Map();
      written.set(element, values);
    }
    if (values.get(name) === value) return;
    values.set(name, value);
    element.style.setProperty(name, value);
  };
}
