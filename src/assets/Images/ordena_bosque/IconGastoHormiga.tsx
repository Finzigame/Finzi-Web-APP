import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
    size?: number;
}

const IconGastoHormiga: React.FC<Props> = ({ size = 48 }) => (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Circle cx={24} cy={24} r={24} fill="#FB5151" />
        <Path
            d="M17.5625 38.5L11 31.9375V22.5625L17.5625 16H26.9375L33.5 22.5625V31.9375L26.9375 38.5H17.5625ZM18.6875 32.5625L22.25 29L25.8125 32.5625L27.5625 30.8125L24 27.25L27.5625 23.6875L25.8125 21.9375L22.25 25.5L18.6875 21.9375L16.9375 23.6875L20.5 27.25L16.9375 30.8125L18.6875 32.5625Z"
            fill="#570008"
        />
    </Svg>
);

export default IconGastoHormiga;
