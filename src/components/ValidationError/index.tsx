'use strict';

import { forwardRef, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import type { IValidationError } from '../../types';

interface IValidationErrorProps {
  errors: IValidationError[];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const ValidationError = (
  { errors, style, textStyle }: IValidationErrorProps,
  _ref: unknown
) => {
  if (errors.length === 0) return null;

  return (
    <View style={[defaultStyles.container, style]} testID="validation-error">
      {errors.map((error, index) => (
        <Text
          key={`${error.rowKey}-${error.columnKey}-${index}`}
          style={[defaultStyles.errorText, textStyle]}
        >
          {error.message}
        </Text>
      ))}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default memo(forwardRef(ValidationError));
