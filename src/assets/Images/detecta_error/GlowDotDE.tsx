import React from 'react';
import Svg, { Circle } from 'react-native-svg';

type Props = {
    size?: number;
};

export default function GlowDotDE({ size = 9 }: Props) {
    return (
        <Svg width={size} height={size} viewBox="0 0 9 9" fill="none">
            <Circle cx="4.5" cy="4.5" r="4.5" fill="#FEE23B" opacity={0.75} />
        </Svg>
    );
}
