import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 12,
    height: 16,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  triangleUp: {
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#d9d9d9',
    marginBottom: 1,
  },
  triangleDown: {
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#d9d9d9',
  },
  triangleActive: {
    borderBottomColor: '#1890ff',
    borderTopColor: '#1890ff',
  },
  sortIndex: {
    fontSize: 8,
    color: '#1890ff',
    marginLeft: 1,
    lineHeight: 10,
  },
});

export default styles;
