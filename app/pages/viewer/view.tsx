import * as React from "react";
import DOMPurify from "dompurify";
import ResizeObserver from "rc-resize-observer";
import type { DOMNode, Element } from "html-react-parser";
import reactParse from "html-react-parser";
import Alert from "app/components/alert";

interface Props {
  imageUrl: string;
  svg: string;
}

export default function ViewerPage(props: Props): React.FunctionComponentElement<Props> {
  const [size, setSize] = React.useState([0, 0]);
  const [svg, setSvg] = React.useState(null as string|null)
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);

  React.useEffect(
    () => {
      const pureSvg = DOMPurify.sanitize(props.svg);
      const parser = new DOMParser();
      const svg = parser.parseFromString(pureSvg, "image/svg+xml").firstChild;
      if (!svg || svg.nodeName !== "svg") {
        setErrorMessage("Cannot display selection: not SVG format");
      } else {
        const rect = svg.firstChild;
        if (!rect || rect.nodeName !== "rect") {
          setErrorMessage("Cannot display selection: SVG does not contain <rect>");
        } else {
          setSvg(pureSvg);
        }
      }
    },
    [props.svg]
  );

  function rectStyler(node: DOMNode): React.ReactElement|null {
    if (node.type !== "tag") {
      setErrorMessage("Cannot display selection: invalid SVG");
      return null;
    } else {
      const elem = node as Element;
      if (elem.tagName === "rect") {
        const x = elem.attributes.find(a => a.name === "x")?.value;
        const y = elem.attributes.find(a => a.name === "y")?.value;
        const width = elem.attributes.find(a => a.name === "width")?.value;
        const height = elem.attributes.find(a => a.name === "height")?.value;
        if (!x) {
          setErrorMessage("Rectangle selection does not contain attribute x");
          return null;
        } else if (!y) {
          setErrorMessage("Rectangle selection does not contain attribute y");
          return null;
        } else if (!width) {
          setErrorMessage("Rectangle selection does not contain attribute width");
          return null;
        } else if (!height) {
          setErrorMessage("Rectangle selection does not contain attribute height");
          return null;
        } else {
          return (
            <rect x={x} y={y} width={width} height={height}
              style={{fill: "rgba(255, 70, 50, 0.2)", stroke: "rgb(255,70,50)", strokeWidth: 3}} />
          );
        }
      } else {
        return null;
      }
    }
  }

  return (
    <div className="container-fluid">
      <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)} />
      {svg ?
        <svg id="image" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width={size[0]} height={size[1]}>
          <g>
            <ResizeObserver onResize={dimensions => setSize([dimensions.width, dimensions.height])}>
                <image xlinkHref={props.imageUrl}/>
            </ResizeObserver>
            {reactParse(svg, { replace: rectStyler })}
          </g>
        </svg>
      : <></>}
    </div>
  );
}
