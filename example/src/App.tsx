import * as React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import type { RootStackParamList } from './navigation/types';
import type { DemoSectionData } from './screens/HomeScreen';
import HomeScreen from './screens/HomeScreen';
import DemoScreen from './screens/DemoScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const Stack = createStackNavigator<RootStackParamList>();

const SECTIONS: DemoSectionData[] = [
  {
    title: '\u57FA\u7840\u5C55\u793A',
    items: [
      {
        id: 'basic',
        title: '\u5546\u54C1\u5217\u8868',
        description:
          '\u5546\u54C1\u540D\u79F0\u3001\u5206\u7C7B\u3001\u4EF7\u683C\u3001\u9500\u91CF\u7684\u57FA\u7840\u5C55\u793A',
        icon: 'T',
      },
      {
        id: 'empty',
        title: '\u5546\u54C1\u641C\u7D22',
        description:
          '\u5173\u952E\u8BCD\u641C\u7D22\u5546\u54C1\uFF0C\u65E0\u7ED3\u679C\u65F6\u5C55\u793A\u7A7A\u72B6\u6001',
        icon: '\u2205',
      },
      {
        id: 'stripeBorder',
        title: '\u6761\u7EB9 & \u8FB9\u6846',
        description:
          '\u6761\u7EB9\u884C\u3001\u8FB9\u6846\u6A21\u5F0F\u3001Loading\u3001Footer \u6C47\u603B',
        icon: '\u2261',
      },
      {
        id: 'ellipsis',
        title: '\u7701\u7565+\u63D0\u793A',
        description:
          '\u6587\u672C\u7701\u7565 + \u957F\u6309\u67E5\u770B\u5B8C\u6574\u5185\u5BB9',
        icon: '\u2026',
      },
    ],
  },
  {
    title: '\u6392\u5E8F\u4E0E\u7B5B\u9009',
    items: [
      {
        id: 'sortable',
        title: '\u6536\u652F\u660E\u7EC6',
        description:
          '\u6309\u91D1\u989D\u6392\u5E8F\u7684\u6536\u652F\u6D41\u6C34\uFF0C\u6536\u5165\u7EFF/\u652F\u51FA\u7EA2',
        icon: '\u2195',
      },
      {
        id: 'multiSort',
        title: '\u591A\u5217\u6392\u5E8F',
        description:
          '\u591A\u5217\u6392\u5E8F\uFF0C\u663E\u793A\u6392\u5E8F\u4F18\u5148\u7EA7\u5E8F\u53F7',
        icon: '#',
      },
      {
        id: 'filter',
        title: '\u5217\u7B5B\u9009',
        description:
          '\u5217\u5934\u7B5B\u9009\u9762\u677F\uFF0C\u591A\u9009/\u5355\u9009\u7B5B\u9009',
        icon: 'F',
      },
      {
        id: 'search',
        title: '\u641C\u7D22\u9AD8\u4EAE',
        description:
          '\u5173\u952E\u8BCD\u5339\u914D\u9AD8\u4EAE\u5355\u5143\u683C\u6587\u672C',
        icon: '\u2315',
      },
    ],
  },
  {
    title: '\u5E03\u5C40\u589E\u5F3A',
    items: [
      {
        id: 'fixed',
        title: '\u89C4\u683C\u4EF7\u683C\u8868',
        description:
          '\u5546\u54C1\u540D\u56FA\u5B9A\u5DE6\u4FA7\uFF0C\u5404\u5C3A\u7801\u4EF7\u683C\u6A2A\u5411\u6EDA\u52A8',
        icon: '\u2503',
      },
      {
        id: 'rightFixed',
        title: '\u552E\u540E\u5DE5\u5355',
        description:
          '\u5DE5\u5355\u53F7\u5DE6\u56FA\u5B9A\u3001\u64CD\u4F5C\u5217\u53F3\u56FA\u5B9A',
        icon: '\u2502',
      },
      {
        id: 'groupedHeader',
        title: '\u5206\u7EC4\u8868\u5934',
        description:
          '\u591A\u7EA7\u5206\u7EC4\u8868\u5934\uFF0C\u652F\u6301\u5D4C\u5957\u5B50\u5217',
        icon: '\u2533',
      },
      {
        id: 'cellMerge',
        title: '\u5355\u5143\u683C\u5408\u5E76',
        description:
          '\u5355\u5143\u683C\u5217\u5408\u5E76\uFF08colspan\uFF09\u5C55\u793A',
        icon: '\u229E',
      },
    ],
  },
  {
    title: '\u4EA4\u4E92\u7F16\u8F91',
    items: [
      {
        id: 'edit',
        title: '\u5355\u5143\u683C\u7F16\u8F91',
        description:
          '\u5355\u51FB\u7F16\u8F91\uFF0C\u6587\u672C/\u6570\u5B57/\u4E0B\u62C9\u9009\u62E9',
        icon: '\u270E',
      },
      {
        id: 'checkboxRadio',
        title: '\u591A\u9009 & \u5355\u9009',
        description:
          'Checkbox \u5168\u9009/\u534A\u9009\uFF0CRadio \u5355\u9009',
        icon: '\u2611',
      },
      {
        id: 'dragSort',
        title: '\u884C\u62D6\u62FD\u6392\u5E8F',
        description:
          '\u62D6\u62FD\u624B\u67C4\u4E0A\u4E0B\u79FB\u52A8\u6392\u5E8F\u884C',
        icon: '\u2630',
      },
      {
        id: 'interactive',
        title: '\u8D2D\u7269\u8F66',
        description:
          '\u6570\u91CF\u52A0\u51CF\u3001\u5C0F\u8BA1\u8BA1\u7B97\u3001\u5220\u9664\u5546\u54C1',
        icon: '\u229A',
      },
    ],
  },
  {
    title: '\u6811\u5F62\u4E0E\u5C55\u5F00',
    items: [
      {
        id: 'expandable',
        title: '\u8BA2\u5355\u5217\u8868',
        description:
          '\u5C55\u5F00\u8BA2\u5355\u67E5\u770B\u5546\u54C1\u660E\u7EC6\u3001\u89C4\u683C\u548C\u5C0F\u8BA1',
        icon: '\u25B7',
      },
      {
        id: 'comprehensive',
        title: '\u5E93\u5B58\u7BA1\u7406',
        description:
          '\u6392\u5E8F+\u56FA\u5B9A\u5217+SKU\u5C55\u5F00\u7684\u7EFC\u5408\u573A\u666F',
        icon: '\u25E8',
      },
    ],
  },
  {
    title: '\u8FDB\u9636\u529F\u80FD',
    items: [
      {
        id: 'custom',
        title: '\u4F1A\u5458\u7BA1\u7406',
        description:
          '\u5934\u50CF\u3001\u7B49\u7EA7\u5FBD\u7AE0\u3001\u79EF\u5206\u8FDB\u5EA6\u3001\u6D88\u8D39\u6807\u7B7E',
        icon: '\u2726',
      },
      {
        id: 'resize',
        title: '\u5217\u5BBD\u8C03\u6574',
        description:
          '\u62D6\u62FD\u8868\u5934\u53F3\u8FB9\u7F18\u8C03\u6574\u5217\u5BBD',
        icon: '\u21D4',
      },
      {
        id: 'pagination',
        title: '\u5206\u9875',
        description:
          '\u5206\u9875\u5C55\u793A\uFF0C\u7FFB\u9875\u548C\u5207\u6362\u6BCF\u9875\u6761\u6570',
        icon: '\u25C1',
      },
      {
        id: 'performance',
        title: '\u6027\u80FD\u6D4B\u8BD5',
        description:
          '100~5000 \u6761\u4EA4\u6613\u8BB0\u5F55\u6027\u80FD\u6D4B\u8BD5',
        icon: '\u26A1',
      },
    ],
  },
];

const HomeScreenWrapper: React.FC = () => <HomeScreen sections={SECTIONS} />;

function AppNavigator() {
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
              elevation: 0,
              shadowColor: colors.cardShadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
            },
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 16,
              color: colors.text,
            },
            cardStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreenWrapper}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Demo"
            component={DemoScreen}
            options={({ route }) => ({
              title: route.params.title,
              headerBackTitle: '\u8FD4\u56DE',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
