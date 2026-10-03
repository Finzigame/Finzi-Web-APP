import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

interface Props {
    size?: number;
    rotate?: number;
}

const StarDecision: React.FC<Props> = ({ size = 32, rotate = 42 }) => (
    <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
        <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <Path
                d="M20 2L24.9 14.5H38.5L27.8 22.3L31.8 34.8L20 27L8.2 34.8L12.2 22.3L1.5 14.5H15.1L20 2Z"
                fill="#FEC20A"
            />
        </Svg>
    </View>
);

export default StarDecision;
