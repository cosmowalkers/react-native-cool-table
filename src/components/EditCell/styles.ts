import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: '#1F2733',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#1890ff',
    borderRadius: 2,
    backgroundColor: '#fff',
    minHeight: 28,
  },
  selectTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#1890ff',
    borderRadius: 2,
    backgroundColor: '#fff',
    minHeight: 28,
  },
  selectText: {
    fontSize: 12,
    color: '#1F2733',
  },
  selectPlaceholder: {
    fontSize: 12,
    color: '#C0C4CC',
  },
  selectArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#999',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    maxWidth: 300,
    maxHeight: 400,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 2,
  },
  optionItemSelected: {
    backgroundColor: '#E6F7FF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#1890ff',
  },
});

export default styles;
