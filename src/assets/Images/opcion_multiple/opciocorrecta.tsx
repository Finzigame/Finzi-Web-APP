import * as React from "react";
import Svg, { Rect } from "react-native-svg";
const SVGComponent = (props) => (
    <Svg
        width={351}
        height={59}
        viewBox="0 0 351 59"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Rect
            x={2}
            y={2}
            width={347}
            height={55}
            rx={27}
            fill="#00B466"
            stroke="#1F6468"
            strokeWidth={4}
        />
    </Svg>
);
export default SVGComponent;
