import { Plugin } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
import SuperFence, { Renderer, SuperFenceState } from "./SuperFence";

const MERMAID = "mermaid";

class MermaidRenderer extends Renderer {
  constructor() {
    super(MERMAID);
  }

  protected async renderContent(
    text: string,
    isDark: boolean
  ): Promise<{
    svg: string;
    bindFunctions?: (element: HTMLElement) => void;
  }> {
    const { default: mermaid } = await import("mermaid");
    mermaid.mermaidAPI.setConfig({
      theme: isDark ? "dark" : "default",
    });
    return await mermaid.render("mermaid-" + this.diagramId, text);
  }
}

export default function Mermaid({
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
  return SuperFence({ name, isDark, langRenderer: new MermaidRenderer() });
}
