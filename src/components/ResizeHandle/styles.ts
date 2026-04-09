import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -2,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 10,
    // Expand touch area via hitSlop instead of width
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 1,
    height: '100%',
    backgroundColor: 'transparent',
  },
  lineActive: {
    backgroundColor: '#1890ff',
    width: 2,
  },
});

export default styles;
