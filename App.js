import React, { Component } from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";

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
  render() {
    return <AppContainer />;
  }
}
