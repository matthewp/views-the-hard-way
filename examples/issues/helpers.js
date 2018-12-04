
function conditional(left, right) {
  let parent = left.parentNode || right.parentNode;

  function remove(node) {
    if(node.parentNode === parent) {
      parent.removeChild(node);
    }
  }

  function update(showLeft) {
    if(showLeft) {
      parent.insertBefore(left, right);
      remove(right); 
    } else {
      parent.insertBefore(right, left);
      remove(left);
    }
  }

  return update;
}

export { conditional };