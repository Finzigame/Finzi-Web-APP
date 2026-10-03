import * as React from "react";
import Svg, { Path } from "react-native-svg";
const Ramacomhojas = (props) => (
    <Svg
        width={400}
        height={400}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M120 350C130 300 160 220 280 120"
            stroke="#5D4037"
            strokeWidth={12}
            strokeLinecap="round"
        />
        <Path
            d="M165 270C130 280 90 260 85 220C120 210 160 230 165 270Z"
            fill="#006064"
        />
        <Path
            d="M210 190C175 200 135 180 130 140C165 130 205 150 210 190Z"
            fill="#006064"
        />
        <Path
            d="M205 295C240 305 280 285 285 245C250 235 210 255 205 295Z"
            fill="#004D40"
        />
        <Path
            d="M255 210C290 220 330 200 335 160C300 150 260 170 255 210Z"
            fill="#004D40"
        />
        <Path
            d="M280 120C285 80 320 50 350 60C340 95 310 130 280 120Z"
            fill="#006064"
        />
    </Svg>
);
export default Ramacomhojas;
