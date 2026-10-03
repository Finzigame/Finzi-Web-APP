import React from 'react';
import Svg, { Circle, Defs, Filter, FeFlood, FeBlend, FeGaussianBlur } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

/**
 * Punto de brillo decorativo del minijuego "Completa la Frase".
 * Imita los puntitos amarillos con blur del diseño.
 */
const GlowDotCF: React.FC<Props> = ({ size = 9, color = '#FEE23B' }) => (
    <Svg width={size + 8} height={size + 8} viewBox="0 0 17 17" fill="none">
        <Defs>
            <Filter id="glow" x="-44.4%" y="-44.4%" width="188.9%" height="188.9%">
                <FeFlood floodOpacity={0} result="BackgroundImageFix" />
                <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <FeGaussianBlur stdDeviation={2} result="effect1_foregroundBlur" />
            </Filter>
        </Defs>
        <Circle cx={8.5} cy={8.5} r={4.5} fill={color} filter="url(#glow)" />
    </Svg>
);

export default GlowDotCF;
