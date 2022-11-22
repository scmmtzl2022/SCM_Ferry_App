import React, { useContext, useState } from 'react';
import {
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';

import { Provider } from 'react-native-paper';
import DropDown from '../../components/DropDown';
import { AuthContext } from "../../hooks/context/Context";
import { CommonStyle} from "./common.style";

let loginMsg = 'Login id is required.';
let companyNameMsg = 'Company name is required.';
let codeMsg = 'Password is required.';
let codeMatchMsg = 'Login ID or Password is not correct.';
let company = [{ id: 1, name: 'SCM' }, { id: 2, name: 'CGM' }]
const UserLoginScreen = () => {
  const [loginId, setloginId] = useState(null);
  const [loginIDErr, setloginIdErr] = useState(false);
  const [password, setPassword] = useState(null);
  const [passwordErr, setPasswordErr] = useState(false);
  const { login } = useContext(AuthContext);
  const [companyName, setcompanyName] = useState([]);
  const [companyNameErr, setcompanyNameErr] = useState(false);
  const [code, setcodeErr] = useState(false);
  const [codeMatchErr, setcodeNotEqualErr] = useState(false);
  const Separator = () => <View style={CommonStyle.separator} />;
  const [selectedItem, setSelectedItem] = useState(null)
  const onSelect = (item) => {
    setcompanyName(item);
    setSelectedItem(item);
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
      if (res) {
        setcodeNotEqualErr(false);
      }
      else {
        setcodeNotEqualErr(true);
      }
    }
  }

  return (
    <Provider>
      <View style={CommonStyle.container}>
        <Text style={CommonStyle.titletxt}>Welcome</Text>
        <View style={CommonStyle.wrapper}>
          <Image
            source={require('../../../assets/welcome.png')}
            style={CommonStyle.image2}
          />
          <Separator />
          {codeMatchErr ? (
            <Text style={CommonStyle.errtxt}>{codeMatchMsg}</Text>
          ) : null}  
          <Separator />        
          <TextInput
            style={CommonStyle.textboxInput}
            value={loginId}
            placeholder="Login ID"
            onChangeText={text => setloginId(text)}
          />
          {loginIDErr ? <Text style={CommonStyle.errtxt}>{loginMsg}</Text> : null}
          <Separator />
          <TextInput
            style={CommonStyle.textboxInput}
            value={password}
            placeholder="Enter password"
            onChangeText={text => setPassword(text)}
            secureTextEntry
          />
          {passwordErr ? <Text style={CommonStyle.errtxt}>{codeMsg}</Text> : null}
          <Separator />
          <View style={CommonStyle.safeContainerStyle}>
            <DropDown
              value={selectedItem}
              data={company}
              onSelect={onSelect}
            />
          </View>
          {companyNameErr ? (
            <Text style={CommonStyle.errtxt}>{companyNameMsg}</Text>
          ) : null}
          <View
            style={{
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                ...CommonStyle.button02,
                marginVertical: 10,
              }}
              onPress={() => {
                onSubmitUser();
              }}>
              <Text style={CommonStyle.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Provider>
  );
};

export default UserLoginScreen;
