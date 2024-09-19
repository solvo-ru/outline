import React, { useEffect } from 'react';
import env from "../../env";
import {sanitizeUrl} from "../../utils/urls";
import  Frame  from "../components/Frame";
import { EmbedProps as Props } from ".";

function Structurizr({ matches, ...props }: Props) {
  const structurizrDomain = matches[1]+matches[2];
  const canonicalUrl = matches[0];
  const workspaceId = matches[4];
  const viewKey = matches[5];
  const height = matches[6] ? matches[6]+"px" : "400px";
  const parser = new DOMParser();

  if (env.STRUCTURIZR_S3_URL) {
    const svgEndpoint = `${env.URL}/api/structurizr.view`;

    useEffect(() => {
        const fetchSvg = async () => {
            let svgElement = document.createElement('svg');
            const response = await fetch(svgEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({workspaceId, viewKey})
            });
            const svgDoc = parser.parseFromString(await response.text(), 'image/svg+xml');
            svgElement = svgDoc.documentElement;
            document.body.appendChild(svgElement);
            return () => {
                document.body.removeChild(svgElement);
            };
        };
        fetchSvg().catch(console.error);
      }, [svgEndpoint, workspaceId, viewKey]);

      return (
        <Frame
            {...props}
            height={height}
            border
            canonicalUrl={canonicalUrl}
        />
    );
  }
    const id = `embed-${Math.floor(1000000 * Math.random())}`;
    const src = `${structurizrDomain}/embed/${workspaceId}?diagram=${viewKey}&diagramSelector=false&iframe=${id}`;
    let scriptElement = document.createElement('script');
    scriptElement.src = sanitizeUrl(`${structurizrDomain}/static/js/structurizr-embed.js`) ?? "";
    scriptElement.type = "text/javascript" ;


    return (
        <>
        <Frame
          {...props}
          src={src}
          height={height}
          allowFullscreen
          id={id}
          canonicalUrl={canonicalUrl}
        />
            {scriptElement}
        </>
    );

}

export default Structurizr;
