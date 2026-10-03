import React from "react";
import { Image, StyleProp, ImageStyle } from "react-native";

type Props = {
    width?: number | string;
    height?: number | string;
    style?: StyleProp<ImageStyle>;
};

const Bellotita: React.FC<Props> = ({ width = 54, height = 62, style }) => (
    <Image
        source={require('./bellotita.png')}
        style={[{ width: width as number, height: height as number }, style]}
        resizeMode="contain"
    />
);

export default Bellotita;
