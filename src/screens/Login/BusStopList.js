import React, { useEffect, useContext,useState } from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
} from 'react-native';

import moment from 'moment';
import axios from 'axios';
import { Provider } from 'react-native-paper';
import AllRoute from '../../components/AllRoute';
import CalendarView from '../../components/CalendarView';
import { AuthContext } from "../../hooks/context/Context";
import { LoginStyle } from "./login.style";
import { removeNoActiveBusStop } from '../../utils/Util';

export const BASE_URL = 'http://150.95.82.104:8080/stg-ems/api';
const BusStopList = ({ navigation }) => {

  const Separator = () => <View style={LoginStyle.separator} />;

  const onLoginUser = () => {
    console.log("logout!!")
    logout()
  };
  const [busData, setBusData] = useState({});
  const [busStopList, setBusStopList] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [userFerryNo, setUserFerryNo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(false);
  const [location, setLocation] = useState();
  const [driverLocation, setDriverLocation] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const { userInfo } = useContext(AuthContext);
  const [socketState, setSocketState] = useState(null);

  let current = moment();
  let checkcurrent = current.format('YYYY-MM-DD');
  const [currenttimeSelected, setCurrentTimeSelected] = useState();
  const { logout } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [cancelError, setCancelError] = useState(false);
  const [routeList, setRouteList] = useState([]);
  const [showTodayMorningSchedule, setShowTodayMorningSchedule] =
    useState(true);
  const [showTodayEveningSchedule, setShowTodayEveningSchedule] =
    useState(true);

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
        const { code, message } = ex;
        console.warn(code, message);
        const data = await requestlocation();
        return data;
      });
    return response;
  };

  /**
   * fetch route API data.
   * @param {*} param
   */
  async function fetchMyAPI(param = null) {
    if (userInfo.driverLogin) {
      const response = await requestGetLocation();
    } else {
      // check_ferry_no();
    }
    let checkedIndex = -1;
    let dateParams = null;
    if (param) {
      dateParams = moment(param).format('YYYY-MM-DD');
    } else {
      dateParams = current.format('YYYY-MM-DD');
      setCurrentTimeSelected(current.format('YYYY-MM-DD'));
    }

    var accessToken = 'Bearer ' + userInfo.token;
    let configAuth = {
      headers: { Authorization: accessToken },
    };
    await axios
      .get(`${BASE_URL}/route?date=${dateParams}`, configAuth)
      .then(response => {
        let data = [];
        const list = response?.data?.routeData || [];
        setRouteList(list);

        if (userInfo.driverLogin) {
          const responseData = response?.data?.routeData?.filter(
            route => route.driverId === userInfo?.driverInformation?.id,
          );

          if (responseData.length > 0) {
            data = responseData[0];
          }
        } else {
          let index = response.data.routeData.findIndex((route, index) => {
            let result = route.morningData.find((dist, i) => {
              const findData = dist.employees.find(
                data =>
                  data?.employeeId === userInfo?.userInfomation?.employeeId &&
                  data?.company === userInfo?.userInfomation?.company,
              );
              if (findData) {
                return true;
              } else if (i === route.morningData.length - 1) {
                return false;
              }
            });

            if (!result) {
              result = route.eveningData.find((dist, i) => {
                const findData = dist.employees.find(
                  data =>
                    data?.employeeId === userInfo?.userInfomation?.employeeId &&
                    data?.company === userInfo?.userInfomation?.company,
                );
                if (findData) {
                  return true;
                } else if (i === route.eveningData.length - 1) {
                  return false;
                }
              });
            }

            if (result) {
              return true;
            } else if (index === response.data.routeData.length - 1) {
              return false;
            }
          });
          if (index !== -1) {
            data = response.data.routeData[index];
          }
        }

        let updatedBusStopList = [];

        if (data !== null && userInfo.driverLogin === false) {
          setBusData(data);
          updatedBusStopList = (timeFilter) ? removeNoActiveBusStop(data.morningData) : removeNoActiveBusStop(data.eveningData);
          setBusStopList(updatedBusStopList);
         

          setHighlightIndex(checkedIndex);
          if (checkedIndex >= 0) {
            setUserFerryNo(data.ferryNo);
          }
        } else {
          setBusData(data);
          updatedBusStopList = timeFilter ? removeNoActiveBusStop(data.morningData) : removeNoActiveBusStop(data.eveningData);
          setBusStopList(updatedBusStopList);
        }
        setLoading(false);
        setError(null);
        if (response?.data?.routeData?.length == 0) {
          setError('ဖယ်ရီ ဒေတာမရှိပါ');
        }
      })
      .catch(err => {
        console.log(err.message);
        setError(
          'EMS APIမှ data ယူခြင်း မအောင်မြင်ပါ။ သင်၏ internet connection ကို စစ်ဆေးပါ',
        );
        setRouteList([]);
        setLoading(false);
      });
  }

  /**
   * change date in bus schedule page.
   * @param {*} param
   */
  const selectDate = param => {
    setCurrentTimeSelected(moment(param).format('YYYY-MM-DD'));
    setSelectedDate(param);
    setLoading(true);
    fetchMyAPI(param);
  };

  useEffect(() => {
    let callAPI = async () => {
      try {
        await fetchMyAPI();
      } catch (e) {
        console.log(e);
      }
    };
    let isMounted = true;
    if (isMounted) {
      callAPI();
    }
    return () => {
      DeviceEventEmitter.emit('your listener', {});
      callAPI = () => {
        {
        }
      };
      setShowTodayMorningSchedule({});
      setShowTodayEveningSchedule({});
    };
  }, []);

  useEffect(() => {
    if (
      busData !== undefined &&
      Object.keys(busData).length !== 0 &&
      userInfo.driverLogin === false
    ) {
      let checkedIndex = -1;
      if (timeFilter) {
        let updatedBusStopList = removeNoActiveBusStop(busData.morningData);
        setBusStopList(updatedBusStopList);
        if (checkedIndex < 0) {
          setShowTodayMorningSchedule(false);
        } else {
          setShowTodayMorningSchedule(true);
        }

        updatedBusStopList = removeNoActiveBusStop(busData.eveningData);
        index >= 0
          ? setShowTodayEveningSchedule(true)
          : setShowTodayEveningSchedule(false);
      } else {
        let updatedBusStopList = removeNoActiveBusStop(busData.eveningData);
        setBusStopList(updatedBusStopList);

        if (checkedIndex < 0) {
          setShowTodayEveningSchedule(false);
        } else {
          setShowTodayEveningSchedule(true);
        }

        updatedBusStopList = removeNoActiveBusStop(busData.morningData);
      }
      setHighlightIndex(checkedIndex);
    } else if (busData !== undefined) {
      if (timeFilter) {
        let updatedBusStopList = removeNoActiveBusStop(busData.morningData);
        setBusStopList(updatedBusStopList);
      } else {
        let updatedBusStopList = removeNoActiveBusStop(busData.eveningData);
        setBusStopList(updatedBusStopList);
      }
    }
  }, [busData, timeFilter, highlightIndex]);


  /**
   * show toast message.
   * @param {*} msg
   */
  function notifyMessage(msg) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  }

  /**
   * cancelRide button function.
   */
  const cancelRide = timeParam => {
  };

  /**
   * click goToMap button.
   */
  const goToMap = async () => {
    if (!location) {
      const response = await requestGetLocation();
      if (!response) {
        return;
      }
    }
    const position = driverLocation ? driverLocation : [96.1726, 16.772247];
    navigation.navigate('UserMapShow', {
      paramKey: position,
      ferryTime: busStopList[highlightIndex].time,
      driverName: busData.driverName,
      driverPhone: busData.driverPhone,
      routeNo: busData.ferryNo,
      vibrationTime: { ...timeList },
    });
    socketState?.disconnect();
  };

  /**
   * click logout button.
   * @returns
   */
  const handleLogout = () => {
    return Alert.alert('ထွက်ရန်', 'သင့်အ‌ကောင့်မှ ထွက်ရန်သေချာပါသလား?', [
      {
        text: 'မထွက်ပါ',
        onPress: () => { },
      },
      {
        text: 'ထွက်မည်',
        onPress: () => {
          socketState?.disconnect();
          logout();
        },
      },
    ]);
  };

  /**
   * startDriving button click or auto go to driver map when driver already start the ferry.
   * @param {*} locat
   * @param {*} isStartDriving
   */
  const startDriving = async (data = null, timeParam = null) => {
    if (!location) {
      const response = await requestGetLocation();
      if (!response) {
        return;
      }
    }
    data = data ? data : busData;
    const timeListParam = timeParam ? timeParam : timeList;
    if (
      moment(current, 'h:mma').isBetween(
        moment(timeListParam.drivingMorningStartTime, 'h:mma'),
        moment(timeListParam.drivingMorningEndTime, 'h:mma'),
      ) &&
      data?.morningData
    ) {
      let filterData = removeNoActiveBusStop(data.morningData);
      navigation.navigate('MapShow', {
        busStopData: filterData,
        ferryNo: data.ferryNo,
        timePeriod: 'morning',
      });
      socketState?.disconnect()
    } else if (
      moment(current, 'h:mma').isBetween(
        moment(timeListParam.drivingEveningStartTime, 'h:mma'),
        moment(timeListParam.drivingEveningEndTime, 'h:mma'),
      ) &&
      data?.eveningData
    ) {
      let filterData = removeNoActiveBusStop(data.eveningData);
      navigation.navigate('MapShow', {
        busStopData: filterData,
        ferryNo: data.ferryNo,
        timePeriod: 'evening',
      });
      socketState?.disconnect();
    }
  };

  const checkGoToScreen = () => {
    if (userInfo?.userInfomation?.employeeType === 5 ||
      userInfo?.userInfomation?.employeeType === 1) {
      navigation.navigate('HRView');
      console.log('HR');
      socketState?.disconnect();
    } else {
      console.log('User');
      navigation.navigate('BusSchedule');
      socketState?.disconnect();
    }
  }

  /**
   * Back Key in the left side
   * @returns
   */
  const renderActions = () => (
    <View>
      {(userInfo?.userInfomation?.employeeType === 5 ||
        userInfo?.userInfomation?.employeeType === 1) && (
          <TouchableOpacity
            onPress={() => { checkGoToScreen() }}
            style={styles.nav}>
          </TouchableOpacity>
        )}
    </View>
  );
  /**
   * preview layout.
   * @returns
   */
  const PreviewLayout = () => (
    <>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : (
        <>
          {routeList.length === 0 || (error &&
            userInfo?.driverLogin === false) ? (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 500,
              }}>
              <ErrorComponent
                errormsg={
                  cancelError ? 'ဖယ်ရီ Cancel လုပ်ခြင်း အောင်မြင်ပါသည်' :
                    error || 'သင်သည် ယနေ့အတွက် ဖယ်ရီစီးရန် စာရင်းမသွင်းထားပါ'
                }
              />
            </View>
          ) : (<AllRoute
            navigation={navigation}
            routeList={routeList}
            timeList={timeList}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            cancelRide={cancelRide}
            showTodayMorningSchedule={showTodayMorningSchedule}
            showTodayEveningSchedule={showTodayEveningSchedule}
            highlightIndex={highlightIndex}
            selectedDate={selectedDate}
            currenttimeSelected={currenttimeSelected}
            userFerryNo={userFerryNo}
            startDriving={startDriving}
            busData={busData}
            goToMap={goToMap}></AllRoute>
          )}
        </>
      )}
    </>
  );


  return (
    <Provider>
        <>
      <View>
        <View >
        <SafeAreaView>
        <View style={styles.calendar}>
          <>
          </>
          <CalendarView selectDate={selectDate}/>
        </View>
      </SafeAreaView>
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
      </>
    </Provider>
  );
};
const styles = StyleSheet.create({
  calendar: {
    position: 'relative',
    marginTop: 0,
    width: '100%'
  },
});

export default BusStopList;
