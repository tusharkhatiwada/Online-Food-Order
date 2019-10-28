import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from "react-native";
import axios from "axios";
import { useNavigation } from "react-navigation-hooks";
import difference from "lodash/difference";
import AsyncStorage from "@react-native-community/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import { useKeepAwake } from "expo-keep-awake";
import values from "lodash/values";
import { Sentry } from "react-native-sentry";
import Base64 from "Base64";
import CryptoJS from "crypto-js";

import NotifService from "../../../NotifService";

import { useInterval } from "../../helpers/useInterval";
import { fetchOrderDetails } from "../../helpers/printReceipt";
import { NetworkContext } from "../../helpers/networkProvider";

const Orders = () => {
  useKeepAwake();
  const netInfo = useNetInfo();
  const { navigate } = useNavigation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [loading, toggleLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  // const notif = new NotifService(onNotif);
  useInterval(() => {
    fetchOrders();
  }, 30000);
  useEffect(() => {
    fetchOrders(false);
  }, []);
  // const onNotif = notif => {
  //   console.log(notif.title, notif.message);
  // };
  const fetchOrders = async (poll = true) => {
    const token = await AsyncStorage.getItem("@ccs_token");
    let encode = Base64.btoa(`WEB;${Math.floor(Date.now() / 1000)};GET;/Orders/1/50`);
    let digest = CryptoJS.HmacSHA256(encode, "d80b301b98c1f309351e36a9").toString();
    !poll && toggleLoading(true);
    axios({
      method: "GET",
      url: "/Orders/1/50",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer WEB_${token};${Math.floor(Date.now() / 1000)};${digest}`
      },
      data: {}
    })
      .then(response => {
        if (response.status == 200) {
          const res = values(response.data);
          const ids = [];
          for (let i in res) {
            ids.push(res[i].id);
          }
          const distinctIds = [...new Set(ids)];
          console.log("Orders: ", res);
          !poll && toggleLoading(false);
          setOrders(res);
          if (poll) {
            getOrdersFromDb(distinctIds);
          } else {
            addOrdersToDb(distinctIds);
          }
        } else {
          toggleLoading(false);
          setError("Error getting list of orders");
        }
      })
      .catch(err => {
        console.log("Error getting Orders: ", { err }, JSON.stringify(err));
        Sentry.captureException(JSON.stringify(err));
        toggleLoading(false);
        setError("Error getting list of orders");
      });
  };
  const getOrdersFromDb = async orderIds => {
    try {
      const ids = await AsyncStorage.getItem("@orderIds");
      const idsFromDb = JSON.parse(ids);
      const differentId = difference(orderIds, idsFromDb);
      if (differentId.length > 0) {
        for (let i in differentId) {
          // Call notification
          notif.localNotif();
          fetchOrderDetails(differentId[i]);
        }
      }
      addOrdersToDb(orderIds);
    } catch (e) {
      console.error("Error getting order ids from db");
    }
  };
  const addOrdersToDb = async distinctIds => {
    const ids = JSON.stringify(distinctIds);
    try {
      await AsyncStorage.removeItem("@orderIds");
      await AsyncStorage.setItem("@orderIds", ids);
    } catch (e) {
      console.error("Error saving data: ", e);
    }
  };
  const _keyExtractor = (item, index) => {
    return item.id;
  };
  const orderList = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigate("OrderDetails", { id: item.id })}
        style={styles.list}
      >
        <View style={styles.idInfo}>
          <Text style={styles.id}>{`# ${item.order_id}`}</Text>
          <Text
            style={[
              styles.type,
              { backgroundColor: item.type === "delivery" ? "#28A745" : "#1975ef" }
            ]}
          >
            {item.type}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customer}>{`${item.customer.first} ${item.customer.last}`}</Text>
          <Text style={styles.phone}>{`${item.customer.telephone}`}</Text>
        </View>
        <View style={styles.paymentInfo}>
          <Text
            allowFontScaling={false}
            style={styles.amount}
          >{`$ ${item.payment.totals.final}`}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#db2230" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {error ? (
          <Text>{error}</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={_keyExtractor}
            renderItem={orderList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: "whitesmoke"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  list: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 15,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 5
  },
  idInfo: {
    flex: 1
  },
  id: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18
  },
  type: {
    flex: 1,
    width: 55,
    fontSize: 10,
    padding: 3,
    borderRadius: 15,
    color: "#FFFFFF",
    textAlign: "center"
  },
  customerInfo: {
    flex: 2
  },
  customer: {
    color: "#000000",
    fontSize: 18
  },
  paymentInfo: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center"
  },
  amount: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "bold"
  }
});

export default Orders;
