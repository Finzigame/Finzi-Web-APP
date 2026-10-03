import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
}

const PlaneDecision: React.FC<Props> = ({ size = 36, color = 'white' }) => (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <Rect width={36} height={36} rx={18} fill="white" fillOpacity={0.4} />
        <Path
            d="M13 28V25.5L16 23.4V19.8L8 23V20L16 14.4V10C16 9.45 16.1958 8.97917 16.5875 8.5875C16.9792 8.19583 17.45 8 18 8C18.55 8 19.0208 8.19583 19.4125 8.5875C19.8042 8.97917 20 9.45 20 10V14.4L28 20V23L20 19.8V23.4L23 25.5V28L18 26.5L13 28Z"
            fill={color}
        />
    </Svg>
);

export default PlaneDecision;
