import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Image, Text, TouchableOpacity, Alert } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import qs from 'qs';
import moment from 'moment';
import { AuthContext } from "../../hooks/context/Context";
import { CommonStyle } from "./common.style";
import { accessToken } from "../../config";
import GetLocation from 'react-native-get-location';
import Geolocation from 'react-native-geolocation-service';

MapboxGL.setAccessToken(accessToken);
const MapView = () => {
  let [carLocation, setCarLocation] = useState(null);
  let [userLocation, setUserLocation] = useState(null);
  let GMTstyle = moment().utc();
  let current = GMTstyle.format('YYYY-MM-DD hh:mm:ss');
  let _camera;
  const USER_SHOW_LOCATION = true;
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
    const getOption = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(dataToken),
      url: 'https://hk-open.tracksolidpro.com/route/rest',
    };
    console.log("response token!!");

    axios(getOption).then(res => {
      console.log("Access Token :", res.data.result.accessToken);
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
      console.log("Location request params :", data);
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
          setCarLocation([res.data.result[0].lng, res.data.result[0].lat]);
        })
          .catch(err => {
            console.log("Location request from GPS device failed.", err)
          })
      }, 10000);
    })
      .catch(err => {
        console.log("Token request failed!!!", err)
      })

  }

  /**
   * Zoom button
   */
  const centeringButtonPress = () => {
    _camera !== undefined &&
      _camera?.flyTo(
        carLocation?.length > 0 ? carLocation : [96.14965243954374, 16.798741608382194],
        1000,
      );
  };

  useEffect(() => {
    getAccessToken();
    async function getInitialLocation() {
    requestGetLocation();
    }
    getInitialLocation()
    centeringButtonPress();
  }, []);

  const stopPress = () => {
    console.log("logout!!")
    logout();
    setCarLocation(null);
    setCarLocation(null);
  };
  const handleStop = async () => {
    return Alert.alert(
      'မြေပုံမှထွက်ရန်',
      'မြေပုံမှထွက်မှာသေချာပါသလား။',
      [
        {
          text: 'မထွက်ပါ',
          onPress: () => { },
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

  /**
   * on user location update.
   * @param {*} newUserLocation
   */
   const onUserLocationUpdate = newUserLocation => {
    setInterval(() => {
    setUserLocation([
      newUserLocation.coords.longitude,
      newUserLocation.coords.latitude,
    ]);
  }, 60000);
  };

  /**
   * request get locaiton.
   * @returns
   */
   const requestGetLocation = async () => {
    const response = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
    })
      .then(async location => {
        return location;
      })
      .catch(async ex => {
        const {code, message} = ex;
        console.warn(code, message);
        if (code === 'CANCELLED') {
          console.log('User ဘက်မှ Location ယူခြင်းကို Canceled လုပ်ထားပါသည်');
        } else if (code === 'UNAVAILABLE') {
          Alert.alert('သင်၏ဖုန်းမှ GPS ကို ဖွင့်ပေးပါ');
        } else if (code === 'TIMEOUT') {
          Alert.alert('Location ယူခြင်းအချိန် ကျော်လွန်သွားပါပြီ');
        } else if (code === 'UNAUTHORIZED') {
          Alert.alert('Location ယူရန်ခွင့်ပြုချက်မရှိပါ');
        } else {
          console.log('တခုခု မှားယွင်းနေပါသည်');
        }
        const data = await _requestLocation();
        return data;
      });
    return response;
  };

  /**
   * request location with Geolocation API.
   * @returns
   */
   const _requestLocation = async () => {
    const response = await new Promise(resolve => {
      const config = {
        enableHighAccuracy: true,
        timeout: 100,
        maximumAge: 800,
      };
      Geolocation.getCurrentPosition(
        position => {
        setInterval(() => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        }, 60000);  
          resolve(position.coords);
        },
        error => {
          // See error code charts below.
          const {code, message} = error;
          if (code === 'CANCELLED') {
            console.log('User ဘက်မှ Location ယူခြင်းကို Canceled လုပ်ထားပါသည်');
          } else if (code === 'UNAVAILABLE') {
            Alert.alert('သင်၏ဖုန်းမှ GPS ကို ဖွင့်ပေးပါ');
          } else if (code === 'TIMEOUT') {
            Alert.alert('Location ယူခြင်းအချိန် ကျော်လွန်သွားပါပြီ');
          } else if (code === 'UNAUTHORIZED') {
            Alert.alert('Location ယူရန်ခွင့်ပြုချက်မရှိပါ');
          } else {
            console.log('တခုခု မှားယွင်းနေပါသည်');
          }
          resolve(false);
        },
        config,
      );
    }).then(data => {
      return data;
    });

    return response;
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
              carLocation?.length > 0 ? carLocation : [96.14965243954374, 16.798741608382194]
            }
            followUserLocation={false}
            defaultSettings={{
              centerCoordinate:
                carLocation?.length > 0 ? carLocation : [96.14965243954374, 16.798741608382194],
              followUserLocation: true,
              followUserMode: MapboxGL.UserTrackingModes.Follow,
            }}
            ref={camera => (_camera = camera)}
          />
          {console.log("carLocation ", carLocation)}
          <MapboxGL.MarkerView
            anchor={{ x: 0.5, y: 1 }}
            title="This is a title"
            description="This is a description"
            key={Math.random()}
            coordinate={
              carLocation?.length > 0 ? carLocation : [96.14965243954374, 16.798741608382194]
            }>
            <View>
              <Image
                testID="car-location{renderModal()}"
                style={styles.car_location}
                source={require('../../../assets/car_location.png')}
              />
            </View>
          </MapboxGL.MarkerView>
            <MapboxGL.UserLocation
              animated={USER_SHOW_LOCATION}
              style={styles.pointuser}
              visible={USER_SHOW_LOCATION}
              showsUserHeadingIndicator={USER_SHOW_LOCATION}
              onUpdate={newUserLocation =>
                onUserLocationUpdate(newUserLocation)
              }
            />     
            {console.log("User location:", userLocation)}       
        </MapboxGL.MapView>
        <View
          style={{
            alignItems: 'flex-end',
          }}>
          <TouchableOpacity
            style={{
              ...CommonStyle.mapButton,
              marginVertical: 10,
            }}
            onPress={() => {
              handleStop()
            }}>
            <Text style={CommonStyle.buttonText}>Log out</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              ...CommonStyle.mapButton,
              marginVertical: -60,
            }}
            onPress={() => {
              centeringButtonPress()
            }}>
            <Text style={CommonStyle.buttonText}>Zoom</Text>
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
  pointuser: {
    position: 'absolute',
    right: 10,
    bottom: 5,
  },
  nav: {
    position: 'absolute',
    right: 10,
    top: 20,
    padding: 15,
  },
});

export default MapView;
