import { StyleSheet } from 'react-native';
import type { ITheme } from './theme';

/**
 * Layout-only styles that don't depend on theme colors.
 * Color-dependent styles should use createThemedStyles().
 */
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
  },

  tableContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tableContainerFlex: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    flex: 1,
  },

  table: {},

  row: {
    minHeight: 48,
    borderBottomWidth: 1,
  },
  rowLarge: {
    minHeight: 52,
    borderBottomWidth: 1,
  },
  rowSmall: {
    minHeight: 44,
    borderBottomWidth: 1,
  },
  headerRow: {
    borderBottomWidth: 2,
  },

  features: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },

  sortInfo: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center' as const,
  },
});

/**
 * Factory: creates color-dependent styles from a theme.
 * Use with useMemo(() => createThemedStyles(theme), [theme]).
 */
export function createThemedStyles(theme: ITheme) {
  const { colors } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    tableContainer: {
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
    tableContainerFlex: {
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
    row: {
      minHeight: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.rowBorder,
    },
    rowLarge: {
      minHeight: 52,
      borderBottomWidth: 1,
      borderBottomColor: colors.rowBorder,
    },
    rowSmall: {
      minHeight: 44,
      borderBottomWidth: 1,
      borderBottomColor: colors.rowBorder,
    },
    headerRow: {
      backgroundColor: colors.headerBg,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    features: {
      margin: 16,
      marginTop: 0,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    featuresTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    featureItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
    sortInfo: {
      fontSize: 12,
      color: colors.primary,
      fontStyle: 'italic',
      marginTop: 8,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center' as const,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    surface: {
      backgroundColor: colors.surface,
    },
  });
}
