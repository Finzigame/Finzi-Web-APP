import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import Videojuegos from '../../../assets/Images/Videojuegos';

type VideojuegosIconProps = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

const VideojuegosIcon: React.FC<VideojuegosIconProps> = ({ width = 82, height = 85 }) => {
  return <Videojuegos width={width} height={height} />;
};

export default VideojuegosIcon;
