import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function StarCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <Path
                d="M10 0L12.47 7.11H20L13.76 11.5L16.18 18.61L10 14.22L3.82 18.61L6.24 11.5L0 7.11H7.53L10 0Z"
                fill={color}
            />
        </Svg>
    );
}
