import PushNotification from "react-native-push-notification";

export default class NotifService {
  constructor(onNotification) {
    this.configure(onNotification);

    this.lastId = 0;
  }

  configure(onNotification) {
    PushNotification.configure({
      onNotification: onNotification,
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: true
    });
  }

  localNotif() {
    this.lastId++;
    PushNotification.localNotification({
      id: "" + this.lastId,
      ticker: "Food Order App",
      autoCancel: true,
      largeIcon: "ic_launcher",
      bigText: "A new order has been received",
      subText: "Custom Contact Solutions",
      vibrate: true,
      vibration: 1000,
      tag: "new_order",
      group: "newOrder",
      ongoing: false,

      alertAction: "view",
      category: null,
      userInfo: null,

      title: "New Order",
      message: "A new order has been received",
      playSound: true,
      soundName: "default",
      number: "10"
    });
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif() {
    PushNotification.cancelLocalNotifications({ id: "" + this.lastId });
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}
