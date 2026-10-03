import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

export default function AlertCD({ size = 20, color = '#70F2E0' }: Props) {
    return (
        <Svg width={size} height={(size * 18) / 20} viewBox="0 0 20 18" fill="none">
            <Path
                d="M10 0L0 18H20L10 0ZM11 15H9V13H11V15ZM11 11H9V7H11V11Z"
                fill={color}
            />
        </Svg>
    );
}
