import * as React from "react";
import env from "../../env";
import Frame from "../components/Frame";
import StructurizrSVG from "../components/StructurizrSVG";
import { EmbedProps as Props } from ".";

function Structurizr({ matches, ...props }: Props) {
  const p = matches[1];
  const n = matches[2];
  const workspaceId = matches[4];
  const viewKey = matches[5];
  const h = matches[6] || "400";

  if (env.STRUCTURIZR_S3_URL) {
    return <StructurizrSVG
        {...props}
        workspaceId={workspaceId}
        viewKey={viewKey}
    />;
  } else {
    const id = `embed-${Math.floor(1000000 * Math.random())}`;
    const normalizedUrl = `${p}${n}/embed/${workspaceId}?diagram=${viewKey}&diagramSelector=false&iframe=${id}`;
    const scriptSrc = `${p}${n}/static/js/structurizr-embed.js`;
    const StyledScript = <script type="text/javascript" src={scriptSrc} />;
    return (
      <>
        <Frame
          {...props}
          src={normalizedUrl}
          width="100%"
          height={`${h}px`}
          allowFullscreen
          id={id}
          title="Structurizr"
          // extraScript={StyledScript}
        >
          {StyledScript}
        </Frame>
        {StyledScript}
      </>
    );
  }
}

export default Structurizr;
