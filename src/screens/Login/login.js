import React, {useContext, useState} from 'react';
import {
  Text,
  TextInput,
  Image,
  Dimensions,
  TouchableOpacity,
  View,
  LoginStyleheet,
} from 'react-native';

import {Provider} from 'react-native-paper';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';
import DropDown from '../../components/DropDown';
import {AuthContext} from "../../hooks/context/Context";
import { LoginStyle } from "./login.style";

let loginMsg = 'Login id is required.';
let companyNameMsg = 'Company name is required.';
let codeMsg = 'Password is required.';
let codeMatchMsg = 'Password is not correct.';
let company = [{id: 1, name: 'SCM'}, {id: 2, name: 'CGM'}]
const UserLoginScreen = ({navigation}) => {
  const [loginId, setloginId] = useState(null);
  const [loginIDErr, setloginIdErr] = useState(false);
  const [password, setPassword] = useState(null);
  const [passwordErr, setPasswordErr] = useState(false);
  const {login} = useContext(AuthContext);
  const [showcompanyname, setShowCompanyName] = useState(false);
  const [companyName, setcompanyName] = useState([]);
  const [companyNameErr, setcompanyNameErr] = useState(false);
  const [code, setcodeErr] = useState(false);
  const [codeMatchErr, setcodeNotEqualErr] = useState(false);
  const Separator = () => <View style={LoginStyle.separator} />;
  const [selectedItem, setSelectedItem] = useState(null)
  const onSelect = (item) => {
    setcompanyName(item)
  }

  const onLoginUser = () => {
    var response = login(loginId, password, companyName?.name);
    return response;
  };

  let onSubmitUser = async () => {
    !loginId ? setloginIdErr(true) : setloginIdErr(false);
    !password ? setPasswordErr(true) : setPasswordErr(false);
    !companyName?.name ? setcompanyNameErr(true) : setcompanyNameErr(false);
    !code ? setcodeErr(true) : setcodeErr(false);

    if (loginId && password && companyName?.name) {
      const res = await onLoginUser();
      if(res){
        setcodeNotEqualErr(false);
      }
      else {
        setcodeNotEqualErr(true);
      }
      }
    }
  const goToUserLogin = () => {
    navigation.navigate('DriverLogin');
}    
  return (
    <Provider>
      <View style={LoginStyle.container}>
        <Text style={LoginStyle.titletxt}>Welcome</Text>
        <View style={LoginStyle.wrapper}>
          <Image
            source={require('../../../assets/welcome.png')}
            style={LoginStyle.image2}
          />
          <TextInput
            style={LoginStyle.textboxInput}
            value={loginId}
            placeholder="Login ID"
            onChangeText={text => setloginId(text)}
          />
          {loginIDErr ? <Text style={LoginStyle.errtxt}>{loginMsg}</Text> : null}
          <Separator />
          <TextInput
            style={LoginStyle.textboxInput}
            value={password}
            placeholder="Enter password"
            onChangeText={text => setPassword(text)}
            secureTextEntry
          />
          {passwordErr ? <Text style={LoginStyle.errtxt}>{codeMsg}</Text> : null}
          {codeMatchErr ? (
            <Text style={LoginStyle.errtxt}>{codeMatchMsg}</Text>
          ) : null}
          <Separator />
          <View style={LoginStyle.safeContainerStyle}>
            <DropDown
              value={selectedItem}
              data={company}
              onSelect={onSelect}
            />
          </View>
          {companyNameErr ? (
            <Text style={LoginStyle.errtxt}>{companyNameMsg}</Text>
          ) : null}
          <View
            style={{
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                ...LoginStyle.button02,
                marginVertical: 10,
              }}
              onPress={() => {
                onSubmitUser();
              }}>
              <Text style={LoginStyle.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text>Are you a driver? </Text>
              <TouchableOpacity
                onPress={() => goToUserLogin()}>
                <Text style={LoginStyle.link}>Driver Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Provider>
  );
};

export default UserLoginScreen;
