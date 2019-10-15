import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-community/async-storage";
import { NavigationActions } from "react-navigation";
import { useNavigation } from "react-navigation-hooks";

import logo from "../../assets/icon.png";

const Login = () => {
  const { navigate } = useNavigation();
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [loading, toggleLoading] = useState(false);

  const handleInputChange = (name, value) => {
    setInputs({ ...inputs, [name]: value });
  };

  const handleLogin = () => {
    toggleLoading(true);
    setError(null);
    axios
      .post(
        "/Login/login",
        {
          email: inputs.email,
          password: inputs.password
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(response => {
        const res = response.data;
        console.log("Token: ", res);
        if (res && res.token) {
          axios.defaults.headers.common["Content-Type"] = "application/json";
          storeToken(res.token);
        } else {
          setError("Error! Please try again");
          toggleLoading(false);
        }
      })
      .catch(err => {
        setError("Error! Please try again");
        toggleLoading(false);
        console.log("Error on login: ", { err });
      });
  };

  const storeToken = async token => {
    try {
      await AsyncStorage.setItem("@ccs_token", token);
      await toggleLoading(false);
      await navigate("Home");
    } catch (e) {
      setError("Error! Please try again");
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Image source={logo} resizeMethod="auto" resizeMode="contain" style={styles.logo} />
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          value={inputs.email}
          onChangeText={text => handleInputChange("email", text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={inputs.password}
          onChangeText={text => handleInputChange("password", text)}
          style={styles.input}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
          onPress={() => handleLogin()}
        >
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  },
  error: {
    color: "firebrick",
    fontSize: 14,
    paddingVertical: 5,
    textAlign: "center"
  }
});

export default Login;
