# Templates the Hard Way

Learn how to build views in plain JavaScript in a way that is maintainable, performant, and fun. *Templates the Hard Way* is inspired by such books as [Learn C the Hard Way](https://learncodethehardway.org/c/).

## What is this?

Templates the Hard Way is a pattern for writing JavaScript views. It is meant to serve as an alternative to using frameworks and libraries such as [React](https://reactjs.org), [Vue](https://vuejs.org/) and [lit-html](https://lit-html.polymer-project.org/).

It is a __pattern__, not a library. This document explains how to write views in such a way as to avoid the [spaghetti code](https://en.wikipedia.org/wiki/Spaghetti_code) problems that commonly occur when writing low-level imperative code.

We call this technique *the hard way* because it askews abstractions in favor of directness.

### Advantages over frameworks

There are several reasons why you might be interested in writing your views the hard way:

* __Performance__: *Templates the Hard Way* uses direct imperative code, so there are no unnecessary operations performed. Whether a hot or cold path, using this technique ensures nearly the best possible performance you can get in JavaScript.
* __0 dependencies__: This technique uses no dependencies, so your code will *never* have to be upgraded. Have you ever used a library that released a breaking change that took you a day to upgrade? You'll never experience that problem again.
* __Portability__: Code written with simple imperative views is portable to any framework. That makes it perfect for low-level components that you might want to share with several framework communities. But I recommend using it on full apps as well.
* __Maintainability__: Despite the reputation of imperative code being difficult to maintain, views written with Templates the hard way are *extremely* maintainable. This is because they follow strict conventions (you'll learn these later). These conventions ensure you always know where to look in a view. Additionally it follows a *props down, events up* model that makes data sharing straight-forward.
* __Browser support__: Code written in this manner is supported by all browsers; full-stop. We do use events to make passing data back up the component tree and our examples use a newer, nicer API, to do that, but you can use an older technique (discussed in the compatibility section) to get you back to at least IE9. But if you want to go further back than that even, substitute passing functions as props instead of using events and you can use this technique in IE6 if you want. And it will be by far the most performant solution you'll find.
* __Easier to debug__: Using this approach stack traces become shallow (usually only a few function calls). This is because there are no layers between events and your code. Everything is your code, and as long as you name your functions, you'll get incredible stack traces that make it easy to trace where something goes wrong.

## The structure

Enough with the arguments for now, let's talk about the structure. A view component written with *Templates the Hard Way* looks like the following:

```js
const template = document.createElement('template');
template.innerHTML = `
  <div>Hello <span id="name">world</span>!</div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init() {
  /* DOM variables */
  let frag = clone();

  /* More stuff here*/

  function update() {
    return frag;
  }

  return update;
}

export default init;
```

This is the basic structure. More details are to follow. First let's concentrate on the module's parts and exports.

### template

```js
const template = document.createElement('template');
template.innerHTML = `
  <div>Hello <span id="name">world</span>!</div>
`;
```

This is the view's template. It's a [<template>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) element. Setting its `innerHTML` causes the browser to parse and save this HTML as the template's `template.content` property. This is a [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) that can be quickly cloned.

Notice that there are no interpolations with data. This is because, as of now, the browser doesn't support any such API. In the spirit of *The Hard Way* we use only what the browser gives us. 

So instead of interpolating, we add elements at points within the HTML that we will want to update later. In this example we have `<span id="name">world</span>`. This gives us something that we can query and update later (via `frag.querySelector('#name')` for example).

> *Note*: ids are global to the document. If the component you are working on is likely to be used multiple times in an application (such as a list item) you should probably not use ids, but rather a class name or possibly a [data attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes).

### clone()

This function is purely for convenience.


## Compatibility

__TODO__