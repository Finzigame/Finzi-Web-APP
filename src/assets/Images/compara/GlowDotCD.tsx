import React from 'react';
import Svg, { Circle, Defs, FeBlend, FeFlood, FeGaussianBlur, Filter } from 'react-native-svg';

export default function GlowDotCD() {
    return (
        <Svg width={9} height={9} viewBox="0 0 9 9" fill="none">
            <Defs>
                <Filter id="glow_cd" x="-4" y="-4" width="17" height="17">
                    <FeFlood floodOpacity={0} result="BackgroundImageFix" />
                    <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <FeGaussianBlur stdDeviation={2} result="effect1_foregroundBlur" />
                </Filter>
            </Defs>
            <Circle cx={4.5} cy={4.5} r={4.5} fill="#FEE23B" filter="url(#glow_cd)" />
        </Svg>
    );
}
