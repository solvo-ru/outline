import debounce from "lodash/debounce";
import last from "lodash/last";
import sortBy from "lodash/sortBy";
import PlantUmlEncoder from "plantuml-encoder";
import { Node } from "prosemirror-model";
import {
  Plugin,
  PluginKey,
  TextSelection,
  Transaction,
} from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { v4 as uuidv4 } from "uuid";
import { isCode } from "../lib/isCode";
import { isRemoteTransaction } from "../lib/multiplayer";
import { findBlockNodes, NodeWithPos } from "../queries/findChildren";

type DiagramState = {
  decorationSet: DecorationSet;
  isDark: boolean;
  initialized: boolean;
};

class Cache {
  static get(key: string) {
    return this.data.get(key);
  }

  static set(key: string, value: string) {
    this.data.set(key, value);

    if (this.data.size > this.maxSize) {
      this.data.delete(this.data.keys().next().value);
    }
  }

  private static maxSize = 20;
  private static data: Map<string, string> = new Map();
}

type RendererFunc = (
  block: { node: Node; pos: number },
  isDark: boolean
) => void;

async function fetchSVGContent(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}

class PlantUMLRenderer {
  readonly diagramId: string;
  readonly element: HTMLElement;
  readonly elementId: string;

  constructor() {
    this.diagramId = uuidv4();
    this.elementId = `plantuml-diagram-wrapper-${this.diagramId}`;
    this.element =
      document.getElementById(this.elementId) || document.createElement("div");
    this.element.id = this.elementId;
    this.element.classList.add("plantuml-diagram-wrapper");
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
      const zippedCode = PlantUmlEncoder.encode(text);
      const plantServerUrl = `https://www.plantuml.com/plantuml/svg/${zippedCode}`;
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

  get render(): RendererFunc {
    if (this._rendererFunc) {
      return this._rendererFunc;
    }
    this._rendererFunc = debounce<RendererFunc>(this.renderImmediately, 500);
    return this.renderImmediately;
  }

  private currentTextContent = "";
  private _rendererFunc?: RendererFunc;
}

function overlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): number {
  return Math.max(0, Math.min(end1, end2) - Math.max(start1, start2));
}

/*
  This code find the decoration that overlap the most with a given node.
  This will ensure we can find the best decoration that match the last change set
  See: https://github.com/outline/outline/pull/5852/files#r1334929120
*/
function findBestOverlapDecoration(
  decorations: Decoration[],
  block: NodeWithPos
): Decoration | undefined {
  if (decorations.length === 0) {
    return undefined;
  }
  return last(
    sortBy(decorations, (decoration) =>
      overlap(
        decoration.from,
        decoration.to,
        block.pos,
        block.pos + block.node.nodeSize
      )
    )
  );
}

function getNewState({
  doc,
  name,
  pluginState,
}: {
  doc: Node;
  name: string;
  pluginState: DiagramState;
}): DiagramState {
  const decorations: Decoration[] = [];

  // Find all blocks that represent PlantUML diagrams
  const blocks = findBlockNodes(doc).filter(
    (item) =>
      item.node.type.name === name && item.node.attrs.language === "plantuml"
  );

  blocks.forEach((block) => {
    const existingDecorations = pluginState.decorationSet.find(
      block.pos,
      block.pos + block.node.nodeSize,
      (spec) => !!spec.diagramId
    );

    const bestDecoration = findBestOverlapDecoration(
      existingDecorations,
      block
    );

    const renderer: PlantUMLRenderer =
      bestDecoration?.spec?.renderer ?? new PlantUMLRenderer();

    const diagramDecoration = Decoration.widget(
      block.pos + block.node.nodeSize,
      () => {
        void renderer.render(block, pluginState.isDark);
        return renderer.element;
      },
      {
        diagramId: renderer.diagramId,
        renderer,
        side: -10,
      }
    );

    const diagramIdDecoration = Decoration.node(
      block.pos,
      block.pos + block.node.nodeSize,
      {},
      {
        diagramId: renderer.diagramId,
        renderer,
      }
    );

    decorations.push(diagramDecoration);
    decorations.push(diagramIdDecoration);
  });

  return {
    decorationSet: DecorationSet.create(doc, decorations),
    isDark: pluginState.isDark,
    initialized: true,
  };
}

export default function PlantUML({
  name,
  isDark,
}: {
  name: string;
  isDark: boolean;
}) {
  return new Plugin({
    key: new PluginKey("plantuml"),
    state: {
      init: (_, { doc }) => {
        const pluginState: DiagramState = {
          decorationSet: DecorationSet.create(doc, []),
          isDark,
          initialized: false,
        };
        return getNewState({
          doc,
          name,
          pluginState,
        });
      },
      apply: (
        transaction: Transaction,
        pluginState: DiagramState,
        oldState,
        state
      ) => {
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged =
          transaction.docChanged && [nodeName, previousNodeName].includes(name);
        const themeMeta = transaction.getMeta("theme");
        const plantumlMeta = transaction.getMeta("plantuml");
        const themeToggled = themeMeta?.isDark !== undefined;

        if (themeToggled) {
          pluginState.isDark = themeMeta.isDark;
        }

        if (
          plantumlMeta ||
          themeToggled ||
          codeBlockChanged ||
          isRemoteTransaction(transaction)
        ) {
          return getNewState({
            doc: transaction.doc,
            name,
            pluginState,
          });
        }

        return {
          decorationSet: pluginState.decorationSet.map(
            transaction.mapping,
            transaction.doc
          ),
          isDark: pluginState.isDark,
        };
      },
    },
    view: (view) => {
      view.dispatch(view.state.tr.setMeta("plantuml", { loaded: true }));
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decorationSet;
      },
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target as HTMLElement;
          const diagram = target?.closest(".plantuml-diagram-wrapper");
          const codeBlock = diagram?.previousElementSibling;

          if (!codeBlock) {
            return false;
          }

          const pos = view.posAtDOM(codeBlock, 0);
          if (!pos) {
            return false;
          }

          // select node
          if (diagram && event.detail === 1) {
            view.dispatch(
              view.state.tr
                .setSelection(TextSelection.near(view.state.doc.resolve(pos)))
                .scrollIntoView()
            );
            return true;
          }

          return false;
        },
        keydown: (view, event) => {
          switch (event.key) {
            case "ArrowDown": {
              const { selection } = view.state;
              const $pos = view.state.doc.resolve(
                Math.min(selection.from + 1, view.state.doc.nodeSize)
              );
              const nextBlock = $pos.nodeAfter;

              if (
                nextBlock &&
                isCode(nextBlock) &&
                nextBlock.attrs.language === "plantuml"
              ) {
                view.dispatch(
                  view.state.tr
                    .setSelection(
                      TextSelection.near(
                        view.state.doc.resolve(selection.to + 1)
                      )
                    )
                    .scrollIntoView()
                );
                event.preventDefault();
                return true;
              }
              return false;
            }
            case "ArrowUp": {
              const { selection } = view.state;
              const $pos = view.state.doc.resolve(
                Math.max(0, selection.from - 1)
              );
              const prevBlock = $pos.nodeBefore;

              if (
                prevBlock &&
                isCode(prevBlock) &&
                prevBlock.attrs.language === "plantuml"
              ) {
                view.dispatch(
                  view.state.tr
                    .setSelection(
                      TextSelection.near(
                        view.state.doc.resolve(selection.from - 2)
                      )
                    )
                    .scrollIntoView()
                );
                event.preventDefault();
                return true;
              }
              return false;
            }
          }

          return false;
        },
      },
    },
  });
}
