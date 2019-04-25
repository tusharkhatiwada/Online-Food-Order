import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import SplashScreen from "react-native-splash-screen";

import Login from "./src/Components/Login";
import Orders from "./src/Components/Orders";
import Settings from "./src/Components/Settings";

const AppNavigator = createStackNavigator({
  Login: {
    screen: Login
  },
  Orders: {
    screen: Orders
  },
  Settings: {
    screen: Settings
  }
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
