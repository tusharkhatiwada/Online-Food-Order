import React, { useState, useEffect, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ToastAndroid
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-community/async-storage";
import { useNavigationParam, useNavigationEvents } from "react-navigation-hooks";
import axios from "axios";
// import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";
import BluetoothSerial from "react-native-bluetooth-serial";
import { Sentry } from "react-native-sentry";
import { table, getBorderCharacters } from "table";
import { EscPos } from "escpos-xml";
import chalk from "chalk";
import { useKeepAwake } from "expo-keep-awake";
import printReceipt from "../../helpers/printReceipt";

import { NetworkContext } from "../../helpers/networkProvider";

const OrderDetails = ({ navigation }) => {
  const networkStatus = useContext(NetworkContext);
  useKeepAwake();
  const id = useNavigationParam("id");
  const [loading, toggleLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    networkStatus.checkConnection();
  }, []);
  useEffect(() => {
    checkPrinterConnection();
  }, []);
  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const checkPrinterConnection = () => {
    BluetoothSerial.isConnected()
      .then(res => {
        console.log("Connection Status: ", res);
        if (!res) {
          autoConnectPrinter();
        }
      })
      .catch(err => {
        console.log("Error connection status: ", err.message);
      });
  };

  const autoConnectPrinter = async () => {
    try {
      const device = await AsyncStorage.getItem("@connectedDeviceId");
      if (device !== null) {
        const deviceId = JSON.parse(device);
        BluetoothSerial.connect(deviceId.id)
          .then(res => {
            console.log("Auto connect Success: ", res);
          })
          .catch(err => {
            console.log("Auto connect failed: ", err);
            navigator.current.dispatch(NavigationActions.navigate({ routeName: "SettingsScreen" }));
          });
      }
    } catch (error) {
      console.log("Unable to get device id: ", error);
    }
  };

  const fetchOrderDetails = () => {
    axios
      .get(`/Orders/Id/${id}`)
      .then(response => {
        if (response.status == 200) {
          const res = response.data;
          setOrderDetail(res);
          toggleLoading(false);
          navigation.setParams({
            print: () => printReceipt(res),
            checkBluetooth: () => networkStatus.checkConnection(),
            connectionStatus: networkStatus.isConnected
          });
        } else {
          toggleLoading(false);
          setError("Error getting order details");
        }
      })
      .catch(err => {
        console.log("Error getting Orders: ", err);
      });
  };
  const renderToppings = toppings => {
    const toppingsArray = Object.values(toppings);
    return toppingsArray.map(top => (
      <View key={top.id}>
        <Text style={{ fontWeight: "bold", color: "black" }}>{top.name}</Text>
        {top.chosen
          ? top.chosen.map(chosen => (
              <Text
                key={chosen.id}
                style={{ paddingLeft: 6, textTransform: "uppercase", fontSize: 12 }}
              >
                {chosen.quantity}X {chosen.name} ({parseFloat(chosen.final_cost)})
              </Text>
            ))
          : top.toppings.map(t => (
              <Text
                key={t.chosen.id}
                style={{ paddingLeft: 6, textTransform: "uppercase", fontSize: 12 }}
              >
                {t.topping} ({t.chosen.placement} {t.chosen.extra}) {parseFloat(t.chosen.cost)}
              </Text>
            ))}
      </View>
    ));
  };
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  } else if (loading && !orderDetail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#db2230" />
      </View>
    );
  } else {
    const items = orderDetail.data;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topContent}>
          <Text style={styles.orderType}>{`${
            orderDetail.type === "pickup" ? "TAKE-OUT" : "DELIVERY"
          } #${orderDetail.order_id}`}</Text>
          <View style={styles.addressContainer}>
            {orderDetail.location && (
              <Text style={styles.address}>{orderDetail.location.address}</Text>
            )}
            {orderDetail.location && (
              <Text style={styles.address}>{orderDetail.location.city}</Text>
            )}
            <Text style={styles.address}>
              {orderDetail.location && orderDetail.location.state}{" "}
              {orderDetail.location && orderDetail.location.zip}
            </Text>
            {orderDetail.location && (
              <Text style={styles.address}>{orderDetail.location.telephone}</Text>
            )}
          </View>
        </View>
        <View style={styles.hr} />
        <View style={styles.customerDetail}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, color: "black" }}>CUSTOMER:</Text>
            <Text style={{ fontSize: 16 }}>
              {orderDetail.customer.first} {orderDetail.customer.last}
            </Text>
            {orderDetail.customer.telephone && (
              <Text style={{ fontSize: 16 }}>{orderDetail.customer.telephone}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View>
              <Text style={{ fontSize: 18, color: "black" }}>Order Date:</Text>
              <Text style={{ fontSize: 16 }}>{orderDetail.local_date}</Text>
            </View>
            {orderDetail.payment.order_when.date && (
              <View>
                <Text style={{ fontSize: 18, color: "black" }}>Future Order:</Text>
                <Text style={{ fontSize: 16 }}>{orderDetail.payment.order_when.date}</Text>
              </View>
            )}
          </View>
        </View>
        <View>
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 18, color: "black" }}>PAYMENT METHOD:</Text>
            <Text style={{ fontSize: 16 }}>
              Pay in person {orderDetail.payment.method === "cod" && "(Delivery)"}
            </Text>
          </View>
          {orderDetail.payment.method === "cod" && (
            <View>
              <Text style={{ fontSize: 18, color: "black" }}>DELIVERY:</Text>
              <Text style={{ fontSize: 16 }}>
                {orderDetail.customer && orderDetail.customer.address.street_number}{" "}
                {orderDetail.customer && orderDetail.customer.address.street}
              </Text>
              {orderDetail.customer && (
                <Text style={{ fontSize: 16 }}>{orderDetail.customer.address.city}</Text>
              )}
              <Text style={{ fontSize: 16 }}>
                {orderDetail.customer && orderDetail.customer.address.state}{" "}
                {orderDetail.customer && orderDetail.customer.address.zipcode}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.hr} />
        <View style={styles.orderSummary}>
          <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", color: "black" }}>
            ORDER SUMMARY
          </Text>
          <View style={styles.summaryHeader}>
            <Text style={[styles.th, { flex: 1 }]}>Qty</Text>
            <Text style={[styles.th, { flex: 3 }]}>Item</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Totals</Text>
          </View>
          {items.map(item => {
            return (
              <View style={styles.summaryBody} key={item.cost.item.item_id}>
                <Text style={[styles.td, { flex: 1 }]}>{item.cost.quantity}</Text>
                <View style={{ flex: 3 }}>
                  <Text style={styles.td}>
                    {item.cost.item.item} ({parseFloat(item.cost.cost.final)})
                  </Text>
                  {item.cart.prices.map(cp => (
                    <View key={cp.info.id}>
                      {cp.info.name.length > 0 && (
                        <Text style={{ fontWeight: "bold", color: "black", paddingVertical: 8 }}>
                          ***{cp.info.name}*** {parseFloat(cp.info.cost)}
                        </Text>
                      )}
                      {renderToppings(cp.modules)}
                    </View>
                  ))}
                  {item.cost.item.note.length > 0 && (
                    <View>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "black",
                          paddingTop: 8,
                          paddingBottom: 3
                        }}
                      >
                        CUSTOMER NOTE
                      </Text>
                      <Text style={{ paddingLeft: 8 }}>{item.cost.item.note}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {Math.round(
                    parseFloat(item.cost.cost.final) * parseFloat(item.cost.quantity) * 100
                  ) / 100}
                </Text>
              </View>
            );
          })}
          <View style={styles.hr} />
          <View style={styles.summaryFooter}>
            <Text style={[styles.th, { flex: 1 }]} />
            <Text style={[styles.th, { flex: 3 }]}>SUBTOTAL</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
              {orderDetail.payment.totals.subtotal}
            </Text>
          </View>
          {orderDetail.payment.totals.discount != "0.00" && (
            <View style={styles.summaryFooter}>
              <Text style={[styles.th, { flex: 1 }]} />
              <Text style={[styles.th, { flex: 3 }]}>DISCOUNT</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
                {orderDetail.payment.totals.discount}
              </Text>
            </View>
          )}
          <View style={styles.summaryFooter}>
            <Text style={[styles.th, { flex: 1 }]} />
            <Text style={[styles.th, { flex: 3 }]}>TAX</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
              {orderDetail.payment.totals.tax}
            </Text>
          </View>
          {orderDetail.payment.totals.tip != "0.00" && (
            <View style={styles.summaryFooter}>
              <Text style={[styles.th, { flex: 1 }]} />
              <Text style={[styles.th, { flex: 3 }]}>TIPS</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
                {orderDetail.payment.totals.tip}
              </Text>
            </View>
          )}
          {orderDetail.payment.totals.fee.usage != "0.00" && (
            <View style={styles.summaryFooter}>
              <Text style={[styles.th, { flex: 1 }]} />
              <Text style={[styles.th, { flex: 3 }]}>CONVENIENCE FEE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
                {orderDetail.payment.totals.fee.usage}
              </Text>
            </View>
          )}
          <View style={styles.summaryFooter}>
            <Text style={[styles.th, { flex: 1 }]} />
            <Text style={[styles.th, { flex: 3 }]}>TOTAL</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
              {orderDetail.payment.totals.final}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
};

