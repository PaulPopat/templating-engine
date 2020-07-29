import { JSDOM } from "jsdom";
import { IsValidTag } from "../utils/html";

function* GetAllElements(
  collection: HTMLCollection
): Generator<Element, void, unknown> {
  for (let i = 0; i < collection.length; i++) {
    const e = collection.item(i);
    if (!e) {
      continue;
    }

    yield e;
    yield* GetAllElements(e.children);
  }
}

export function AddCssSpecifier(tpe: string, specifier: string) {
  const dom = new JSDOM(tpe);
  for (const element of GetAllElements(dom.window.document.body.children)) {
    if (!IsValidTag(element.tagName)) {
      continue;
    }

    element.setAttribute("data-specifier", specifier);
  }

  return dom.window.document.body.innerHTML;
}
