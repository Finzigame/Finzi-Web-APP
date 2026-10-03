import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function LeafCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <Path
                d="M18 2C18 2 16 10 10 13C7 14.5 4 14 2 18C2 18 2 10 8 6C11 4 15 3 18 2ZM8 14C8 14 9 17 7 20"
                fill={color}
            />
        </Svg>
    );
}
