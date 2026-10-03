import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
    rotate?: number;
}

/**
 * Estrella decorativa del minijuego "Completa la Frase".
 */
const StarCF: React.FC<Props> = ({ size = 28, color = '#FEE23B', rotate = 0 }) => (
    <Svg
        width={size}
        height={size}
        viewBox="0 0 22 22"
        fill="none"
        style={{ transform: [{ rotate: `${rotate}deg` }] }}
    >
        <Path
            d="M11 0L13.09 8.26L22 11L13.09 13.74L11 22L8.91 13.74L0 11L8.91 8.26L11 0Z"
            fill={color}
        />
    </Svg>
);

export default StarCF;
