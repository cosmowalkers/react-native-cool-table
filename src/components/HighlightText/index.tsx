import React, { memo, useMemo } from 'react';
import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

export interface IHighlightTextProps {
  text: string;
  keyword?: string;
  caseSensitive?: boolean;
  highlightStyle?: StyleProp<TextStyle>;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const DEFAULT_HIGHLIGHT_STYLE: TextStyle = {
  backgroundColor: '#FBBF24',
  color: '#000000',
};

/**
 * Escape regex special characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders text with highlighted keyword segments.
 * When no keyword is provided, renders plain text.
 */
const HighlightText = memo(function HighlightText({
  text,
  keyword,
  caseSensitive = false,
  highlightStyle,
  style,
  numberOfLines,
}: IHighlightTextProps) {
  const segments = useMemo(() => {
    if (!keyword || keyword.length === 0) {
      return null;
    }

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, flags);
    const parts = text.split(regex);

    // If no match found, parts will be [text] with length 1
    if (parts.length <= 1) {
      return null;
    }

    return parts;
  }, [text, keyword, caseSensitive]);

  if (!segments) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  const effectiveHighlightStyle = highlightStyle ?? DEFAULT_HIGHLIGHT_STYLE;

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((part, index) => {
        const isMatch = caseSensitive
          ? part === keyword
          : part.toLowerCase() === keyword!.toLowerCase();

        return isMatch ? (
          <Text key={`hl-${index}`} style={effectiveHighlightStyle}>
            {part}
          </Text>
        ) : (
          <Text key={`hl-${index}`}>{part}</Text>
        );
      })}
    </Text>
  );
});

export { HighlightText };
export default HighlightText;
