import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

const PiggyDecision: React.FC<Props> = ({ size = 36, color = 'white' }) => (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <Rect width={36} height={36} rx={18} fill="white" fillOpacity={0.4} />
        <Path
            d="M27 17h-1.26A7.99 7.99 0 0 0 19 11.07V10h1a1 1 0 0 0 0-2h-3a1 1 0 0 0 0 2h1v1.07A8 8 0 0 0 11 18H9a1 1 0 0 0 0 2h1.06c.44 2.67 2.19 4.9 4.57 6.03L14 28a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h2v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1l-.64-1.97C23.75 24.9 25.5 22.67 25.94 20H27a1 1 0 0 0 0-2zm-9 7a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm1-6h-2v-2a1 1 0 0 0-2 0v3a1 1 0 0 0 1 1h3a1 1 0 0 0 0-2z"
            fill={color}
        />
    </Svg>
);

export default PiggyDecision;
