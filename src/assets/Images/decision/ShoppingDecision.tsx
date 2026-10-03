import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

const ShoppingDecision: React.FC<Props> = ({ size = 36, color = 'white' }) => (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <Rect width={36} height={36} rx={18} fill="white" fillOpacity={0.4} />
        <Path
            d="M24 14h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4h-2c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V16c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
            fill={color}
        />
    </Svg>
);

export default ShoppingDecision;
