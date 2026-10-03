import React from "react";
import { Image, StyleProp, ImageStyle } from "react-native";

type Props = {
    width?: number | string;
    height?: number | string;
    style?: StyleProp<ImageStyle>;
};

const Cerebrito: React.FC<Props> = ({ width = 70, height = 68, style }) => (
    <Image
        source={require('./cerebro.png')}
        style={[{ width: width as number, height: height as number }, style]}
        resizeMode="contain"
    />
);

export default Cerebrito;
