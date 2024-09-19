import React, { useState, useEffect } from "react";
import { observable } from "mobx";

interface SvgProps {
  endpoint: string | undefined;
}

type PropsWithRef = SvgProps & {
  forwardedRef: React.Ref<HTMLIFrameElement>;
};

@observable
class Svg extends React.Component<PropsWithRef> {
  render() {
    const { endpoint } = this.props
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      const fetchSVG = async () => {
        try {
          const response = await fetch(endpoint ?? "");
          if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
          const svgText = await response.text();
          setSvgContent(svgText);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchSVG();
    }, [endpoint]);

    if (error) {
      return <div>Ошибка загрузки SVG: {error}</div>;
    }

    if (!svgContent) {
      return <div>Загрузка...</div>;
    }

    // Отображаем SVG напрямую
    return <div
        dangerouslySetInnerHTML={{ __html: svgContent }}
    />;
  }
}

export default React.forwardRef<HTMLIFrameElement, SvgProps>(
  (props, ref) => <Svg {...props} forwardedRef={ref} />
);
