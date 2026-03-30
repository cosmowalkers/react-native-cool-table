import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  justify_center: {
    justifyContent: 'center',
  },
  expand: {
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#fff',
  },
  cell_multiple_line: {
    paddingTop: 2,
    justifyContent: 'flex-start',
  },
  fixed_cell: {
    zIndex: 100,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#E8E8E8',
  },
});

export default styles;
