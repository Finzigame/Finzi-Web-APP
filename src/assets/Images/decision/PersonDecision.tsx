import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

const PersonDecision: React.FC<Props> = ({ size = 36, color = 'white' }) => (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <Rect width={36} height={36} rx={18} fill="white" fillOpacity={0.4} />
        <Path
            d="M18 18c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill={color}
        />
    </Svg>
);

export default PersonDecision;
