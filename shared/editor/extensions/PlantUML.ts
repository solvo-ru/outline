import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import SuperFence, { Cache, Renderer, SuperFenceState } from "./SuperFence";
import {diagramToSvg, encodeDiagram} from "./kroki/utils";

const PLANT_UML = "plantuml";


class PlantUMLRenderer extends Renderer {
  constructor() {
    super(PLANT_UML);
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
      const encodedText = encodeDiagram(text);
      const svgContent =await diagramToSvg(PLANT_UML, encodedText)
      this.currentTextContent = text;
      if (text) {
        Cache.set(cacheKey, svgContent);
      }
      element.classList.remove("parse-error", "empty");
      element.innerHTML = svgContent;
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

export default function PlantUML({
  name,
  isDark,
}: {
  name: string;
  isDark: boolean;
}): Plugin<
  | SuperFenceState
  | {
      decorationSet: DecorationSet;
      isDark: boolean;
    }
> {
  return SuperFence({ name, isDark, langRenderer: new PlantUMLRenderer() });
}
