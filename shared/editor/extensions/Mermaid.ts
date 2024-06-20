import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import SuperFence, {
  Cache,
  Renderer,
  SuperFenceState,
} from "@shared/editor/extensions/SuperFence";

const MERMAID = "mermaid";

class MermaidRenderer extends Renderer{

  constructor() {
    super(MERMAID);
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
      const { default: mermaid } = await import(MERMAID);
      mermaid.mermaidAPI.setConfig({
        theme: isDark ? "dark" : "default",
      });
      const { svg, bindFunctions } = await mermaid.render(
        "mermaid-" + this.diagramId,
        text
      );
      this.currentTextContent = text;
      if (text) {
        Cache.set(cacheKey, svg);
      }
      element.classList.remove("parse-error", "empty");
      element.innerHTML = svg;
      bindFunctions?.(element);
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

export default function Mermaid({ name, isDark }: { name: string, isDark: boolean }): Plugin<SuperFenceState | { decorationSet: DecorationSet, isDark: boolean }> {
  return SuperFence({ name, isDark, langRenderer: new MermaidRenderer() });
}