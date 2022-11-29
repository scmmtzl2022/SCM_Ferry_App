import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ToastAndroid,
  AlertIOS,
  SafeAreaView,
  DeviceEventEmitter,
} from 'react-native';
import moment from 'moment';
import axios from 'axios';
import { removeNoActiveBusStop, searchEmployee, getTimeList } from '../../utils/Util';
import { AuthContext } from '../../hooks/context/Context';
import CalendarView from '../../components/CalendarView';
import ErrorComponent from '../../components/ErrorComponent';
import AllRoute from '../../components/AllRoute';
import { BASE_URL } from '../../config';

const BusScheduleScreen = ({ navigation }) => {
  const [busData, setBusData] = useState({});
  const [busStopList, setBusStopList] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [userFerryNo, setUserFerryNo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());
  const { userInfo } = useContext(AuthContext);

  const [timeList, setTimeList] = useState({
    checkHour: '01:00pm',
    drivingMorningStartTime: '06:00am',
    drivingMorningEndTime: '08:00am',
    drivingEveningStartTime: '05:00pm',
    drivingEveningEndTime: '08:00pm',
    cancelMorningStartTime: '07:00pm',
    cancelMorningEndTime: '06:00am',
    cancelEveningStartTime: '08:00am',
    cancelEveningEndTime: '05:00pm',
  });

  let current = moment();
  let checkcurrent = current.format('YYYY-MM-DD');
  const [currenttimeSelected, setCurrentTimeSelected] = useState();
  const { logout } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [cancelError, setCancelError] = useState(false);
  const Separator = () => <View style={styles.separator} />;
  const [routeList, setRouteList] = useState([]);
  const [showTodayMorningSchedule, setShowTodayMorningSchedule] =
    useState(true);
  const [showTodayEveningSchedule, setShowTodayEveningSchedule] =
    useState(true);

  /**
   * fetch time list.
   */
  async function fetchTimeList() {
    const timeParam = await getTimeList();
    if (timeParam) {
      setTimeList({ ...timeParam });
      const checkHour = new Date().getHours();
      if (checkHour >= moment(timeParam?.checkHour, 'h:mma').hours()) {
        setTimeFilter(false);
      } else {
        setTimeFilter(true);
      }
    }
  }

  /**
   * fetch route API data.
   * @param {*} param
   */
  async function fetchMyAPI(param = null) {
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
          updatedBusStopList = timeFilter
            ? removeNoActiveBusStop(data.morningData)
            : removeNoActiveBusStop(data.eveningData);
          setBusStopList(updatedBusStopList);
          checkedIndex = searchEmployee(
            updatedBusStopList,
            userInfo.userInfomation.employeeId,
            userInfo.userInfomation.company,
          );

          setHighlightIndex(checkedIndex);
          if (checkedIndex >= 0) {
            setUserFerryNo(data.ferryNo);
          }
        } else {
          setBusData(data);
          updatedBusStopList = timeFilter
            ? removeNoActiveBusStop(data.morningData)
            : removeNoActiveBusStop(data.eveningData);
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
    fetchTimeList();
  };

  useEffect(() => {
    let callAPI = async () => {
      try {
        fetchTimeList();
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
        checkedIndex = searchEmployee(
          updatedBusStopList,
          userInfo.userInfomation.employeeId,
          userInfo.userInfomation.company,
        );

        if (checkedIndex < 0) {
          setShowTodayMorningSchedule(false);
        } else {
          setShowTodayMorningSchedule(true);
        }

        updatedBusStopList = removeNoActiveBusStop(busData.eveningData);
        const index = searchEmployee(
          updatedBusStopList,
          userInfo.userInfomation.employeeId,
          userInfo.userInfomation.company,
        );
        index >= 0
          ? setShowTodayEveningSchedule(true)
          : setShowTodayEveningSchedule(false);
      } else {
        let updatedBusStopList = removeNoActiveBusStop(busData.eveningData);
        setBusStopList(updatedBusStopList);
        checkedIndex = searchEmployee(
          updatedBusStopList,
          userInfo.userInfomation.employeeId,
          userInfo.userInfomation.company,
        );

        if (checkedIndex < 0) {
          setShowTodayEveningSchedule(false);
        } else {
          setShowTodayEveningSchedule(true);
        }

        updatedBusStopList = removeNoActiveBusStop(busData.morningData);
        const index = searchEmployee(
          updatedBusStopList,
          userInfo.userInfomation.employeeId,
          userInfo.userInfomation.company,
        );
        index >= 0
          ? setShowTodayMorningSchedule(true)
          : setShowTodayMorningSchedule(false);
      }
      // checkedIndex < 0 ? setError('သင်သည် ယနေ့အတွက် ဖယ်ရီစီးရန် စာရင်းမသွင်းထားပါ') : setError(null);
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
    const company = userInfo.userInfomation.company;
    const timePeriod = timeParam;
    const date = selectedDate.format('YYYY-MM-DD');
    var accessToken = 'Bearer ' + userInfo.token;
    let configAuth = {
      headers: { Authorization: accessToken },
    };
    axios
      .post(
        `${BASE_URL}/cancel?employeeId=${userInfo.userInfomation.employeeId}`,
        {
          timePeriod: timePeriod,
          date: date,
          company: company,
        },
        configAuth,
      )
      .then(res => {
        if (res.data.message == 'Cancel Ferry Successfully!') {
          notifyMessage(res.data.message);
          fetchMyAPI(selectedDate);
          setCancelError(false);
          setError('ဖယ်ရီ Cancel လုပ်ခြင်း အောင်မြင်ပါသည်');
        } else {
          notifyMessage('သင်သည် ယနေ့အတွက် ဖယ်ရီစီးရန် စာရင်းမသွင်းထားပါ');
          setCancelError(true);
        }
      })
      .catch(err => {
        setCancelError(true);
        notifyMessage('သင်သည် ယနေ့အတွက် ဖယ်ရီစီးရန် စာရင်းမသွင်းထားပါ');
      });
  };

  /**
   * click goToMap button.
   */
  const goToMap = async () => {

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
          logout();
        },
      },
    ]);
  };

  const checkGoToScreen = () => {
    if (
      userInfo?.userInfomation?.employeeType === 5 ||
      userInfo?.userInfomation?.employeeType === 1
    ) {
      // navigation.navigate('HRView');
      console.log('HR')
    } else {
      console.log('User');
      navigation.navigate('BusSchedule')
    }
  };

  /**
   * Back Key in the left side
   * @returns
   */
  const renderActions = () => (
    <View>
      {(userInfo?.userInfomation?.employeeType === 5 ||
        userInfo?.userInfomation?.employeeType === 1) && (
          <TouchableOpacity
            onPress={() => {
              checkGoToScreen();
            }}
            style={styles.nav}>
            <Image
              source={require('../../../assets/back.png')}
              style={styles.img3}
              accessibilityLabel="back-icon"
            />
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
          {routeList?.length === 0 ||
            (error) ? (
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
                  cancelError
                    ? 'ဖယ်ရီ Cancel လုပ်ခြင်း အောင်မြင်ပါသည်'
                    : error || 'သင်သည် ယနေ့အတွက် ဖယ်ရီစီးရန် စာရင်းမသွင်းထားပါ'
                }
              />
            </View>
          ) : (
            <AllRoute
              navigation={navigation}
              routeList={routeList}
              timeList={timeList}
              timeFilter={timeFilter}
              userBusStopList={busStopList}
              setTimeFilter={setTimeFilter}
              cancelRide={cancelRide}
              showTodayMorningSchedule={showTodayMorningSchedule}
              showTodayEveningSchedule={showTodayEveningSchedule}
              highlightIndex={highlightIndex}
              selectedDate={selectedDate}
              currenttimeSelected={currenttimeSelected}
              userFerryNo={userFerryNo}
              busData={busData}
              goToMap={goToMap}></AllRoute>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <SafeAreaView>
        <View style={styles.calendar}>
          <>
            <View
              style={{
                zIndex: 2,
                top: 40,
                with: 25,
                alignItems: 'flex-start',
              }}>
              {renderActions()}
            </View>
            <View
              style={{
                zIndex: 2,
                top: 40,
                left: 0,
                marginRight: 20,
                with: 15,
                alignItems: 'flex-end',
              }}>
              {((userInfo?.userInfomation?.employeeType !== 5 &&
                userInfo?.userInfomation?.employeeType !== 1) ||
                userInfo?.driverLogin === true) && (
                  <TouchableOpacity
                    onPress={() => {
                      handleLogout();
                    }}>
                    <Image
                      source={require('../../../assets/icons8-logout-48.png')}
                      style={styles.image2}
                    />
                  </TouchableOpacity>
                )}
            </View>
          </>
          <CalendarView selectDate={selectDate} />
        </View>
      </SafeAreaView>
      <PreviewLayout />
    </>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', backgroundColor: '#D3DADC' },
  image2: {
    width: 30,
    height: 30,
    marginLeft: 8,
  },
  loader: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0, 0.3)',
    height: '100%',
    width: '100%',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    position: 'relative',
    marginTop: -30,
  },
  img3: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  nav: {
    marginTop: 0,
    width: 50,
    height: 30,
    zIndex: 2,
  },
});

export default BusScheduleScreen;
