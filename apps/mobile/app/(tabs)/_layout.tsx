import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useCart } from '../../src/cart/CartProvider';
import { colors } from '../../src/theme/tokens';

function TabLabel({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) {
  return (
    <Text
      style={{
        fontFamily: focused
          ? 'SourceSans3_600SemiBold'
          : 'SourceSans3_400Regular',
        fontSize: 12,
        color: focused ? colors.espresso : colors.muted,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.espresso,
        headerTitleStyle: {
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.parchment,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.espresso,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Casa Rústico',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Shop" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.terracotta,
            color: colors.white,
            fontFamily: 'SourceSans3_600SemiBold',
          },
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Cart" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="About" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
