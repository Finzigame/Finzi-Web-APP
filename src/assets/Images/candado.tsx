import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";

type Props = {
    width?: number | string;
    height?: number | string;
    color?: string;
};

const Candado: React.FC<Props> = ({ width = 25, height = 26, color = "#FFF" }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Rect
            x={4}
            y={11}
            width={16}
            height={11}
            rx={2.5}
            fill={color}
        />
        <Path
            d="M12 15v3"
            stroke={color === "#FFF" ? "#888" : "#FFF"}
            strokeWidth={2}
            strokeLinecap="round"
        />
    </Svg>
);

export default Candado;
