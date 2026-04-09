import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  tooltipContainer: {
    position: 'absolute',
    maxWidth: 280,
    minWidth: 80,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  arrowDown: {
    borderTopWidth: 6,
    borderTopColor: 'rgba(0, 0, 0, 0.75)',
  },
  arrowUp: {
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0, 0, 0, 0.75)',
  },
});

export default styles;
