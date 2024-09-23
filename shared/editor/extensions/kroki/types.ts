export const krokiDiagrams: Record<string, string> = {
  actdiag: "Actdiag Diagram",
  blockdiag: "Blockdiag Diagram",
  bpmn: "BPMN Diagram",
  bytefield: "Bytefield Diagram",
  c4plantuml: "C4PlantUML Diagram",
  d2: "D2 Diagram",
  dbml: "DBML Diagram",
  ditaa: "Ditaa Diagram",
  erd: "ERD Diagram",
  excalidraw: "Excalidraw Diagram",
  graphviz: "Graphviz Diagram",
  mermaid: "Mermaid Diagram",
  nomnoml: "Nomnoml Diagram",
  nwdiag: "Nwdiag Diagram",
  packetdiag: "Packetdiag Diagram",
  pikchr: "Pikchr Diagram",
  plantuml: "PlantUML Diagram",
  rackdiag: "Rackdiag Diagram",
  seqdiag: "Seqdiag Diagram",
  svgbob: "Svgbob Diagram",
  symbolator: "Symbolator Diagram",
  umlet: "Umlet Diagram",
  vega: "Vega Diagram",
  vegalite: "Vegalite Diagram",
  wavedrom: "Wavedrom Diagram",
  structurizr: "Structurizr Diagram",
  diagramsnet: "Diagrams.net Diagram",
};

export type DiagramType = keyof typeof krokiDiagrams;

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
