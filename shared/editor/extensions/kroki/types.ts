export type DiagramType =
  | "actdiag"
  | "blockdiag"
  | "bpmn"
  | "bytefield"
  | "c4plantuml"
  | "d2"
  | "dbml"
  | "ditaa"
  | "erd"
  | "excalidraw"
  | "graphviz"
  | "mermaid"
  | "nomnoml"
  | "nwdiag"
  | "packetdiag"
  | "pikchr"
  | "plantuml"
  | "rackdiag"
  | "seqdiag"
  | "svgbob"
  | "symbolator"
  | "umlet"
  | "vega"
  | "vegalite"
  | "wavedrom"
  | "structurizr"
  | "diagramsnet";

interface BaseOptions {
  scale?: number;
  no_transparency?: boolean;
  no_links?: boolean;
}

// Interface for diagram options that include font settings
interface FontOptions extends BaseOptions {
  font?: string;
  font_size?: number;
  font_path?: string;
}

// Specific diagram options extending the base or font options
export interface NwdiagOptions extends FontOptions {}
export interface ActdiagOptions extends FontOptions {}
export interface BlockdiagOptions extends FontOptions {}
export interface C4Options  extends FontOptions  {
  theme?: string;
}

export interface DitaaOptions extends BaseOptions {}

export interface ErdOptions extends FontOptions {}

export interface GraphvizOptions extends FontOptions  {
  engine?: string;
}

export interface MermaidOptions extends FontOptions  {
  theme?: string;
}

export interface NomnomlOptions extends FontOptions {}


export interface PlantumlOptions extends BaseOptions {}
export interface SeqdiagOptions extends FontOptions {}
export interface StructurizrOptions {
  output?: 'diagram' | 'legend';
  'view-key'?: string;
}
export interface SvgbobOptions extends FontOptions {}
export interface UmletOptions extends BaseOptions {}
export interface WavedromOptions extends BaseOptions {}

export type DiagramOptions<T extends DiagramType> = 
    T extends "actdiag" ? ActdiagOptions : 
    T extends "blockdiag"  ? BlockdiagOptions : 
    T extends "c4"  ? C4Options : 
    T extends "ditaa"  ? DitaaOptions : 
    T extends "erd"  ? ErdOptions : 
    T extends "graphviz"  ? GraphvizOptions :
    T extends "mermaid"  ? MermaidOptions : 
    T extends "nomnoml"  ? NomnomlOptions : 
    T extends "nwdiag"  ? NwdiagOptions : 
    T extends "plantuml"  ? PlantumlOptions : 
    T extends "seqdiag"  ? SeqdiagOptions : 
    T extends "structurizr"  ? StructurizrOptions : 
    T extends "svgbob"  ? SvgbobOptions : 
    T extends "umlet"  ? UmletOptions : 
    T extends "wavedrom"  ? WavedromOptions : 
    never;
