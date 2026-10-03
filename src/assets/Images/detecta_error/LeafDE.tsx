import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { View } from 'react-native';

type Props = {
    width?: number;
    height?: number;
    rotate?: number;
};

export default function LeafDE({ width = 55, height = 140, rotate = 0 }: Props) {
    return (
        <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
            <Svg width={width} height={height} viewBox="0 0 55 140" fill="none">
                {/* Stem */}
                <Rect x="26" y="30" width="3" height="110" rx="1.5" fill="#03616C" />
                {/* Leaf 1 - top */}
                <Path
                    d="M28 32 Q52 18 48 5 Q30 14 28 32Z"
                    fill="#13808C"
                    stroke="#03616C"
                    strokeWidth="1"
                />
                {/* Leaf 2 - upper right */}
                <Path
                    d="M28 50 Q54 38 52 24 Q32 33 28 50Z"
                    fill="#13808C"
                    stroke="#03616C"
                    strokeWidth="1"
                />
                {/* Leaf 3 - upper left */}
                <Path
                    d="M28 65 Q4 50 5 36 Q24 46 28 65Z"
                    fill="#13808C"
                    stroke="#03616C"
                    strokeWidth="1"
                />
                {/* Leaf 4 - mid right */}
                <Path
                    d="M28 80 Q55 65 54 50 Q33 60 28 80Z"
                    fill="#13808C"
                    stroke="#03616C"
                    strokeWidth="1"
                />
                {/* Leaf 5 - mid left */}
                <Path
                    d="M28 95 Q2 78 2 64 Q22 74 28 95Z"
                    fill="#13808C"
                    stroke="#03616C"
                    strokeWidth="1"
                />
            </Svg>
        </View>
    );
}
