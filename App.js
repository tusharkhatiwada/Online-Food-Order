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
import Settings from "./src/Components/Settings";

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
    headerMode: "none"
  }
);
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
  Home: TabNavigator
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
