import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Remote push token kaydını kapat — sadece yerel bildirim kullanıyoruz.
// Expo Go'da push token uyarısını önler.
Notifications.setAutoServerRegistrationEnabledAsync(false).catch(() => {});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleNotification(
  medId: string,
  medName: string,
  date: string,   // YYYY-MM-DD
  time: string,   // HH:MM
  language: 'tr' | 'en'
): Promise<string | null> {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const triggerDate = new Date(year, month - 1, day, hour, minute - 5, 0);

    // Geçmiş saatlere bildirim planlanmaz
    if (triggerDate <= new Date()) return null;

    const body =
      language === 'tr'
        ? `${medName} adlı ilacınızın saati gelmiştir`
        : `It's time to take your medication: ${medName}`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 MedGrowth',
        body,
        data: { medId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
