import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface Props {
    width?: number;
    height?: number;
    opacity?: number;
}

const ForestDecoDecision: React.FC<Props> = ({ width = 76, height = 71, opacity = 0.2 }) => (
    <Svg width={width} height={height} viewBox="0 0 76 71" fill="none">
        <G opacity={opacity}>
            <Path
                d="M15.9056 52.7427L20.0759 43.6537L4.1703 36.3557L19.1738 26.7362L14.9702 24.8075L41.3016 9.38318L43.6352 22.2815L54.935 15.6386L60.4149 45.659L56.2112 43.7302L58.7039 61.3775L42.7982 54.0795L38.6279 63.1684L29.539 58.9981L33.7093 49.9092L29.1649 47.824L24.9945 56.913L15.9056 52.7427ZM44.2585 49.2483L52.4954 53.0277L49.9459 35.3543L53.7519 37.1006L51.286 23.5914L44.6203 27.4783L46.7815 39.4035L42.5778 37.4748L44.2585 49.2483ZM14.5491 35.6166L38.862 46.7722L36.3125 29.0988L40.1185 30.8451L37.6526 17.336L25.8035 24.2769L29.6094 26.0232L14.5491 35.6166Z"
                fill="#70F2E0"
            />
        </G>
    </Svg>
);

export default ForestDecoDecision;
