import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function ClockCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <Path
                d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM10 18C5.589 18 2 14.411 2 10C2 5.589 5.589 2 10 2C14.411 2 18 5.589 18 10C18 14.411 14.411 18 10 18ZM10.5 5H9V11L14 13.5L14.75 12.19L10.5 10.06V5Z"
                fill={color}
            />
        </Svg>
    );
}
