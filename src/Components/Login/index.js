import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default class Login extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Login</Text>
        <Button title="Go To Home" onPress={() => this.props.navigation.navigate("Home")} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
});
