import React, { useEffect, useRef } from "react";
import { StatusBar } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator,
  createAppContainer,
  SafeAreaView,
  NavigationActions
} from "react-navigation";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import SplashScreen from "react-native-splash-screen";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import { useKeepAwake } from "expo-keep-awake";
import BluetoothSerial from "react-native-bluetooth-serial";
import * as Crypto from "expo-crypto";
import Base64 from "Base64";
import CryptoJS from "crypto-js";
import utf8 from "utf8";

import { NetworkProvider } from "./src/helpers/networkProvider";

import Login from "./src/Components/Login";
import Orders from "./src/Components/Orders";
import OrderDetails from "./src/Components/Orders/details";
import Settings from "./src/Components/Settings";

import { Sentry } from "react-native-sentry";

Sentry.config("https://f9b9477c69384f85b1e48f854f9c5678@sentry.io/1504247").install();

axios.defaults.baseURL = "https://foodordering.ca/api.14";

const LoginStack = createStackNavigator(
  {
    LoginScreen: Login
  },
  {
    headerMode: "none"
  }
);
const OrdersStack = createStackNavigator(
  {
    OrdersScreen: Orders
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      title: "Orders",
      headerStyle: {
        backgroundColor: "rgba(219, 34, 48, 1)"
      },
      headerTitleContainerStyle: {
        backgroundColor: "rgba(219, 34, 48, 1)",
        elevation: 0,
        right: 0
      },
      headerTintColor: "#fff"
    })
  }
);
const OrderDetailsStack = createStackNavigator({
  OrderDetails: OrderDetails
});
const SettingsStack = createStackNavigator({
  SettingsScreen: Settings
});

const TabNavigator = createMaterialBottomTabNavigator(
  {
    Orders: OrdersStack,
    Settings: SettingsStack
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Icon;
        let iconName;
        if (routeName === "Orders") {
          iconName = `receipt`;
        } else if (routeName === "Settings") {
          iconName = `settings`;
        } else {
          iconName = `done`;
        }
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      }
    }),
    labeled: true,
    activeColor: "#ffffff",
    barStyle: {
      backgroundColor: "#db2230"
    }
  }
);

const AppNavigator = createSwitchNavigator({
  Auth: LoginStack,
  Home: TabNavigator,
  OrderDetailsStack: OrderDetailsStack
});

const AppContainer = createAppContainer(AppNavigator);

const App = () => {
  useKeepAwake();
  const navigator = useRef(null);
  useEffect(() => {
    SplashScreen.hide();
    getToken();
    autoConnectPrinter();
  });

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("@ccs_token"); // token = 3808bfe5-7efd-4fcc-b314-5d7420b694f5  (from the login response)
      if (token !== null) {
        let encode = Base64.btoa(`WEB;${Math.floor(Date.now() / 1000)};GET;/Orders/1`); // Base64 Encoding. Output: V0VCOzE1NzExNTIzNzM4MzE7R0VUOy9PcmRlcnMvMQ==
        let digest = CryptoJS.HmacSHA256(encode, "d80b301b98c1f309351e36a9").toString(); // sha256 hash the encoded output with a secret key. The secret is from the API titled Mobile App on Developers section. Output: 75a255586e9d9e8a5f7ce0b3de89e1651c92c3c4adb5e2d2a66ebf90e602dad6
        console.log("Crypto: ", digest, token, Math.floor(Date.now() / 1000), Date.now());
        axios.defaults.headers.common["Content-Type"] = "application/json";
        axios.defaults.headers.common["Authorization"] = `Bearer WEB_${token};${Math.floor(
          Date.now() / 1000
        )};${digest}`; // Authorization header here. OutPut: Bearer WEB_3808bfe5-7efd-4fcc-b314-5d7420b694f5;1571152566918;75a255586e9d9e8a5f7ce0b3de89e1651c92c3c4adb5e2d2a66ebf90e602dad6
        navigator.current.dispatch(NavigationActions.navigate({ routeName: "Home" }));
      }
    } catch (e) {
      console.log("Error on app.js: ", { e });
      // error reading value
    }
  };
  const autoConnectPrinter = async () => {
    try {
      const device = await AsyncStorage.getItem("@connectedDeviceId");
      if (device !== null) {
        const deviceId = JSON.parse(device);
        BluetoothSerial.connect(deviceId.id)
          .then(res => {
            console.log("Auto connect Success: ", res);
          })
          .catch(err => {
            console.log("Auto connect failed: ", err);
            navigator.current.dispatch(NavigationActions.navigate({ routeName: "SettingsScreen" }));
          });
      }
    } catch (error) {
      console.log("Unable to get device id: ", error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#db2230" />
      <NetworkProvider>
        <AppContainer ref={navigator} />
      </NetworkProvider>
    </SafeAreaView>
  );
};

export default App;
