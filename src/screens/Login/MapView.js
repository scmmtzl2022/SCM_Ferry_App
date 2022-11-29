import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Image, Text, Dimensions, TouchableOpacity, Alert,Linking, } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import qs from 'qs';
import moment from 'moment';
import { CommonStyle } from "./common.style";
import { accessToken } from "../../config";
import Geolocation from 'react-native-geolocation-service';
import GetLocation from 'react-native-get-location';
import ButtonDrawer from 'react-native-bottom-drawer-view';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

MapboxGL.setAccessToken(accessToken);
const MapView = ({ navigation, route }) => {
  let [carLocation, setCarLocation] = useState(null);
  let [userLocation, setUserLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  let _camera;
  console.log("route.params => ", route.params.IMEIName, route.params.driverPhone);
  const USER_SHOW_LOCATION = true;
  /**
   * Get access token
   */
  const getAccessToken = () => {
    // const dataToken = {
    //   'method': 'jimi.oauth.token.get',
    //   'timestamp': current,
    //   'app_key': '8FB345B8693CCD00E97951CC35B1045A',
    //   'sign_method': 'md5',
    //   'v': 0.9,
    //   'format': 'json',
    //   'user_id': 'cityapiuser',
    //   'user_pwd_md5': '21218cca77804d2ba1922c33e0151105',
    //   'expires_in': 7200,
    // };
    // const getOption = {
    //   method: 'POST',
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   data: qs.stringify(dataToken),
    //   url: 'https://hk-open.tracksolidpro.com/route/rest',
    // };
    // console.log("response token!!");

    // axios(getOption).then(res => {
    //   console.log("Access Token :", res.data.result.accessToken);
    // setInterval(() => {
    let GMTstyle = moment().utc();
    let current = GMTstyle.format('YYYY-MM-DD HH:mm:ss');
    const data = {
      'method': 'jimi.device.location.get',
      'timestamp': current,
      'app_key': '8FB345B8693CCD00E97951CC35B1045A',
      'sign_method': 'md5',
      'v': 0.9,
      'format': 'json',
      'access_token': '1a1637e4e8becda0289dc081fbf2f87c',
      'imeis': '865784052487926,865784052827931',
      'map_type': 'GOOGLE',
    };
    //       console.log("current :", current);     
    //       console.log("Location request params :", data);
    // const options = {
    //   method: 'POST',
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   data: qs.stringify(data),
    //   url: 'https://hk-open.tracksolidpro.com/route/rest',
    // };
    // axios(options).then(res => {
    //   let imeiList;
    //   imeiList = res.data.result;
    //   const selectedIMEI = imeiList.filter(item => item.imei === route.params.IMEIName);
    //   console.log("Car Location by IMEI device => ", [selectedIMEI[0].lng, selectedIMEI[0].lat])

    // })
      // .catch(err => {
      //   console.log("Location request from GPS device failed.", err)
      // })
    // }, 5000);
    // }
    // )
    // .catch(err => {
    //   console.log("Token request failed!!!", err)
    // })

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
    setModalVisible(true);
    requestGetLocation();
    centeringButtonPress();
  }, []);

  const stopPress = () => {
    console.log("Back to BusScheduleScreen!!")
    navigation.navigate('BusScheduleScreen')
    setCarLocation(null);
    setUserLocation(null);
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
  const onUserLocationUpdate = () => {
    userLocation
    console.log('User location :', userLocation);
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
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
          console.log("User Location request!!");
          resolve(position.coords);
        },
        error => {
          // See error code charts below.
          const { code, message } = error;
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
  /**
  * request get locaiton.
  * @returns
  */
  const requestGetLocation = async () => {
    const response = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
    })
      .then(async location => {
        setInterval(() => {
          setUserLocation([location.longitude, location.latitude]);
          return location;
        }, 10000);
      })
      .catch(async ex => {
        const { code, message } = ex;
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
   * phone call function.
   * @param {*} phone
   */
   const phonecall = phone => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderContent = () => {
    
      console.log('Render content ');

    return (
      <View style={styles.contentContainer}>
        <View
          style={{
            alignItems: 'center',
          }}>
          <Image
            style={styles.img2}
            source={require('../../../assets/minus.png')}
            accessibilityLabel="minus-sign"
          />
        </View>
        {(
          <View
            style={{
              marginBottom: 10,
            }}></View>
        )}
        {(
          <View
            style={{
              paddingLeft: 30,
              paddingEnd: 60,
            }}>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
              }}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginVertical: 10,
                    width: Dimensions.get('window').width / 1.5,
                  }}>
                  <Image
                    style={styles.image}
                    source={require('../../../assets/car.png')}
                  />
                  <Text style={styles.paragraph}>{route?.params?.IMEIName}</Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    width: Dimensions.get('window').width / 1.5,
                  }}>
                  <Image
                    style={styles.image3}
                    source={require('../../../assets/driver.png')}
                  />
                  <Text style={styles.paragraph}>
                    {route?.params?.driverName}
                    {'\n'}
                    <Text style={styles.paragraph2}>
                      {route?.params?.driverPhone}
                    </Text>
                  </Text>
                </View>
              </View>
              <View
                style={{
                  padding: 10,
                  backgroundColor: '#F2F1F0',
                  borderRadius: 10,
                  borderColor: '#C0C9CC',
                  borderWidth: 1,
                  height: 45,
                  justifyContent: 'center',
                  marginTop: 25,
                }}>
                <TouchableOpacity
                  onPress={() => phonecall(route?.params?.driverPhone)}>
                  <Image
                    style={styles.img}
                    source={require('../../../assets/phone.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }; 
  const renderModal = () => {
    return modalVisible ? (  
      <ButtonDrawer
        roundedEdges={true}
        containerHeight={hp('35%')}
        shadow={true}
        onExpanded={() => {
          // setLocationview(true);
        }}
        onCollapsed={() => {
          // setLocationview(false);
        }}>
        {renderContent()}
        </ButtonDrawer>
    ) : null;
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
            onUpdate={onUserLocationUpdate()}
          />
        </MapboxGL.MapView>
        {renderModal()}
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
            <Text style={CommonStyle.buttonText}>Back</Text>
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

  loader: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0, .5)',
    height: '100%',
    width: '100%',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointuser: {
    position: 'absolute',
    right: 10,
    bottom: 5,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 17,
    backgroundColor: 'rgba(68, 154, 235, .4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 20,
    height: 20,
    borderRadius: 11,
    backgroundColor: '#1D1D1D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCircle: {
    width: 12,
    height: 12,
    borderRadius: 7,
    backgroundColor: 'rgba(68, 154, 235, 1)',
  },
  img: {
    width: 25,
    height: 25,
  },
  img2: {
    width: 50,
    height: 50,
  },
  img3: {
    width: 30,
    height: 30,
  },
  centeringButton: {
    backgroundColor: '#98D7C2',
    borderRadius: 20,
    padding: 7,
    margin: 10,
    shadowColor: '#303838',
    shadowOffset: {width: 0, height: 5},
    shadowRadius: 10,
    shadowOpacity: 0.35,
    alignItems: 'center',
  },

  image: {
    width: 35,
    height: 35,
  },
  image3: {
    width: 35,
    height: 35,
    marginTop: 10,
  },
  paragraph: {
    fontSize: 17,
    padding: 5,
    color: '#4E4F50',
    marginLeft: 15,
    width: 130,
    fontFamily: 'SourceSerif4-Regular',
    letterSpacing: 0.7,
    flex: 1,
  },
  paragraph2: {
    fontSize: 15,
    padding: 5,
    color: '#4E4F50',
    marginLeft: 15,
    width: 130,
    fontFamily: 'SourceSerif4-Regular',
    letterSpacing: 0.1,
  },
  noti: {
    flex: 0,
    fontSize: 22,
    color: '#4E4F50',
    borderColor: '#d7d0d0',
    textAlign: 'center',
    fontFamily: 'SourceSerif4-Regular',
  },
  vibrateStopBtn: {
    backgroundColor: '#0f7e81',
    borderRadius: 10,
    borderColor: '#C0C9CC',
    borderWidth: 1,
    height: 45,
    justifyContent: 'center',
    width: 150,
  },
  vibrateStopDisabledBtn: {
    backgroundColor: '#0f7e81',
    borderRadius: 10,
    borderColor: '#C0C9CC',
    borderWidth: 1,
    height: 45,
    justifyContent: 'center',
    width: 150,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'SourceSerif4-Regular',
    elevation: 30,
    shadowColor: '#48595c',
  },
});

export default MapView;
