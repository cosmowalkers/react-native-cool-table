import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expand_icon: {
    marginRight: 2,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#666',
  },
  rightArrow: {
    marginLeft: 4,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightArrowTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#999',
  },
  second_text: {
    fontSize: 11,
    color: '#929AA6',
  },
  text: {
    fontSize: 12,
    color: '#1F2733',
  },
  sort: {
    marginLeft: 4,
  },

  // === Checkbox ===
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
  },
  checkboxIndeterminate: {
    borderColor: '#1890ff',
  },
  checkboxTick: {
    width: 8,
    height: 4,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  checkboxDash: {
    width: 8,
    height: 0,
    borderTopWidth: 1.5,
    borderColor: '#1890ff',
  },

  // === Radio ===
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: {
    borderColor: '#1890ff',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1890ff',
  },

  // === Filter ===
  filterIcon: {
    marginLeft: 4,
    padding: 2,
  },
  filterTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#C0C4CC',
  },
  filterTriangleActive: {
    borderTopColor: '#1890ff',
  },
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPanel: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    maxWidth: 300,
    maxHeight: 400,
  },
  filterContent: {
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#E6F7FF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#1890ff',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: '#E8E8E8',
    paddingTop: 12,
  },
  filterResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterResetText: {
    fontSize: 14,
    color: '#666',
  },
  filterConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1890ff',
    borderRadius: 4,
  },
  filterConfirmText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default styles;
