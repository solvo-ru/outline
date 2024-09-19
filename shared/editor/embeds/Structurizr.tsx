import * as React from "react";
import env from "../../env";
import {sanitizeUrl} from "../../utils/urls";
import  Frame, {Props as FrameProps}  from "../components/Frame";
import Svg from "../components/Svg";
import { EmbedProps as Props } from ".";
import {Optional} from "utility-types";
import styled from "styled-components";




function Structurizr({ matches, ...props }: Props) {
  const p = matches[1];
  const n = matches[2];
  const workspaceId = matches[4];
  const viewKey = matches[5];
  const height = matches[6] ;

  let params: FrameProps = {border: true, height: height,title: props.embed.title, icon: props.embed.icon, ...props};

  if (env.STRUCTURIZR_S3_URL) {
    const canonicalUrl = sanitizeUrl(`${env.URL}/structurizr.view?workspaceId=${workspaceId}&viewKey=${viewKey}`)??'';
    params = {...params, canonicalUrl};

  } else {
    const id = `embed-${Math.floor(1000000 * Math.random())}`;
    const src = sanitizeUrl(`${p}${n}/embed/${workspaceId}?diagram=${viewKey}&diagramSelector=false&iframe=${id}`)??'';
    const scriptSrc = sanitizeUrl(`${p}${n}/static/js/structurizr-embed.js`);
    const StyledScript = <script
      type="text/javascript"
      src={scriptSrc}/>;
    params = {...params, src, id, children: StyledScript};
    return (
      <>
        <Frame
          {...props}
          src={normalizedUrl}
          width="100%"
          height={`${h}px`}
          allowFullscreen
          id={id}
          // extraScript={StyledScript}
        >
          {StyledScript}
        </Frame>
        {StyledScript}
      </>
    );
  }
  return (<Frame
      {...props}
      src={normalizedUrl}
      width="100%"
      height={`${h}px`}
      allowFullscreen
      id={id}
      // extraScript={StyledScript}
  >
    {StyledScript}
  </Frame>)
}

const StructurizrFrame({...props}: Props): {

}

export default Structurizr;
