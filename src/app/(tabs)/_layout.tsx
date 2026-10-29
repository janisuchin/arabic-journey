import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { usePalette } from '@/state/hooks';
import { useProfiles } from '@/state/store';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Today', icon: 'sunny-outline' },
  { name: 'path', title: 'Path', icon: 'map-outline' },
  { name: 'practice', title: 'Practice', icon: 'barbell-outline' },
  { name: 'library', title: 'Library', icon: 'library-outline' },
  { name: 'me', title: 'Me', icon: 'person-circle-outline' },
];

export default function TabsLayout() {
  const c = usePalette();
  const currentId = useProfiles((s) => s.currentId);
  if (!currentId) return <Redirect href="/profiles" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border, minHeight: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarAccessibilityLabel: t.title,
            tabBarButtonTestID: `tab-${t.name}`,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} color={String(color)} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
