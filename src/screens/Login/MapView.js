import React, { useState, useContext } from 'react';
import { StyleSheet, SafeAreaView, View, Image, Text, TouchableOpacity, Alert } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import qs from 'qs';
import moment from 'moment';
import { AuthContext } from "../../hooks/context/Context";
import { LoginStyle } from "./login.style";

MapboxGL.setAccessToken('pk.eyJ1IjoibWF5dGh1emFybGluIiwiYSI6ImNsOTgwYmptNDJqaG4zdnFtMGZkOWdueHQifQ.IN2f_fxmhMtT8RhqnOclrg');
const MapView = () => {
  let [deslocation, setLocation] = useState(null);
  let [responseToken, setResponseToken] = useState(null);
  let GMTstyle = moment().utc();
  let current = GMTstyle.format('YYYY-MM-DD hh:mm:ss');
  let _camera;
  const { logout } = useContext(AuthContext);
  /**
   * Get access token
   */
  const getAccessToken = () => {
    const dataToken = {
      'method': 'jimi.oauth.token.get',
      'timestamp': current,
      'app_key': '8FB345B8693CCD00E97951CC35B1045A',
      'sign_method': 'md5',
      'v': 0.9,
      'format': 'json',
      'user_id': 'cityapiuser',
      'user_pwd_md5': '21218cca77804d2ba1922c33e0151105',
      'expires_in': 7200,
    };
    console.log("data Get Access :", dataToken);
    const getOption = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(dataToken),
      url: 'https://hk-open.tracksolidpro.com/route/rest',
    };
    console.log("response token!!");

    axios(getOption).then(res => {
      console.log("Token response :", res);
      console.log("Token response  res.data :", res.data.result.accessToken);
      setResponseToken(res.data.result.accessToken);

      console.log("current ", current);
      console.log("responseToken ", responseToken);

      const data = {
        'method': 'jimi.device.location.get',
        'timestamp': current,
        'app_key': '8FB345B8693CCD00E97951CC35B1045A',
        'sign_method': 'md5',
        'v': 0.9,
        'format': 'json',
        'access_token': res.data.result.accessToken,
        'imeis': 865784052487926,
        'map_type': 'GOOGLE',
      };
      console.log("data :", data);
      const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: 'https://hk-open.tracksolidpro.com/route/rest',
      };
      console.log("response!!");
      setInterval(() => {
        axios(options).then(res => {
          console.log(res.data);
          console.log([res.data.result[0].lng, res.data.result[0].lat]);
          setLocation([res.data.result[0].lng, res.data.result[0].lat]);
        })
          .catch(err => {
            console.log("Device location error :", err)
          })
      }, 5000);
    })
      .catch(err => {
        console.log("Request token request error :", err)
      })

  }

  /**
   * Zoom button
   */
  const centeringButtonPress = () => {
    _camera !== undefined &&
      _camera?.flyTo(
        deslocation?.length > 0 ? deslocation : [96.14965243954374, 16.798741608382194],
        1000,
      );
  };
  
  React.useEffect(() => {
    // getAccessToken();
    centeringButtonPress();
  }, []);

  const stopPress = () => {
    console.log("logout!!")
    logout();
  };
  const handleStop = async () => {
    return Alert.alert(
      'မြေပုံမှထွက်ရန်',
      'မြေပုံမှထွက်မှာသေချာပါသလား။',
      [
        {
          text: 'မထွက်ပါ',
          onPress: () => {},
        },
        {
          text: 'ထွက်မည်',
          onPress: () => {
            stopPress();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex}>
        <MapboxGL.MapView style={styles.map}
          logoEnabled={false}
          compassEnabled={false}
          zoomEnabled={true}
          onDidFinishRenderingMapFully={() => setLoading(false)}
          zoomLevel={13}
        >
          <MapboxGL.Camera
            zoomLevel={14}
            animationMode="flyTo"
            animationDuration={1500}
            centerCoordinate={
              deslocation?.length > 0 ? deslocation : [96.14965243954374, 16.798741608382194]
            }
            followUserLocation={false}
            defaultSettings={{
              centerCoordinate:
                deslocation?.length > 0 ? deslocation : [96.14965243954374, 16.798741608382194],
              followUserLocation: true,
              followUserMode: MapboxGL.UserTrackingModes.Follow,
            }}
            ref={camera => (_camera = camera)}
          />
          {console.log("deslocation ", deslocation)}
          <MapboxGL.MarkerView
            anchor={{ x: 0.5, y: 1 }}
            title="This is a title"
            description="This is a description"
            key={Math.random()}
            coordinate={
              deslocation?.length > 0 ? deslocation : [96.14965243954374, 16.798741608382194]
            }>
            <View>
              <Image
                testID="car-location{renderModal()}"
                style={styles.car_location}
                source={require('../../../assets/car_location.png')}
              />
            </View>
          </MapboxGL.MarkerView>  
        </MapboxGL.MapView>
        <View
            style={{
              alignItems: 'flex-end',
            }}>
            <TouchableOpacity
              style={{
                ...LoginStyle.button02,
                marginVertical: 10,
              }}
              onPress={() => {
                handleStop()
              }}>
              <Text style={LoginStyle.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: 'flex-start',
            }}>
            <TouchableOpacity
              style={{
                ...LoginStyle.button02,
                marginVertical: -60,
              }}
              onPress={() => {
                centeringButtonPress()
              }}>
              <Text style={LoginStyle.buttonText}>Zoom</Text>
            </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 3,
  },
  flex: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  map: {
    flex: 1
  },
  car_location: {
    width: 33,
    height: 33,
  },
  centeringButton: {
    backgroundColor: '#98D7C2',
    borderRadius: 20,
    padding: 7,
    marginBottom: 20,
    shadowColor: '#303838',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    shadowOpacity: 0.35,
    alignItems: 'center',
  },
  img3: {
    width: 30,
    height: 30,
  },
  nav: {
    position: 'absolute',
    right: 10,
    top: 20,
    padding: 15,
  },
});

export default MapView;
