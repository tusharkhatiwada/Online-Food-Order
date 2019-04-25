import React, { Component } from "react";
import {
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import SplashScreen from "react-native-splash-screen";
import Icon from "react-native-vector-icons/MaterialIcons";

import Login from "./src/Components/Login";
import Orders from "./src/Components/Orders";
import Settings from "./src/Components/Settings";

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
const SettingsStack = createStackNavigator(
  {
    SettingsScreen: Settings
  },
  {
    headerMode: "none"
  }
);

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

export default class App extends Component {
  componentDidMount() {
    SplashScreen.hide();
  }
  render() {
    return <AppContainer />;
  }
}
