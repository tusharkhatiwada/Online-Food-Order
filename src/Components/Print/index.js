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
      await BluetoothEscposPrinter.printerLeftSpace(0);

      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.setBlob(0);
      await BluetoothEscposPrinter.printText("Customer Contact Solutions\r\n", {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 1
      });
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
