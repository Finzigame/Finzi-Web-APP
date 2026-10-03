import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type Props = {
    size?: number;
    rotate?: number;
};

export default function StarDE({ size = 32, rotate = 0 }: Props) {
    return (
        <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
            <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
                <Path
                    d="M16 0L18.8 13.2L32 16L18.8 18.8L16 32L13.2 18.8L0 16L13.2 13.2L16 0Z"
                    fill="#FEE23B"
                />
            </Svg>
        </View>
    );
}
