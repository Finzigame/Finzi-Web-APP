import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale } from 'react-native-size-matters';

type Props = {
  unit: number;
  sectionNumber: number;
  title: string;
  onMenuPress?: () => void;
};

const NivelTextoBox: React.FC<Props> = ({ unit, sectionNumber, title, onMenuPress }) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.textBlock}>
        <Text style={styles.subtitle}>
          Nivel {unit}, Sección {sectionNumber}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onMenuPress}>
        {/* nuevo icono de libreta */}
        <View style={styles.notebook}>
          <View style={styles.notebookLine} />
          <View style={styles.notebookLine} />
          <View style={styles.notebookLine} />
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(10),
    zIndex: 500,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(10),
    paddingLeft: scale(14),
    paddingRight: scale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  textBlock: {
    flex: 1,
  },
  subtitle: {
    fontSize: scale(10),
    color: '#9E9E9E',
    fontFamily: 'Fredoka-Regular',
    marginBottom: scale(2),
  },
  title: {
    fontSize: scale(13),
    color: '#2D2D2D',
    fontFamily: 'Fredoka-Medium',
    lineHeight: scale(17),
  },
  divider: {
    width: 1,
    height: scale(36),
    backgroundColor: '#E0E0E0',
    marginHorizontal: scale(10),
  },
  iconBtn: {
    width: scale(32),
    height: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notebook: {
    width: scale(20),
    height: scale(22),
    borderWidth: 1.5,
    borderColor: '#9E9E9E',
    borderRadius: scale(3),
    justifyContent: 'center',
    paddingHorizontal: scale(3),
    gap: scale(4),
  },
  notebookLine: {
    height: 1.5,
    backgroundColor: '#9E9E9E',
    borderRadius: 1,
  },
});

export default NivelTextoBox;
