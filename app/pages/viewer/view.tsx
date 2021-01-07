import * as React from "react";
import DOMPurify from "dompurify";
import ResizeObserver from "rc-resize-observer";
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

  return (
    <div className="container-fluid">
      <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)} />
      {svg ?
        <svg id="image" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width={size[0]} height={size[1]}>
          <g>
            <ResizeObserver onResize={dimensions => setSize([dimensions.width, dimensions.height])}>
                <image xlinkHref={props.imageUrl}/>
            </ResizeObserver>
            {reactParse(svg)}
          </g>
        </svg>
      : <></>}
    </div>
  );
}
