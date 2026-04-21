export function q(root, selector) {
  const node = root.querySelector(selector);
  if (!node) throw new Error(`hardview: selector not found: ${selector}`);
  return node;
}
