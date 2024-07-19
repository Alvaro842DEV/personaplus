import React from 'react'
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import {
    setNotificationChannelAsync,
    getPermissionsAsync,
    requestPermissionsAsync,
    setNotificationHandler,
    AndroidImportance,
    getExpoPushTokenAsync,
    scheduleNotificationAsync,
    cancelScheduledNotificationAsync
} from "expo-notifications";
import { termLog } from '@/app/DeveloperInterface';
import * as Constants from "expo-constants";
import { TFunction } from 'i18next';

setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        setNotificationChannelAsync('default', {
            name: 'default',
            importance: AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#32FF80FF',
        });
    }

    if (isDevice) {
        const { status: existingStatus } = await getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = await getExpoPushTokenAsync({
            projectId: Constants.default.easConfig?.projectId,
        });
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}

const useNotification = () => {

    const [expoPushToken, setExpoPushToken] = React.useState('');

    React.useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token.data);
            }
        });
    }, []);

    return expoPushToken
}

interface NotificationIdentifier {
    identifier: string;
}

const scheduledNotifications: NotificationIdentifier[] = [];

export const scheduleRandomNotifications = async (t: TFunction) => {
    const notificationMessages: string[] = t("cool_messages.all_done", {
        returnObjects: true,
    });

    const randomDelay = () => (Math.floor(Math.random() * 1800) + 1800) * 1000; // a random interval of 30-60 minutes, so user gets many reminders, but not too annoying


    for (let i = 0; i < 2; i++) {
        const randomMessage: string = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
        const trigger = {
            hour: Math.floor(Math.random() * 12) + 11,
            minute: Math.floor(Math.random() * 60),
            repeats: true,
        };

        const identifier = await scheduleNotificationAsync({
            content: {
                title: "Pending PersonaPlus objectives!",
                body: randomMessage,
            },
            trigger,
        });

        // Store the notification identifier
        scheduledNotifications.push({ identifier });

        await new Promise(resolve => setTimeout(resolve, randomDelay()));
        termLog(String(scheduledNotifications), "log");
        termLog("Scheduled Notis ENABLED", "log");
    }
};

export const cancelScheduledNotifications = async () => {
    for (const { identifier } of scheduledNotifications) {
        await cancelScheduledNotificationAsync(identifier);
    }

    scheduledNotifications.length = 0;
    termLog(String(scheduledNotifications), "log");
    termLog("Scheduled Notis DISABLED", "log");
};

export default useNotification
