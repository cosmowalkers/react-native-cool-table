import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import CoolTable from 'react-native-cool-table';
import type { ITableProps } from 'react-native-cool-table';
import { useTheme } from '../context/ThemeContext';

interface TableContainerProps extends Omit<ITableProps, 'style'> {
  style?: ViewStyle;
  flex?: boolean;
}

const TableContainer: React.FC<TableContainerProps> = ({
  style,
  flex = false,
  loadingConfig,
  ...tableProps
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          margin: 16,
          backgroundColor: colors.surface,
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 3,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        containerFlex: {
          margin: 16,
          backgroundColor: colors.surface,
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 3,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          flex: 1,
        },
        table: {
          backgroundColor: colors.surface,
        },
        cell: {
          backgroundColor: colors.surface,
        },
        row: {
          minHeight: 48,
          borderBottomWidth: 1,
          borderBottomColor: colors.rowBorder,
        },
        headerRow: {
          backgroundColor: colors.headerBg,
          borderBottomWidth: 2,
          borderBottomColor: colors.border,
        },
        loadingOverlay: {
          backgroundColor:
            theme.name === 'dark'
              ? 'rgba(15, 23, 42, 0.6)'
              : 'rgba(255, 255, 255, 0.6)',
        },
      }),
    [colors, theme.name]
  );

  return (
    <View
      style={[
        flex ? dynamicStyles.containerFlex : dynamicStyles.container,
        style,
      ]}
    >
      <CoolTable
        style={dynamicStyles.table}
        rowStyle={dynamicStyles.row}
        cellStyle={dynamicStyles.cell}
        textColor={colors.text}
        headerTextColor={colors.textSecondary}
        headerRowStyle={dynamicStyles.headerRow}
        loadingConfig={{
          ...loadingConfig,
          overlayStyle: [
            dynamicStyles.loadingOverlay,
            loadingConfig?.overlayStyle,
          ],
        }}
        {...tableProps}
      />
    </View>
  );
};

export default TableContainer;
