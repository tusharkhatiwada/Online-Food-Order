import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default class Orders extends React.Component {
  render() {
    return (
      <WebView
        source={{ uri: "https://www.customcontactsolutions.com/" }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#db2230" />
          </View>
        )}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
