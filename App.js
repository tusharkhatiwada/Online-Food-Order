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

import Login from "./src/Components/Login";
import Orders from "./src/Components/Orders";
import OrderDetails from "./src/Components/Orders/details";
import Settings from "./src/Components/Settings";

import { Sentry } from 'react-native-sentry';

Sentry.config('https://f9b9477c69384f85b1e48f854f9c5678@sentry.io/1504247').install();


axios.defaults.baseURL = "https://foodordering.ca/api/Gateway";

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
  const navigator = useRef(null);
  useEffect(() => {
    SplashScreen.hide();
    getToken();
  });
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("@ccs_token");
      if (token !== null) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        navigator.current.dispatch(NavigationActions.navigate({ routeName: "Home" }));
      }
    } catch (e) {
      alert("App error token");
      // error reading value
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#db2230" />
      <AppContainer ref={navigator} />
    </SafeAreaView>
  );
};

export default App;
