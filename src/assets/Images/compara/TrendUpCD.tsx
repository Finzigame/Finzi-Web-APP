import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function TrendUpCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={(size * 12) / 20} viewBox="0 0 20 12" fill="none">
            <Path
                d="M1.4 12L0 10.6L7.4 3.15L11.4 7.15L16.6 2H14V0H20V6H18V3.4L11.4 10L7.4 6L1.4 12Z"
                fill={color}
            />
        </Svg>
    );
}
