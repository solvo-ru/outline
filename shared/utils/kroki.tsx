import pako from "pako";
import env from "../env";

type DiagramType =
    | 'actdiag'
    | 'blockdiag'
    | 'bpmn'
    | 'bytefield'
    | 'c4plantuml'
    | 'd2'
    | 'dbml'
    | 'ditaa'
    | 'erd'
    | 'excalidraw'
    | 'graphviz'
    | 'mermaid'
    | 'nomnoml'
    | 'nwdiag'
    | 'packetdiag'
    | 'pikchr'
    | 'plantuml'
    | 'rackdiag'
    | 'seqdiag'
    | 'svgbob'
    | 'symbolator'
    | 'umlet'
    | 'vega'
    | 'vegalite'
    | 'wavedrom'
    | 'structurizr'
    | 'diagramsnet';

export function encodeDiagram(diagramText: string) {
    const data = Buffer.from(diagramText, 'utf8')
    const compressed = pako.deflate(data, { level: 9 })
    return Buffer.from(compressed)
        .toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_')

}

export async function fetchStructurizrWorkspace(workspaceId: string) {
    const filePath = `workspaces/${workspaceId}/workspace.json`;
    const response = await fetch(`${env.STRUCTURIZR_S3_URL}/${filePath}`, {
        headers: {
            Authorization: `AWS ${env.STRUCTURIZR_S3_ACCESS_KEY}:${env.STRUCTURIZR_S3_SECRET_KEY}`,
        },
    });
    return await response.text();
}

export async function diagramToSvg(diagramType: DiagramType, diagramText: string) {
    const response = await fetch(env.KROKI_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            diagram_source: diagramText,
            diagram_type: diagramType,
            output_format: "svg",
        }),
    });

    return await response.text();

}