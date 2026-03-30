import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface DemoDetailHeaderProps {
  title: string;
  onBack: () => void;
}

const DemoDetailHeader: React.FC<DemoDetailHeaderProps> = ({
  title,
  onBack,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={onBack}
      activeOpacity={0.6}
    >
      <Text style={styles.backArrow}>←</Text>
      <Text style={styles.backText}>返回</Text>
    </TouchableOpacity>
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
    <View style={styles.placeholder} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    paddingHorizontal: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
    minWidth: 70,
  },
  backArrow: {
    fontSize: 18,
    color: colors.primary,
    marginRight: 4,
  },
  backText: {
    fontSize: 14,
    color: colors.primary,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  placeholder: {
    minWidth: 70,
  },
});

export default DemoDetailHeader;
