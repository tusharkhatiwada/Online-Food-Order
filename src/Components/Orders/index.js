import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default class Orders extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Orders</Text>
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
