import * as React from "react";
import Frame from "../components/Frame";
import { EmbedProps as Props } from ".";

function Structurizr({ matches, ...props }: Props) {
  const id = `embed-${Math.floor(1000000 * Math.random())}`;
  const p = matches[1];
  const n = matches[2];
  const w = matches[4];
  const d = matches[5];
  const h = matches[6] || "400";

  const normalizedUrl = `${p}${n}/embed/${w}?diagram=${d}&diagramSelector=false&iframe=${id}`;

  return (
    <Frame
      {...props}
      src={normalizedUrl}
      width="100%"
      height={`${h}px`}
      allowFullscreen
      id={`${id}`}
    />
  );
}

export default Structurizr;
