import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function XMarkCD({ size = 14, color = '#B31B25' }: Props) {
    return (
        <Svg width={size} height={(size * 14) / 14} viewBox="0 0 14 14" fill="none">
            <Path
                d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
                fill={color}
            />
        </Svg>
    );
}
