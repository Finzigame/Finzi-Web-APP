import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type BellotaProps = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

const Bellota: React.FC<BellotaProps> = ({ width = 72, height = 70, style }) => {
  return (
    <Image
      source={require('../icons/bellota_img.png')}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
};

export default Bellota;