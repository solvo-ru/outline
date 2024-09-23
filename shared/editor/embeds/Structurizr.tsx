import React, { useEffect, useRef } from 'react';
import {sanitizeUrl} from "../../utils/urls";
import  Frame  from "../components/Frame";
import { EmbedProps as Props } from ".";

function Structurizr({ matches, ...props }: Props) {
  const structurizrDomain = matches[1]+matches[2];
  const canonicalUrl = matches[0];
  const workspaceId = matches[4];
  const viewKey = matches[5];
  const height = matches[6] ? matches[6]+"px" : "400px";

    const id = `embed-${Math.floor(1000000 * Math.random())}`;
    const src = `${structurizrDomain}/embed/${workspaceId}?diagram=${viewKey}&diagramSelector=false&iframe=${id}`;
    const scriptUrl = sanitizeUrl(`${structurizrDomain}/static/js/structurizr-embed.js`) ?? "";
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    scriptElement.type = "text/javascript";
    const scriptElementRef = useRef(scriptElement);
    scriptElementRef.current=scriptElement;

    useEffect(() => {

        document.body.appendChild(scriptElement);
        return () => {
            document.body.removeChild(scriptElement);
        };
    }, [scriptUrl]);

    return (
            <Frame
                {...props}
                src={src}
                height={height}
                allowFullscreen={true}
                id={id}
                canonicalUrl={canonicalUrl}
            />
    );
}

export default Structurizr;
