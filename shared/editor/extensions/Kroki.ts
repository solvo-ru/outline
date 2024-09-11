import pako from "pako";
import env from "@server/env";

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

class KrokiService {
    private krokiServerUrl: string;
    private structurizrS3Url: string;
    private structurizrS3AccessKey: string | undefined;
    private structurizrS3SecretKey: string | undefined;

    constructor() {
        this.krokiServerUrl = env.KROKI_SERVER_URL;
        this.structurizrS3Url = env.STRUCTURIZR_S3_URL;
        this.structurizrS3AccessKey = env.STRUCTURIZR_S3_ACCESS_KEY;
        this.structurizrS3SecretKey = env.STRUCTURIZR_S3_SECRET_KEY;
    }

    public encodeDiagram(diagramText: string): string {
        const data = Buffer.from(diagramText, 'utf8')
        const compressed = pako.deflate(data, { level: 9 })
        return Buffer.from(compressed)
            .toString('base64')
            .replace(/\+/g, '-').replace(/\//g, '_')
    }

    public async fetchStructurizrWorkspace(workspaceId: string): Promise<Response> {
        const filePath = `workspaces/${workspaceId}/workspace.json`;
        return fetch(`${this.structurizrS3Url}/${filePath}`, {
            headers: {
                Authorization: `AWS ${this.structurizrS3AccessKey}:${this.structurizrS3SecretKey}`,
            },
        });
    }

    public async diagramToSvg(diagramType: DiagramType, diagramText: string): Promise<string> {
        const response = await fetch(this.krokiServerUrl, {
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
}

export default KrokiService;