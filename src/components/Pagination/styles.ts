import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fff',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 13,
    color: '#333',
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
  pageButtonActive: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
  },
  pageButtonText: {
    fontSize: 13,
    color: '#333',
  },
  pageButtonTextActive: {
    color: '#fff',
  },
  ellipsis: {
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  ellipsisText: {
    fontSize: 13,
    color: '#999',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 8,
  },
  pageSizeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
  pageSizeButtonActive: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
  },
  pageSizeText: {
    fontSize: 12,
    color: '#333',
  },
  pageSizeTextActive: {
    color: '#1890ff',
  },
});

export default styles;
