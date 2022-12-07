import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  DeviceEventEmitter,
  TextInput,
} from 'react-native';
import { AuthContext } from "../context/AuthContext";
import { Provider } from 'react-native-paper';
import DropDown from '../components/DropDown';
import { BASE_URL } from '../Config';
import axios from 'axios';

const Separator = () => <View style={styles.separator} />;
let nameMsg = 'Name is required.';
let codeMsg = 'Password is required.';
let codeMatchMsg = 'Passwords is not correct.';

const DriverLogin = ({ navigation, route }) => {
  const { driverLogin } = React.useContext(AuthContext);
  const [code, setCode] = useState(null);
  const [nameErr, setnameErr] = useState(false);
  const [codeErr, setcodeErr] = useState(false);
  const [codeMatchErr, setcodeNotEqualErr] = useState(false);
  const [driverList, setdriverList] = useState([]);
  const [originalList, setoriginalList] = useState([]);
  const [selectedItem, setSelectedItem] = useState([])
  const [driverLoginPage, setDriverLoginPage] = useState(route?.params?.driverLoginStatus);
  const [driverItem, setDriverItem] = useState([])
  const onSelect = (item) => {
    setDriverItem(item.id);
    setSelectedItem(item);
  }
  async function getDriverList() {
    axios
      .get(`${BASE_URL}/drivers`)
      .then(response => {
        return response;
      })
      .then(response => {
        setoriginalList(response.data.driverList);
        const list = [];
        response.data.driverList.map(dist => {
          list.push({
            id: dist.id,
            name: dist.name,
          });
        });
        setdriverList(list);
      })
      .catch(error => {
        console.log(error);
      });
  }
  useEffect(() => {
    getDriverList();
    let isMounted = false;
    if (isMounted) {
      getDriverList = () => undefined;
    }
    return () => {
      DeviceEventEmitter.emit(`your listener`, {});
      getDriverList = () => {
        {
        }
      };
    };
  }, []);

  const onLogin = async () => {
    const selectedDriver = originalList.find(item => item.id === driverItem);
    return await driverLogin(selectedDriver.id, code);
  };

  const onSubmit = async () => {
    !driverItem ? setnameErr(true) : setnameErr(false);
    !code ? setcodeErr(true) : setcodeErr(false);

    if (driverItem && code) {
      const res = await onLogin();
      res ? setcodeNotEqualErr(false) : setcodeNotEqualErr(true);
    }
  };
  /**
   * Navigation to LoginScreen
   */
  const goToUserLogin = () => {
    navigation.navigate(`UserLogin`);
  }

  return (
    <Provider>
      <SafeAreaView style={styles.contianer}>
        <View style={styles.safeContainerStyle}>
          <DropDown
            value={selectedItem}
            data={driverList}
            onSelect={onSelect}
            driverLoginPage={driverLoginPage}
          />
          <Separator />
          {nameErr ? <Text style={styles.errtxt}>{nameMsg}</Text> : null}
          <Separator />
          <TextInput
            mode="flat"
            value={code}
            placeholder="Enter password"
            secureTextEntry={true}
            style={styles.input}
            onChangeText={code => setCode(code)}
          />
          {codeErr ? <Text style={styles.errtxt}>{codeMsg}</Text> : null}
          {codeMatchErr ? (
            <Text style={styles.errtxt}>{codeMatchMsg}</Text>
          ) : null}
          <Separator />
          <View
            style={{
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                ...styles.button02,
                marginVertical: 12,
              }}
              onPress={() => {
                onSubmit();
              }}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
          <Separator />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              justifyContent: 'center',
            }}>
            <Text>Are you an employee? </Text>
            <TouchableOpacity
              onPress={() => { goToUserLogin() }}>
              <Text style={styles.link}>Employee Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
    backgroundColor: '#edfaf6',
  },
  separator: {
    marginVertical: 10,
  },
  safeContainerStyle: {
    flex: 1,
    margin: 30,
    justifyContent: 'center',
  },
  errtxt: {
    color: 'red',
    padding: 0,
    margin: 0,
    marginVertical: 0,
    paddingVertical: 0,
  },
  input: {
    backgroundColor: 'white',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    borderRadius: 6,
    fontSize: 14,
    height: 44,
  },
  button02: {
    justifyContent: 'center',
    width: Dimensions.get('window').width / 2.2,
    backgroundColor: '#00c292',
    borderRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10,
    height: 50,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'SourceSerif4-Regular',
    padding: 0,
  },
  link: {
    color: 'blue',
  },
});

export default DriverLogin;