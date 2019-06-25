import React, { Component } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";

export default class PrintOrder extends Component {
  componentDidMount() {
    this.printOrder();
  }
  printOrder = async () => {
    try {
      await BluetoothEscposPrinter.printerInit();
    } catch (e) {
      Alert.alert("Error", "Error printing receipt");
    }
  };
  render() {
    return (
      <View>
        <Text>Print</Text>
      </View>
    );
  }
}
