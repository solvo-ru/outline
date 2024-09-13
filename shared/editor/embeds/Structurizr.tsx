import * as React from "react";
import styled from "styled-components";
import env from "../../env";
import {diagramToSvg, encodeDiagram, fetchStructurizrWorkspace} from "../../utils/kroki"
import Frame from "../components/Frame";
import { EmbedProps as Props } from ".";


async function Structurizr({matches, ...props}: Props) {
  const id = `embed-${Math.floor(1000000 * Math.random())}`;
  const p = matches[1];
  const n = matches[2];
  const w = matches[4];
  const d = matches[5];
  const h = matches[6] || "400";
  if (env.STRUCTURIZR_S3_URL) {
    const workspace = fetchStructurizrWorkspace(w);
    const encodedWorkspace = encodeDiagram(await workspace);
    const svgText = await diagramToSvg('structurizr', encodedWorkspace)
    return styled.svg.bind(svgText)

  } else {
    const normalizedUrl = `${p}${n}/embed/${w}?diagram=${d}&diagramSelector=false&iframe=${id}`;
    const scriptSrc = `${p}${n}/static/js/structurizr-embed.js`;

    const StyledScript = <script
        type="text/javascript"
        src={scriptSrc}
    />
    return (

        <Frame
            {...props}
            src={normalizedUrl}
            width="100%"
            height={`${h}px`}
            allowFullscreen
            id={id}
            title="Structurizr"
            extraScript={StyledScript}
        >
          {StyledScript}
</Frame>
    )
  }
}

export default Structurizr;
