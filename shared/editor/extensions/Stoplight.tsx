import "@stoplight/elements/styles.min.css";

import { API } from "@stoplight/elements/containers/API";
import React from "react";
import { hydrate } from "react-dom";
import { renderToString } from "react-dom/server";

const Stoplight = (element: HTMLElement, text: string) => {
  if (typeof window !== "undefined") {
    hydrate(
      <React.StrictMode>
        <API apiDescriptionDocument={text} />
      </React.StrictMode>,
      element
    );
  } else {
    element.innerHTML = renderToString(<API apiDescriptionDocument={text} />);
  }
};

export default Stoplight;