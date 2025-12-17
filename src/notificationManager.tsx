export async function requestPermission() {
    return await Notification.requestPermission();
}

export function sendNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
        try {
            navigator.serviceWorker.getRegistration().then(function(reg) {
                if (reg) {
                    reg.showNotification(title, options);
                } else {
                    console.warn("No service worker registration found.");
                }
            });
        } catch (error) {
            console.error("Error showing notification:", error);
        }
        new Notification(title, options);
    } else {
        console.warn("Notification permission not granted.");
    }
}

