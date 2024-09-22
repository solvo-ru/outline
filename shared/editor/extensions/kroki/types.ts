export type DiagramType =
    | "actdiag" | "blockdiag" | "bpmn" | "bytefield" | "c4plantuml" | "d2"
    | "dbml" | "ditaa" | "erd" | "excalidraw" | "graphviz" | "mermaid"
    | "nomnoml" | "nwdiag" | "packetdiag" | "pikchr" | "plantuml" | "rackdiag"
    | "seqdiag" | "svgbob" | "symbolator" | "umlet" | "vega" | "vegalite"
    | "wavedrom" | "structurizr" | "diagramsnet";

interface BaseOptions {
  scale?: number;
  no_transparency?: boolean;
  no_links?: boolean;
}

interface FontOptions extends BaseOptions {
  font?: string;
  font_size?: number;
  font_path?: string;
}

interface NwdiagOptions extends FontOptions {}
interface ActdiagOptions extends FontOptions {}
interface BlockdiagOptions extends FontOptions {}
interface C4Options extends FontOptions {
  theme?: string;
}
interface DitaaOptions extends BaseOptions {}
interface ErdOptions extends FontOptions {}
interface GraphvizOptions extends FontOptions {
  engine?: string;
}
interface MermaidOptions extends FontOptions {
  theme?: string;
}
interface StructurizrOptions {
  output?: 'diagram' | 'legend';
  'view-key'?: string;
}

type DiagramOptionsMap = {
  actdiag: ActdiagOptions;
  blockdiag: BlockdiagOptions;
  c4plantuml: C4Options;
  ditaa: DitaaOptions;
  erd: ErdOptions;
  graphviz: GraphvizOptions;
  mermaid: MermaidOptions;
  structurizr: StructurizrOptions;
  // и так далее для остальных диаграмм...
};

export type DiagramOptions<T extends DiagramType> = T extends keyof DiagramOptionsMap
    ? DiagramOptionsMap[T]
    : BaseOptions;
