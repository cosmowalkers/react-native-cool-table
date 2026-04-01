import React, { memo } from 'react';
import { View, Text } from 'react-native';
import type { ITableSortProps } from '../../types';
import styles from './styles';

const Sort = ({
  sortStatus,
  style,
  ascIconProps,
  descIconProps,
  sortIndex,
}: ITableSortProps) => {
  return (
    <View style={[styles.container, style]}>
      {/* asc arrow */}
      <View
        style={[
          styles.triangle,
          styles.triangleUp,
          sortStatus === 'asc' && styles.triangleActive,
          ascIconProps?.style,
        ]}
      />
      {/* desc arrow */}
      <View
        style={[
          styles.triangle,
          styles.triangleDown,
          sortStatus === 'desc' && styles.triangleActive,
          descIconProps?.style,
        ]}
      />
      {sortIndex !== undefined && sortIndex > 0 && (
        <Text style={styles.sortIndex}>{sortIndex}</Text>
      )}
    </View>
  );
};

export default memo(Sort);
