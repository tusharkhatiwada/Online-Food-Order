import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import axios from "axios";
import { useNavigation } from "react-navigation-hooks";

const Orders = () => {
  const { navigate } = useNavigation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [loading, toggleLoading] = useState(true);
  useEffect(() => {
    fetchOrders();
  }, []);
  const fetchOrders = () => {
    toggleLoading(true);
    axios
      .get("/Orders/Page/1")
      .then(response => {
        if (response.status == 200) {
          const res = response.data;
          toggleLoading(false);
          setOrders(res);
          console.log("Orders: ", res);
        } else {
          toggleLoading(false);
          setError("Error getting list of orders");
        }
      })
      .catch(err => {
        console.log("Error getting Orders: ", err);
      });
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
          <Text style={styles.amount}>{`$ ${item.payment.totals.final}`}</Text>
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
        <FlatList
          data={orders}
          keyExtractor={_keyExtractor}
          renderItem={orderList}
          showsVerticalScrollIndicator={false}
        />
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
    alignItems: "center",
    justifyContent: "center"
  },
  amount: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "bold"
  }
});

export default Orders;
