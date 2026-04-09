import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  groupCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    backgroundColor: '#fff',
  },
  groupCellText: {
    fontSize: 12,
    color: '#929AA6',
  },
  fixed_cell: {
    zIndex: 100,
  },
});

export default styles;
