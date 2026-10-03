import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function ShieldCheckCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={(size * 20) / 16} viewBox="0 0 16 20" fill="none">
            <Path
                d="M6.95 13.55L12.6 7.9L11.175 6.475L6.95 10.7L4.85 8.6L3.425 10.025L6.95 13.55ZM8 20C5.68333 19.4167 3.77083 18.0875 2.2625 16.0125C0.754167 13.9375 0 11.6333 0 9.1V3L8 0L16 3V9.1C16 11.6333 15.2458 13.9375 13.7375 16.0125C12.2292 18.0875 10.3167 19.4167 8 20Z"
                fill={color}
            />
        </Svg>
    );
}
