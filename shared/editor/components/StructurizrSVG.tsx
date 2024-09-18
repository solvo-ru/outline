import React, { useState, useEffect } from 'react';
import {diagramToSvg} from "../extensions/kroki/utils";
import {client} from "~/utils/ApiClient";
import {observable} from "mobx";

interface StructurizrSVGProps {
    workspaceId: string;
    viewKey: string;
}
type PropsWithRef = StructurizrSVGProps & {
    forwardedRef: React.Ref<HTMLIFrameElement>;
};

@observable
class StructurizrSVG extends React.Component<PropsWithRef> {
  render() {
    let { workspaceId, viewKey } = this.props;
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      const fetchSVG = async () => {
        try {
          const response = await client.get("/structurizr.workspace", {
            id: workspaceId,
          });
          if (!response.ok) {
            throw new Error(
              `Ошибка загрузки workspace.json: ${response.statusText}`
            );
          }

          const workspace = await response.text();
          //const encodedWorkspace = encodeDiagram( workspace);
          const svgText = await diagramToSvg<"structurizr">(
            "structurizr",
            workspace,
            {
              "view-key": viewKey,
            }
          );
          setSvgContent(svgText);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchSVG();
    }, [workspaceId, viewKey]);

    if (error) {
      return <div>Ошибка загрузки SVG: {error}</div>;
    }

    if (!svgContent) {
      return <div>Загрузка...</div>;
    }

    // Отображаем SVG напрямую
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
  }
}
export default React.forwardRef<HTMLIFrameElement, StructurizrSVGProps>((props, ref) => (
    <StructurizrSVG {...props} forwardedRef={ref} />
));