import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  ProgressBarAndroid
} from "react-native";
import BluetoothSerial from "react-native-bluetooth-serial";
import Icon from "react-native-vector-icons/MaterialIcons";

var { height, width } = Dimensions.get("window");
const Settings = ({ navigation }) => {
  const [isEnabled, toggleEnable] = useState(false);
  const [device, setDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [unpairedDevices, setUnpairedDevices] = useState([]);
  const [section, setSection] = useState(0);

  useEffect(() => {
    requestPermission();
  }, []);
  useEffect(() => {
    checkConnection();
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

  const checkConnection = () => {
    Promise.all([BluetoothSerial.isEnabled(), BluetoothSerial.list()]).then(values => {
      const [enabled, listedDevices] = values;
      toggleEnable(enabled);
      setDevices(listedDevices);
    });
    BluetoothSerial.on("bluetoothDisabled", () =>
      Alert.alert("Error", "Bluetooth is disabled. Please enable it.")
    );
    BluetoothSerial.on("error", err => console.log(`Error: ${err.message}`));
    BluetoothSerial.on("connectionLost", () => {
      if (device) {
        Alert.alert("Error", `Connection to device ${device.name} has been lost`);
      }
      setConnected(false);
    });
    navigation.setParams({ scanDevices: () => checkConnection() });
    discoverUnpaired();
  };

  const discoverUnpaired = () => {
    if (discovering) {
      return false;
    } else {
      setDiscovering(true);
      BluetoothSerial.discoverUnpairedDevices()
        .then(unpaired => {
          console.log("Unpaired: ", unpaired);
          setUnpairedDevices(unpaired);
          setDiscovering(false);
        })
        .catch(err => {
          console.log("Error", err.message);
        });
    }
  };

  const cancelDiscovery = () => {
    if (discovering) {
      BluetoothSerial.cancelDiscovery()
        .then(() => {
          setDiscovering(false);
        })
        .catch(err => {
          console.log("Error", err.message);
        });
    }
  };

  const pairDevice = device => {
    console.log("Pairing: ", device);
    setPairing(true);
    BluetoothSerial.pairDevice(device.id)
      .then(paired => {
        console.log("Paired: ", paired);
        if (paired) {
          setPairing(false);
          // Toast.showShortBottom(`Device ${device.name} paired successfully`)
          const pairedDevices = devices;
          pairedDevices.push(device);
          setDevices(pairedDevices);
          setUnpairedDevices(unpairedDevices.filter(d => d.id !== device.id));
        } else {
          setPairing(false);
          Alert.alert("Pairing Failed", `Device ${device.name} pairing failed`);
        }
      })
      .catch(err => {
        setPairing(false);
        console.log(err.message);
      });
  };

  const connect = device => {
    console.log("Connect: ", device);
    setConnecting(true);
    BluetoothSerial.connect(device.id)
      .then(res => {
        console.log("Connected: ", res);
        setDevice(device);
        setConnected(true);
        setConnecting(false);
      })
      .catch(err => {
        setConnecting(false);
        Alert.alert(
          "Connection Failed",
          "Unable to connect to device. Please check if the device is switched ON and is inside range."
        );
        console.log("Connection Failed: ", err.message);
      });
  };

  const disconnect = () => {
    BluetoothSerial.disconnect()
      .then(() => setConnected(false))
      .catch(err => console.log(err.message));
  };

  const toggleConnect = value => {
    if (value === true && device) {
      connect(device);
    } else {
      disconnect();
    }
  };

  const onDevicePress = device => {
    if (section === 0) {
      connect(device);
    } else {
      pairDevice(device);
    }
  };

  const _renderRow = (rows, type) => {
    let items = [];
    return rows.map(row => {
      return (
        <View key={row.id} style={styles.row}>
          <View style={{ flex: 2 }}>
            {type === "paired" && (
              <Text
                style={{
                  fontSize: 10,
                  color: "white",
                  backgroundColor: "#61C266",
                  padding: 5,
                  width: 50,
                  borderRadius: 30,
                  textAlign: "center"
                }}
              >
                Paired
              </Text>
            )}
            <Text numberOfLines={1} style={styles.name}>
              {row.name || "UNKNOWN"}
            </Text>
            <Text style={styles.address}>{row.id}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {type === "paired" ? (
              <TouchableOpacity
                style={[styles.pairBtn, { backgroundColor: "rgba(219, 34, 48, 1)" }]}
                onPress={() => connect(row)}
              >
                <Text style={{ color: "white" }}>CONNECT</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.pairBtn} onPress={() => pairDevice(row)}>
                <Text style={{ color: "white" }}>PAIR</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    });
    return items;
  };
  return (
    <ScrollView style={styles.container}>
      {(connecting || discovering || pairing) && (
        <View
          style={{
            padding: 0,
            margin: 0
          }}
        >
          <ProgressBarAndroid
            animating={connecting || discovering || pairing}
            styleAttr="Horizontal"
            color="#db2230"
          />
        </View>
      )}
      <View style={styles.connected}>
        <Text style={{ fontWeight: "500", color: "black" }}>Connected Printer: </Text>
        <Text style={{ color: "#343434" }}>{device ? device.name : "No Printers connected"}</Text>
      </View>
      {_renderRow(devices, "paired")}
      {_renderRow(unpairedDevices, "found")}
    </ScrollView>
  );
};

Settings.navigationOptions = ({ navigation }) => {
  return {
    title: "Bluetooth Printers",
    headerTitleContainerStyle: {
      backgroundColor: "rgba(219, 34, 48, 1)",
      elevation: 0,
      right: 0
    },
    headerTintColor: "#fff",
    headerRight: (
      <TouchableOpacity onPress={navigation.getParam("scanDevices")}>
        <Icon name="bluetooth-searching" color="white" size={30} />
      </TouchableOpacity>
    ),
    headerRightContainerStyle: {
      backgroundColor: "transparent",
      paddingHorizontal: 20
    }
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    marginTop: 0,
    paddingTop: 0
  },

  title: {
    width: width,
    backgroundColor: "#eee",
    color: "#232323",
    paddingLeft: 8,
    paddingVertical: 4,
    textAlign: "left"
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#efefef",
    padding: 20,
    marginVertical: 2
  },
  name: {
    color: "#343434",
    fontSize: 18,
    fontWeight: "500",
    paddingRight: 15
  },
  address: {
    color: "dimgray",
    fontSize: 12
  },
  pairBtn: {
    marginHorizontal: 3,
    backgroundColor: "#61C266",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    width: 120
  },
  connected: {
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 10
  },
  loadingContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default Settings;
