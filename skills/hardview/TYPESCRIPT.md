# TypeScript Usage

When using TypeScript with the hardview pattern, add types minimally and let inference handle most things. Only add explicit types where TypeScript can't infer correctly.

## What to type explicitly

**Props interface** - Define an interface for the data parameter:

```typescript
interface CounterProps {
  count?: number;
}
```

**DOM query results** - querySelector returns `Element | null`, so cast to the specific element type:

```typescript
let countNode = el.querySelector('.count') as HTMLSpanElement;
let buttonNode = el.querySelector('.increment') as HTMLButtonElement;
```

**Clone return** - `firstElementChild` can be null, so assert:

```typescript
function clone() {
  return document.importNode(template.content, true).firstElementChild as HTMLElement;
}
```

## What to let TypeScript infer

- Return type of `init()` - inferred from the function body
- Return type of `update()` - inferred as the element type
- State variable types (usually) - inferred from initial assignment
- Internal function signatures - inferred from usage

## Export the view type

Use `ReturnType` to derive the view type from the implementation, then export it for consumers:

```typescript
export type CounterView = ReturnType<typeof init>;
```

This keeps the type in sync with the implementation automatically.
