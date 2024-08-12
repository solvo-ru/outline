import PlantUmlEncoder from "plantuml-encoder";
import { Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import env from "../../env";
import SuperFence, { Cache, Renderer, SuperFenceState } from "./SuperFence";

const PLANT_UML = "plantuml";

async function fetchSVGContent(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

class PlantUMLRenderer extends Renderer {
  constructor() {
    super(PLANT_UML);
  }

  protected async renderContent(
      text: string,
      isDark: boolean
  ): Promise<{
    svg: string;
    bindFunctions?: (element: HTMLElement) => void;
  }> {
    const zippedCode = PlantUmlEncoder.encode(text);
    const plantServerUrl = `${env.PLANTUML_SERVER_URL}/svg/${zippedCode}`;
    const svgContent = await fetchSVGContent(plantServerUrl);
    return { svg: svgContent };
  }
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
