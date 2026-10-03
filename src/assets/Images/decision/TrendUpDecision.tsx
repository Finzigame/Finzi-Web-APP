import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

const TrendUpDecision: React.FC<Props> = ({ size = 36, color = 'white' }) => (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <Rect width={36} height={36} rx={18} fill="white" fillOpacity={0.4} />
        <Path
            d="M9.4 24L8 22.6L15.4 15.15L19.4 19.15L24.6 14H22V12H28V18H26V15.4L19.4 22L15.4 18L9.4 24Z"
            fill={color}
        />
    </Svg>
);

export default TrendUpDecision;
