import debounce from "lodash/debounce";
import last from "lodash/last";
import sortBy from "lodash/sortBy";
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

export type SuperFenceState = {
  decorationSet: DecorationSet;
  isDark: boolean;
  initialized: boolean;
};

export class Cache {
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

export abstract class Renderer {
  readonly diagramId: string;
  readonly element: HTMLElement;
  readonly elementId: string;
  readonly language: string;

  protected constructor(language: string) {
    this.diagramId = uuidv4();
    this.language = language;
    this.elementId = `${language}-wrapper-${this.diagramId}`;
    this.element =
      document.getElementById(this.elementId) || document.createElement("div");
    this.element.id = this.elementId;
    this.element.classList.add(language);
  }

  protected abstract renderContent(
    text: string,
    isDark: boolean
  ): Promise<{
    svg: string;
    bindFunctions?: (element: HTMLElement) => void;
  }>;

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
      const result = await this.renderContent(text, isDark);
      this.currentTextContent = text;
      if (text) {
        Cache.set(cacheKey, result.svg);
      }
      element.classList.remove("parse-error", "empty");
      element.innerHTML = result.svg;
      result.bindFunctions?.(element);
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

  protected currentTextContent = "";
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

export function getNewState({
  doc,
  name,
  pluginState,
  langRenderer,
}: {
  doc: Node;
  name: string;
  pluginState: SuperFenceState;
  langRenderer: Renderer;
}): SuperFenceState {
  const decorations: Decoration[] = [];

  // Find all blocks that represent SuperFences
  const blocks = findBlockNodes(doc).filter(
    (item) =>
      item.node.type.name === name &&
      item.node.attrs.language === langRenderer.language
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

    const renderer: Renderer = bestDecoration?.spec?.renderer ?? langRenderer;

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

export default function SuperFence({
  name,
  isDark,
  langRenderer,
}: {
  name: string;
  isDark: boolean;
  langRenderer: Renderer;
}) {
  return new Plugin({
    key: new PluginKey(langRenderer.language),
    state: {
      init: (_, { doc }) => {
        const pluginState: SuperFenceState = {
          decorationSet: DecorationSet.create(doc, []),
          isDark,
          initialized: false,
        };
        return getNewState({
          doc,
          name,
          pluginState,
          langRenderer,
        });
      },
      apply: (
        transaction: Transaction,
        pluginState: SuperFenceState,
        oldState,
        state
      ) => {
        const nodeName = state.selection.$head.parent.type.name;
        const previousNodeName = oldState.selection.$head.parent.type.name;
        const codeBlockChanged =
          transaction.docChanged && [nodeName, previousNodeName].includes(name);
        const themeMeta = transaction.getMeta("theme");
        const superFenceMeta = transaction.getMeta(langRenderer.language);
        const themeToggled = themeMeta?.isDark !== undefined;

        if (themeToggled) {
          pluginState.isDark = themeMeta.isDark;
        }

        if (
          superFenceMeta ||
          themeToggled ||
          codeBlockChanged ||
          isRemoteTransaction(transaction)
        ) {
          return getNewState({
            doc: transaction.doc,
            name,
            pluginState,
            langRenderer,
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
      view.dispatch(
        view.state.tr.setMeta(langRenderer.language, { loaded: true })
      );
      return {};
    },
    props: {
      decorations(state) {
        return this.getState(state)?.decorationSet;
      },
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target as HTMLElement;
          const diagram = target?.closest(`.${langRenderer.language}-wrapper`);
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
                nextBlock.attrs.language === langRenderer.language
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
                prevBlock.attrs.language === langRenderer.language
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
