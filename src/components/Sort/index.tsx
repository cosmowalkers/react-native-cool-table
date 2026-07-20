import { memo } from 'react';
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
  const label = sortStatus
    ? `Sorted ${sortStatus === 'asc' ? 'ascending' : 'descending'}`
    : 'Not sorted';

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
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
