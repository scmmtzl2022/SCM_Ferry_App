import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

const ErrorComponent = ({ errormsg }) => {
  return (
    <View style={styles.container}>
      <Image style={styles.img} source={require('../../assets/waiting.png')} />
      <Text style={styles.errtxt}>{errormsg}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '75%',
  },
  errtxt: {
    color: 'red',
    padding: 20,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
  img: {
    width: 110,
    height: 110,
  },
});
export default ErrorComponent;
