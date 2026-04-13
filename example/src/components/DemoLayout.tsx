import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface DemoLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  extraInfo?: React.ReactNode;
  scrollable?: boolean;
}

const DemoLayout: React.FC<DemoLayoutProps> = ({
  title,
  description,
  children,
  extraInfo,
  scrollable = false,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          padding: 16,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        title: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 8,
        },
        description: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
      }),
    [colors]
  );

  const content = (
    <>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>{title}</Text>
        <Text style={dynamicStyles.description}>{description}</Text>
        {extraInfo}
      </View>
      {children}
    </>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={dynamicStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={dynamicStyles.container}>{content}</View>;
};

export default DemoLayout;
