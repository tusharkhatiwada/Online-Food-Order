import React, { useEffect, useState } from "react";
import { PermissionsAndroid, Alert } from "react-native";
import { BluetoothStatus } from "react-native-bluetooth-status";

export const NetworkContext = React.createContext({ isConnected: true, checkConnection: () => {} });

export const NetworkProvider = props => {
  const [isConnected, toggleIsConnected] = useState(true);

  useEffect(() => {
    requestPermission();
  }, []);
  useEffect(() => {
    getBluetoothState();
  }, []);

  const requestPermission = async () => {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ],
      {
        title: "Permission requested",
        message: "Food Order needs access to location"
      }
    );
  };

  const getBluetoothState = async () => {
    try {
      const isEnabled = await BluetoothStatus.state();
      toggleIsConnected(isEnabled);
      if (!isEnabled) {
        await Alert.alert(
          "Bluetooth disabled",
          "Please enable bluetooth first to perform this action."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkConnection = () => {
    getBluetoothState();
  };

  return (
    <NetworkContext.Provider value={{ isConnected, checkConnection }}>
      {props.children}
    </NetworkContext.Provider>
  );
};
