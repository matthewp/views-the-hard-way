# Templates the Hard Way

Learn how to build views in plain JavaScript in a way that is maintainable, performant, and fun. *Templates the Hard Way* is inspired by such books as [Learn C the Hard Way](https://learncodethehardway.org/c/).

## What is this?

Templates the Hard Way is a pattern for writing JavaScript views. It is meant to serve as an alternative to using frameworks and libraries such as [React](https://reactjs.org), [Vue](https://vuejs.org/) and [lit-html](https://lit-html.polymer-project.org/).

It is a __pattern__, not a library. This document explains how to write views in such a way as to avoid the [spaghetti code](https://en.wikipedia.org/wiki/Spaghetti_code) problems that commonly occur when writing low-level imperative code.

We call this technique *the hard way* because it askews abstractions in favor of directness.

### Advantages over frameworks

There are several reasons why you might be interested in writing your views the hard way:

* __Performance__: Templates the hard way uses direct imperative code, so there are no unnecessary operations performed. Whether a hot or cold path, using this technique ensures nearly the best possible performance you can get in JavaScript.
* __No dependencies__: This technique uses no dependencies, so your code will *never* have to be upgraded. Have you ever used a library that released a breaking change that took you a day to upgrade? You'll never experience that problem again.
* __Portability__: Code written with simple imperative views is portable to any framework. That makes it perfect for low-level components that you might want to share with several framework communities. But I recommend using it on full apps as well.
* __Maintainability__: Despite the reputation of imperative code being difficult to maintain, views written with Templates the hard way are *extremely* maintainable. This is because they follow strict conventions (you'll learn these later). These conventions ensure you always know where to look in a view. Additionally it follows a *props down, events up* formula that makes data sharing straight-forward.