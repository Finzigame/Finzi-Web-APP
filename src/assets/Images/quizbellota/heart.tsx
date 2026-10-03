import * as React from "react";
import Svg, { Path } from "react-native-svg";

const Heart = (props) => (
    <Svg
        width={22}
        height={19}
        viewBox="0 0 22 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M11 19C10.7 19 10.4 18.9 10.15 18.7C4.05 13.55 0 9.9 0 5.5C0 2.46 2.46 0 5.5 0C7.24 0 8.91 0.81 11 2.67C13.09 0.81 14.76 0 16.5 0C19.54 0 22 2.46 22 5.5C22 9.9 17.95 13.55 11.85 18.7C11.6 18.9 11.3 19 11 19Z"
            fill="#E8334A"
        />
    </Svg>
);

export default Heart;
