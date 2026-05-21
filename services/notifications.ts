import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function agendarLembrete(
  title: string,
  body: string,
  date: Date
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { date },
  });
  return id;
}

export async function cancelarLembrete(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}