OrderDetails.navigationOptions = ({ navigation }) => {
  return {
    title: "Order Details",
    headerStyle: {
      backgroundColor: "rgba(219, 34, 48, 1)"
    },
    headerTitleContainerStyle: {
      backgroundColor: "rgba(219, 34, 48, 1)",
      elevation: 0,
      right: 0
    },
    headerTintColor: "#fff",
    headerLeft: (
      <Icon
        name="arrow-back"
        onPress={() => navigation.navigate("Home")}
        size={25}
        color="#FFFFFF"
        style={{ padding: 10 }}
      />
    ),
    headerRight: (
      <Icon
        name="print"
        onPress={() => {
          navigation.state.params.connectionStatus
            ? navigation.state.params.print()
            : navigation.state.params.checkBluetooth();
        }}
        size={25}
        color="#FFFFFF"
        style={{ padding: 10 }}
      />
    )
  };
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)"
  },
  error: {
    color: "firebrick",
    fontSize: 14,
    paddingVertical: 5,
    textAlign: "center"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  topContent: {
    justifyContent: "center",
    alignItems: "center"
  },
  orderType: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    paddingVertical: 10
  },
  addressContainer: {
    justifyContent: "center",
    alignItems: "center"
  },
  address: {
    textAlign: "center",
    fontSize: 16
  },
  hr: {
    marginVertical: 10,
    height: 1,
    backgroundColor: "dimgray"
  },
  customerDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 10
  },
  orderSummary: {
    marginVertical: 10
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: "#cfcfcf",
    borderTopWidth: 1,
    borderBottomColor: "#cfcfcf",
    borderBottomWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 3,
    marginVertical: 8
  },
  summaryBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 3
  },
  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 3
  },
  th: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black"
  },
  td: {
    fontSize: 16
  }
});

export default OrderDetails;
