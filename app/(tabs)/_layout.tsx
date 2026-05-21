import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="manutencoes" />
      <Tabs.Screen name="agendamento" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
