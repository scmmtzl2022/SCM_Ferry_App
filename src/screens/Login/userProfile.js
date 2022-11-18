import React, { useContext } from 'react';
import {
  Text,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';


import { Provider } from 'react-native-paper';
import { AuthContext } from "../../hooks/context/Context";
import { LoginStyle } from "./login.style";


const UserProfileScreen = ({ navigation }) => {

  const { logout } = useContext(AuthContext);
  const Separator = () => <View style={LoginStyle.separator} />;

  const onLoginUser = () => {
    console.log("logout!!")
    logout()
  };

  return (
    <Provider>
      <View style={LoginStyle.container}>
        <View style={LoginStyle.wrapper}>
          <Image
            source={require('../../../assets/welcome.png')}
            style={LoginStyle.image2}
          />

          <Separator />
          <View style={LoginStyle.safeContainerStyle}>
          </View>
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
                onLoginUser()
              }}>
              <Text style={LoginStyle.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Provider>
  );
};

export default UserProfileScreen;
