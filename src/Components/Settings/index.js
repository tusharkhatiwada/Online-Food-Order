import React, { Component } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  DeviceEventEmitter,
  NativeEventEmitter,
  Switch,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  Alert
} from "react-native";
import {
  BluetoothEscposPrinter,
  BluetoothManager,
  BluetoothTscPrinter
} from "react-native-bluetooth-escpos-printer";
import Icon from "react-native-vector-icons/MaterialIcons";

var { height, width } = Dimensions.get("window");
export default class Settings extends Component {
  _listeners = [];

  static navigationOptions = ({ navigation }) => {
    return {
      title: "Bluetooth Printers",
      headerTitleContainerStyle: {
        backgroundColor: "rgba(219, 34, 48, 0.9)",
        elevation: 0,
        right: 0
      },
      headerTintColor: "#fff",
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam("scan")}>
          <Icon name="bluetooth-searching" color="white" size={30} />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {
        backgroundColor: "transparent",
        paddingHorizontal: 20
      }
    };
  };

  state = {
    devices: null,
    pairedDs: [],
    foundDs: [],
    bleOpened: true,
    loading: true,
    boundAddress: "",
    debugMsg: ""
  };

  componentDidMount() {
    this.props.navigation.setParams({
      scan: this._scan
    });
    BluetoothManager.isBluetoothEnabled().then(
      enabled => {
        if (Boolean(enabled)) {
          this._scan();
        }
        this.setState({
          bleOpened: Boolean(enabled),
          loading: false
        });
      },
      err => {
        err;
      }
    );

    if (Platform.OS === "ios") {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      this._listeners.push(
        bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, rsp => {
          this._deviceAlreadPaired(rsp);
        })
      );
      this._listeners.push(
        bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, rsp => {
          this._deviceFoundEvent(rsp);
        })
      );
      this._listeners.push(
        bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
          this.setState({
            name: "",
            boundAddress: ""
          });
        })
      );
    } else if (Platform.OS === "android") {
      this._listeners.push(
        DeviceEventEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, rsp => {
          this._deviceAlreadPaired(rsp);
        })
      );
      this._listeners.push(
        DeviceEventEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, rsp => {
          this._deviceFoundEvent(rsp);
        })
      );
      this._listeners.push(
        DeviceEventEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
          this.setState({
            name: "",
            boundAddress: ""
          });
        })
      );
      this._listeners.push(
        DeviceEventEmitter.addListener(BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, () => {
          ToastAndroid.show("Device Not Support Bluetooth !", ToastAndroid.LONG);
        })
      );
    }
  }

  componentWillUnmount() {
    for (let ls in this._listeners) {
      this._listeners[ls].remove();
    }
  }

  _scan = () => {
    this.setState({
      loading: true
    });
    BluetoothManager.scanDevices().then(
      s => {
        var ss = s;
        var found = ss.found;
        try {
          found = JSON.parse(found); //@FIX_it: the parse action too weired..
        } catch (e) {
          //ignore
        }
        var fds = this.state.foundDs;
        if (found && found.length) {
          fds = found;
        }
        const uniqueFound = this.removeDuplicates(fds, "address");
        this.setState({
          foundDs: uniqueFound,
          loading: false
        });
      },
      er => {
        this.setState({
          loading: false
        });
        console.log("error" + er);
      }
    );
  };

  _deviceAlreadPaired(rsp) {
    var ds = null;
    if (typeof rsp.devices == "object") {
      ds = rsp.devices;
    } else {
      try {
        ds = JSON.parse(rsp.devices);
      } catch (e) {}
    }
    if (ds && ds.length) {
      let pared = this.state.pairedDs;
      pared = pared.concat(ds || []);
      const uniquePaired = this.removeDuplicates(pared, "address");
      this.setState({
        pairedDs: uniquePaired
      });
    }
  }

  _deviceFoundEvent(rsp) {
    var r = null;
    try {
      if (typeof rsp.device == "object") {
        r = rsp.device;
      } else {
        r = JSON.parse(rsp.device);
      }
    } catch (e) {}
    if (r) {
      let found = this.state.foundDs || [];
      found.push(r);
      const uniqueFound = this.removeDuplicates(found, "address");
      this.setState({
        foundDs: uniqueFound
      });
    }
  }

  removeDuplicates = (arr, prop) => {
    let obj = {};
    return Object.keys(
      arr.reduce((prev, next) => {
        if (!obj[next[prop]]) obj[next[prop]] = next;
        return obj;
      }, obj)
    ).map(i => obj[i]);
  };

  _renderRow(rows, type) {
    let items = [];
    for (let i in rows) {
      let row = rows[i];
      if (row.address) {
        items.push(
          <View key={new Date().getTime() + i} style={styles.row}>
            <View style={{ flex: 2 }}>
              <Text numberOfLines={1} style={styles.name}>
                {row.name || "UNKNOWN"}
              </Text>
              <Text style={styles.address}>{row.address}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={[styles.pairBtn, { opacity: type === "paired" ? 0.8 : 1 }]}
                disabled={this.state.loading || type === "paired" ? true : false}
                onPress={() => this.pairDevice(row)}
              >
                <Text style={{ color: "white" }}>{type === "paired" ? "PAIRED" : "PAIR"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
    }
    return items;
  }

  pairDevice = row => {
    this.setState({
      loading: true
    });
    BluetoothManager.connect(row.address).then(
      s => {
        this.setState({
          loading: false,
          boundAddress: row.address,
          name: row.name || "UNKNOWN"
        });
      },
      e => {
        this.setState({
          loading: false
        });
        Alert.alert("Error", "Unable to pair with this device. Make sure this is the printer.");
      }
    );
  };
  renderEnableBluetooth = () => {
    Alert.alert(
      "Bluetooth OFF",
      "Bluetooth is turned off. Turn it ON.",
      [{ text: "TURN ON", onPress: () => this.enableBluetooth() }],
      { cancelable: true }
    );
  };

  enableBluetooth = () => {
    BluetoothManager.enableBluetooth().then(
      r => {
        var paired = [];
        if (r && r.length > 0) {
          for (var i = 0; i < r.length; i++) {
            try {
              paired.push(JSON.parse(r[i]));
            } catch (e) {
              //ignore
            }
          }
        }
        const uniquePaired = this.removeDuplicates(paired, "address");
        this.setState({
          bleOpened: true,
          loading: false,
          pairedDs: uniquePaired
        });
      },
      err => {
        this.setState({
          loading: false
        });
        Alert.alert("Error", err);
      }
    );
  };

  render() {
    const { pairedDs, foundDs, bleOpened, name } = this.state;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.connected}>
          <Text style={{ fontWeight: "500", color: "black" }}>Connected Printer: </Text>
          <Text style={{ color: "#343434" }}>{name ? name : "No Printers connected"}</Text>
        </View>
        {this._renderRow(pairedDs, "paired")}
        {this._renderRow(foundDs, "found")}
        {!bleOpened && this.renderEnableBluetooth()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
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
    backgroundColor: "#61C266",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  connected: {
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 10
  }
});
