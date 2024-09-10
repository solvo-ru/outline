import pako from "pako";
import {Node} from "prosemirror-model";
import {Plugin} from "prosemirror-state";
import {DecorationSet} from "prosemirror-view";
import env from "../../env";
import SuperFence, {Cache, Renderer, SuperFenceState} from "./SuperFence";

const PLANT_UML = "plantuml";

async function fetchSVGContent(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

function encodeText(text: string) {
  const data = Buffer.from(text, 'utf8')
  const compressed = pako.deflate(data, { level: 9 })
  return Buffer.from(compressed)
      .toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_')
}

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
      const zippedCode = encodeText(text);
      const plantServerUrl = `${env.PLANTUML_SERVER_URL}/svg/${zippedCode}`;
      const svgContent = await fetchSVGContent(plantServerUrl);
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
