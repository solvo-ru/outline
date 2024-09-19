import pako from "pako";
import env from "../../../env";
import { DiagramOptions, DiagramType } from "./types";

export function encodeDiagram(diagramText: string): string {
  try {
    const data = Buffer.from(diagramText, "utf8");
    const compressed = pako.deflate(data, { level: 9 });
    return Buffer.from(compressed)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  } catch (error) {
    console.error("Error encoding diagram:", error);
    throw new Error("Failed to encode diagram.");
  }
}

/**
 * Converts the diagram text to SVG by making a request to the Kroki server.
 * @param {<T>} diagramType - The type of the diagram.
 * @param {string} diagramText - The diagram text to convert.
 * @param {DiagramOptions} diagramOptions - Additional options for the diagram.
 * @returns {Promise<string>} - The SVG representation of the diagram.
 */
export async function diagramToSvg<T extends DiagramType>(
  diagramType: T,
  diagramText: string,
  diagramOptions?: DiagramOptions<T>
): Promise<string> {
  try {
    const response = await fetch(env.KROKI_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        diagram_source: diagramText,
        diagram_type: diagramType,
        output_format: "svg",
        diagram_options: diagramOptions,
	log: console.error(diagramText+diagramType+JSON.stringify(diagramOptions)),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error converting diagram to SVG:", error);
    throw new Error("Failed to convert diagram to SVG.");
  }
}
