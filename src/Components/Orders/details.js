import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigationParam, useNavigationEvents } from "react-navigation-hooks";
import axios from "axios";
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";
import { Sentry } from "react-native-sentry";

const OrderDetails = ({ navigation }) => {
  const id = useNavigationParam("id");
  const [loading, toggleLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const printOrder = orderDetail => {
    try {
      BluetoothEscposPrinter.printerInit();
      BluetoothEscposPrinter.printerLeftSpace(0);

      BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printText(
        `${orderDetail.type === "pickup" ? "TAKE-OUT" : "DELIVERY"}\r\n`,
        {
          encoding: "UTF-8",
          codepage: 0,
          widthtimes: 2,
          heigthtimes: 2,
          fonttype: 1
        }
      );
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printText(`#${orderDetail.order_id}\r\n`, {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 2,
        heigthtimes: 2,
        fonttype: 1
      });
      BluetoothEscposPrinter.setBlob(1);
      BluetoothEscposPrinter.printText(`${orderDetail.location.address}\r\n`, {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 1
      });
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printText(`${orderDetail.location.city}\r\n`, {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 1
      });
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printText(
        `${orderDetail.location.state} ${orderDetail.location.zip}\r\n`,
        {
          encoding: "UTF-8",
          codepage: 0,
          widthtimes: 1,
          heigthtimes: 1,
          fonttype: 1
        }
      );
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printText(`${orderDetail.location.telephone}\r\n`, {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 1
      });
      BluetoothEscposPrinter.printText("\r\n", {});
      BluetoothEscposPrinter.setBlob(1);
      BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      BluetoothEscposPrinter.printText("CUSTOMER\r\n", {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 1
      });
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      BluetoothEscposPrinter.printText(
        `${orderDetail.customer.first} ${orderDetail.customer.last}\r\n`,
        {
          encoding: "UTF-8",
          codepage: 0,
          widthtimes: 1,
          heigthtimes: 1,
          fonttype: 2
        }
      );
      BluetoothEscposPrinter.setBlob(0);
      BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      BluetoothEscposPrinter.printText(`${orderDetail.customer.telephone} \r\n`, {
        encoding: "UTF-8",
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1,
        fonttype: 2
      });
      BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
      let columnWidths = [5, 25, 6];
      BluetoothEscposPrinter.printColumn(
        columnWidths,
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.RIGHT
        ],
        ["QTY", "ITEM", "COST"],
        { encoding: "UTF-8", codepage: 0, widthtimes: 1, heigthtimes: 1, fonttype: 1 }
      );
      BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
      orderDetail.data.map(item => {
        BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT
          ],
          [item.cost.quantity, item.cost.item.item, item.cost.cost.final],
          { encoding: "UTF-8", codepage: 0, widthtimes: 1, heigthtimes: 1, fonttype: 2 }
        );
        BluetoothEscposPrinter.printText("\r\n", {});
        item.cart.prices.map(cp => {
          BluetoothEscposPrinter.setBlob(1);
          BluetoothEscposPrinter.printText("\r\n", {});
          BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
          BluetoothEscposPrinter.printText(`**${cp.info.name}**\r\n`, {
            encoding: "UTF-8",
            codepage: 0,
            widthtimes: 1,
            heigthtimes: 1,
            fonttype: 1
          });
          const toppingsArray = Object.values(cp.modules);
          if (toppingsArray.length > 0) {
            toppingsArray.map(top => {
              BluetoothEscposPrinter.printText("\r\n", {});
              BluetoothEscposPrinter.setBlob(0);
              BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
              BluetoothEscposPrinter.printText(`${top.name}: \r\n`, {
                encoding: "UTF-8",
                codepage: 0,
                widthtimes: 1,
                heigthtimes: 1,
                fonttype: 1
              });
              top.chosen
                ? top.chosen.map(chosen => {
                    BluetoothEscposPrinter.setBlob(0);
                    BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
                    BluetoothEscposPrinter.printText(`${chosen.quantity}X ${chosen.name}, \r\n`, {
                      encoding: "UTF-8",
                      codepage: 0,
                      widthtimes: 0.5,
                      heigthtimes: 0.5,
                      fonttype: 2
                    });
                  })
                : top.toppings.map(t => {
                    BluetoothEscposPrinter.setBlob(0);
                    BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
                    BluetoothEscposPrinter.printText(`${t.topping} (${t.chosen.placement}), \r\n`, {
                      encoding: "UTF-8",
                      codepage: 0,
                      widthtimes: 0.5,
                      heigthtimes: 0.5,
                      fonttype: 1
                    });
                  });
            });
          }
        });
        BluetoothEscposPrinter.printText("\r\n", {});
        BluetoothEscposPrinter.printColumn(
          [10, 15],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ["SUBTOTAL", `${orderDetail.payment.totals.subtotal}`],
          { encoding: "UTF-8", codepage: 0, widthtimes: 1, heigthtimes: 1, fonttype: 1 }
        );
        BluetoothEscposPrinter.printText("\r\n", {});
        BluetoothEscposPrinter.printColumn(
          [5, 20],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ["TAX", `${orderDetail.payment.totals.tax}`],
          { encoding: "UTF-8", codepage: 0, widthtimes: 1, heigthtimes: 1, fonttype: 1 }
        );
        BluetoothEscposPrinter.printText("\r\n", {});
        BluetoothEscposPrinter.setBlob(0);
        BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
        BluetoothEscposPrinter.printText("PAYMENT \r\n", {
          encoding: "UTF-8",
          codepage: 0,
          widthtimes: 1,
          heigthtimes: 1,
          fonttype: 2
        });

        BluetoothEscposPrinter.printText("\r\n", {});
        BluetoothEscposPrinter.printColumn(
          [8, 17],
          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
          ["TOTAL", `${orderDetail.payment.totals.final}`],
          { encoding: "UTF-8", codepage: 0, widthtimes: 1, heigthtimes: 1, fonttype: 1 }
        );
        BluetoothEscposPrinter.printText("\r\n", {});
        BluetoothEscposPrinter.setBlob(0);
        BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
        BluetoothEscposPrinter.printText(
          `Pay in person ${orderDetail.payment.method === "cod" ? "(Delivery)" : ""} \r\n`,
          { encoding: "UTF-8", codepage: 0, widthtimes: 1, heigthtimes: 1, fonttype: 2 }
        );
        BluetoothEscposPrinter.printText("\r\n", {});
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log("Error printing: ", e);
      Alert.alert("Error", "Error printing receipt");
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
          navigation.setParams({ print: () => printOrder(res) });
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
          <View style={styles.summaryFooter}>
            <Text style={[styles.th, { flex: 1 }]} />
            <Text style={[styles.th, { flex: 3 }]}>TAX</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
              {orderDetail.payment.totals.tax}
            </Text>
          </View>
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
        onPress={navigation.state.params.print}
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
