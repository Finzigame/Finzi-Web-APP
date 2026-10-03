import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function BoltCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={(size * 20) / 14} viewBox="0 0 14 20" fill="none">
            <Path
                d="M14 8H8.5L11 0L0 12H5.5L3 20L14 8Z"
                fill={color}
            />
        </Svg>
    );
}
