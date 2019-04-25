import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default class Orders extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 30 }}>Orders Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
