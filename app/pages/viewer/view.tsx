import * as React from "react";
import ResizeObserver from "rc-resize-observer";

interface Props {
  imageUrl: string;
  svg: string;
}

export default function ViewerPage(props: Props): React.FunctionComponentElement<Props> {
  return (
    <div className="container-fluid">
      <svg id="image" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <g>
          <ResizeObserver
            onResize={() => {
              console.log("resized!");
            }}>
              <image xlinkHref={props.imageUrl}/>
          </ResizeObserver>
        </g>
      </svg>
    </div>
  );
}
