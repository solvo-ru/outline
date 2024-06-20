import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import Stoplight from "./Stoplight";
import SuperFence, { Cache, Renderer, SuperFenceState } from "./SuperFence";

const OPENAPI = "openapi";


class OpenAPIRenderer extends Renderer {
  constructor() {
    super(OPENAPI);
  }

  renderImmediately = async (
    block: { node: Node; pos: number },
    isDark: boolean
  ) => {
    const element = this.element;
    const text = block.node.textContent;

    const cacheKey = `${isDark ? "dark" : "light"}-${text}`;
    const cache = Cache.get(cacheKey);
    if (cache) {
      element.classList.remove("parse-error", "empty");
      element.innerHTML = cache;
      return;
    }

    try {
      Stoplight(element, text);
      this.currentTextContent = text;
      if (text) {
        Cache.set(cacheKey, element.innerHTML);
      }
      element.classList.remove("parse-error", "empty");
    } catch (error) {
      const isEmpty = block.node.textContent.trim().length === 0;

      if (isEmpty) {
        element.innerText = "Empty diagram";
        element.classList.add("empty");
      } else {
        element.innerText = error;
        element.classList.add("parse-error");
      }
    }
  };
}

export default function OpenAPI({
  name,
  isDark,
}: {
  name: string;
  isDark: boolean;
}): Plugin<
  SuperFenceState | { decorationSet: DecorationSet; isDark: boolean }
> {
  return SuperFence({ name, isDark, langRenderer: new OpenAPIRenderer() });
}
