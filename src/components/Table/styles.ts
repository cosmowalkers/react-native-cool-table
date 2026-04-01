import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});

export default styles;
