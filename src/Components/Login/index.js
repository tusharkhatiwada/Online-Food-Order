import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from "react-native";

import logo from "../../assets/icon.png";

export default class Login extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.loginBox}>
          <Image source={logo} resizeMethod="auto" resizeMode="contain" style={styles.logo} />
          <TextInput placeholder="Username" autoCapitalize="none" style={styles.input} />
          <TextInput placeholder="Password" secureTextEntry style={styles.input} />
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.props.navigation.navigate("Home")}
          >
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  logo: {
    height: "40%",
    alignSelf: "center"
  },
  loginBox: {
    width: "85%",
    padding: 20,
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "rgba(219,34,48,0.05)",
    borderWidth: 1,
    borderColor: "rgba(219,34,48,0.1)"
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.3)",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 5
  },
  button: {
    height: 50,
    backgroundColor: "#db2230",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },
  btnText: {
    color: "white",
    fontSize: 20
  }
});
