import * as React from "react";
import Frame from "../components/Frame";
import { EmbedProps as Props } from ".";

function Structurizr({ matches, ...props }: Props) {
  const id = `embed-${Math.floor(1000000 * Math.random())}`;
  const w = matches[2];
  const d = matches[3];
  const h = matches[5] || "400";

  const normalizedUrl = `https://structurizr.moarse.ru/embed/${w}?diagram=${d}&diagramSelector=false&iframe=${id}`;

  return (
    <Frame
      {...props}
      src={normalizedUrl}
      width="100%"
      height={`${h}px`}
      allowFullscreen
      id={`${id}`}
      dangerouslySkipSanitizeSrc
    />
  );
}

export default Structurizr;
