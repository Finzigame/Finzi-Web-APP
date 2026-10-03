import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface Props {
    size?: number;
    color?: string;
    opacity?: number;
}

const ChevronRightDecision: React.FC<Props> = ({ size = 12, color = '#005950', opacity = 0.5 }) => (
    <Svg width={8} height={size} viewBox="0 0 8 12" fill="none">
        <G opacity={opacity}>
            <Path
                d="M4.6 6L0 1.4L1.4 0L7.4 6L1.4 12L0 10.6L4.6 6Z"
                fill={color}
            />
        </G>
    </Svg>
);

export default ChevronRightDecision;
