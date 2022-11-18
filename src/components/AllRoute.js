import React, { useState, useEffect, useContext } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import moment from 'moment';
import axios from 'axios';

import { Provider } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import BusStopAccordion from './BusStopAccordion';
import { SOCKET_URL } from '../config';

import { AuthProvider } from '../hooks/provider/AuthProvider';
import { removeNoActiveBusStop } from '../utils/Util';

const Separator = () => <View style={styles.separator} />;

const AllRoute = ({
  routeList,
  cancelRide,
  timeList,
  timeFilter,
  showTodayMorningSchedule,
  showTodayEveningSchedule,
  highlightIndex,
  selectedDate,
  currenttimeSelected,
  userFerryNo,
  startDriving,
  goToMap,
  busData,
  navigation
}) => {
  const [name, setName] = useState(null);
  const [showname, setShowName] = useState(false);
  const [busList, setbusList] = useState([]);
  const { userInfo } = useContext(AuthProvider);
  const [driverInfo, setDriverInfo] = useState({});
  const [busStopList, setBusStopList] = useState([]);
  const [filterHour, setFilterHour] = useState(timeFilter);
  const [ferryData, setFerryData] = useState([]);
  const [ferryActiveList, setFerryActiveList] = useState([]);
  const [userFerryActive, setUserFerryActive] = useState();
  let current = moment();
  let checkcurrent = current.format('YYYY-MM-DD');

  /**
   * Check User Ferry Active Status for go to map
   */
  const checkUserFerryActive = () => {
    // let payload = {
    //   ferry_no: busData.ferryNo,
    //   is_active: 1,
    // };
    // axios
    //   .post(`${SOCKET_URL}/route/check_ferry_no`, payload)
    //   .then(async res => {
    //     if (res.data?.length > 0) {
    //       setUserFerryActive(1);
    //     } else {
    //       setUserFerryActive(0);
    //     }
    //   });
  };

  /**
   * call route API with dateTime.
   */
  async function fetchMyAPI() {
    if (userInfo.driverLogin) {
      const list = [];
      routeList?.map(route => {
        list.push({
          label: route.ferryNo,
          value: route.ferryNo,
        });
      });
      setbusList(list);
      list?.length > 0 && setName(list[0].value);
      const index = routeList.findIndex(
        route => route.driverId === userInfo.driverInformation.id,
      );
      let selectedFerry = [];
      if (list?.length > 0 && index !== -1) {
        selectedFerry = list[index].value;
      }
      showRouteList(routeList, selectedFerry);
    } else {
      const list = [];
      routeList?.map(route => {
        list.push({
          label: route.ferryNo,
          value: route.ferryNo,
        });
      });
      setbusList(list);
      let data = [];
      if (userFerryNo) {
        data = list.filter(route => route.value === userFerryNo);
      } else if (list?.length > 0) {
        data = [list[0]];
      }
      if (data?.length > 0) {
        setName(data[0].value);
        (userInfo?.userInfomation?.employeeType === 1 || userInfo?.userInfomation?.employeeType === 5) && checkFerryNo(list);
      }

      const selectedFerry = data?.length > 0 ? data[0].value : null;
      showRouteList(routeList, selectedFerry);
    }
  }

  /**
   * show route list with ferryNo.
   * @param {*} routeData
   * @param {*} selectedFerry
   */
  const showRouteList = (routeData, selectedFerry, dropdown = false) => {
    const ferryData = routeData?.filter(
      route => route.ferryNo === selectedFerry,
    );
    if (ferryData.length > 0) {
      setDriverInfo({
        driverName: ferryData[0].driverName,
        driverPhone: ferryData[0].driverPhone,
      });
      setFerryData(ferryData[0]);
      if (dropdown) {
        setFilterHour(previousState => {

          if (previousState) {
            const updatedBusStopList = removeNoActiveBusStop(
              ferryData[0].morningData,

            );
            setBusStopList(updatedBusStopList);
          } else {
            const updatedBusStopList = removeNoActiveBusStop(
              ferryData[0].eveningData,
            );
            setBusStopList(updatedBusStopList);
          }
          return previousState;

        });
      } else {
        if (!timeFilter) {
          const updatedBusStopList = removeNoActiveBusStop(
            ferryData[0].eveningData,
          );
          setBusStopList(updatedBusStopList);
          setFilterHour(false);
        } else {
          const updatedBusStopList = removeNoActiveBusStop(
            ferryData[0].morningData
          );
          setBusStopList(updatedBusStopList);
          setFilterHour(true);
        }
      }
    }
  };

  /**
   * morning evening toggle button click.
   */

  const toggleSwitch = () => {
    setFilterHour(previousState => !previousState);
    if (filterHour) {
      const updatedBusStopList = removeNoActiveBusStop(ferryData.eveningData);
      setBusStopList(updatedBusStopList);
    } else {
      const updatedBusStopList = removeNoActiveBusStop(ferryData.morningData);
      setBusStopList(updatedBusStopList);
    }
  };

  /**
   * componentDidMount.
   */
  useEffect(() => {
    fetchMyAPI();
    checkUserFerryActive();
    return () => {
      setBusStopList([]);
    }
  }, [selectedDate]);

  /**
   * change ferryNo dropdown event.
   * @param {*} showname
   */
  const changeDropDown = showname => {
    setName(showname);
    showRouteList(routeList, showname, true);
  };
  /**
   * show hide for ferry monitoring button.
   * @param {*} ferryList 
   */
  
  /**
   * check driver active with ferryNo
   */
  const checkFerryNo = async (ferryList) => {
    // const result = [];
    // const socket = io(SOCKET_URL);
    // socket.connect();
    // socket.on('connect', () => {
    //   console.log('socket connected');
    // });
    // for (let i = 0; i < ferryList.length; i++) {
    //   let payload = {
    //     ferry_no: ferryList[i].value,
    //     is_active: 1
    //   };
    //   const res = await axios.post(`${SOCKET_URL}/route/check_ferry_no`, payload);
    //   if (res?.data?.length > 0) {
    //     const data = {
    //       ferryNo: ferryList[i].value,
    //       active: 1
    //     };
    //     result.push(data);
    //   } else if (res?.data?.length === 0) {
    //     const data = {
    //       ferryNo: ferryList[i].value,
    //       active: 0
    //     };
    //     result.push(data);
    //   }
    //   if (i === ferryList.length - 1) {
    //     setFerryActiveList(result);
    //   }
    // }
    // socketForFerryMonitoringBtn(ferryList, socket, result);
  }

  /**
   * show confirm dialog when cancel Ride button click.
   * @returns
   */
  const showConfirmDialog = () => {
    const timePeriod = !filterHour ? 'evening' : 'morning';
    const date = selectedDate?.format('YYYY/MM/DD');
    return Alert.alert(
      'Are your sure?',
      `(${date} - ${timePeriod}) အတွက် ဖယ်ရီ Cancel လုပ်ရန်သေချာပါသလား?`,
      [
        {
          text: 'Yes',
          onPress: () => {
            cancelRide(timePeriod);
          },
        },
        {
          text: 'No',
        },
      ],
    );
  };

  /**
   * check date to show cancel Ride button.
   * @param {*} selectedDate
   * @returns
   */
  const checkCancelTime = selectedDate => {
    if (!selectedDate) {
      return false;
    }
    const startFromToday =
      selectedDate?.format('YYYY-MM-DD') >= current.format('YYYY-MM-DD');
    if (startFromToday && checkCancelPeriod()) {
      return true;
    }
    return false;
  };

  /**
   * check time to show cancel Ride button.
   * @returns
   */
  const checkCancelPeriod = () => {
    let currentTime = moment(current, 'h:mma');
    const isToday = selectedDate.format('YYYY-MM-DD') === current.format('YYYY-MM-DD');
    const isAnotherDay = selectedDate?.format('YYYY-MM-DD') > current.format('YYYY-MM-DD');
    if ((!filterHour && isToday &&
      currentTime.isBetween(moment(timeList.cancelEveningStartTime, 'h:mma'), moment(timeList.cancelEveningEndTime, 'h:mma')))
      || (!filterHour && isAnotherDay))
      return true;
    else if ((filterHour && isToday &&
      currentTime.isBetween(moment(timeList.cancelMorningStartTime, 'h:mma'), moment(timeList.cancelMorningEndTime, 'h:mma')))
      || (filterHour && isAnotherDay))
      return true;
    else return false;
  };

  /**
   * click goToMonitoring Page.
   */
  const goToMonitor = () => {
    const position = [96.1726, 16.772247];
    navigation.navigate('BusMonitoring', {
      paramKey: position,
      ferryData: routeList,
      ferryNo: name,
      driverName: ferryData?.driverName,
      driverPhone: ferryData?.driverPhone,
    });
  };

  /**
   * check ferry active for button enabled and disabled.
   */
  const checkFerryActive = (ferryNo) => {
    return ferryActiveList.findIndex(ferry => ferry.ferryNo === ferryNo && ferry.active === 1) !== -1 ? true : false;
  }
  return (
    <Provider>
      <SafeAreaView>
        <ScrollView>
          <View>
            <View>
              <Separator />
              <View style={styles.buttonGroup}>
                {userInfo.driverLogin === false && (
                  <View style={styles.filterBus}>
                    <DropDown
                      dropDownStyle={highlightIndex > 0 ? styles.filterHighLigth : styles.filterNoHighLigth}
                      label={'Choose bus'}
                      mode={'flat'}
                      style={[styles.dropdown]}
                      inputProps={{
                        style: {
                          backgroundColor: 'white',
                          height: 60,
                          borderRadius: 6,
                          fontSize: 14,
                        },
                        underlineColor: 'transparent',
                      }}
                      containerStyle={styles.shadow}
                      visible={showname}
                      showDropDown={() => setShowName(true)}
                      onDismiss={() => setShowName(false)}
                      value={name}
                      setValue={param => changeDropDown(param)}
                      list={busList}
                    />
                  </View>
                )}

                <View
                  style={
                    userInfo?.driverLogin
                      ? styles.filterDriver
                      : styles.filterUser
                  }>
                  <Text style={styles.filterText}>နံနက်</Text>
                  <Switch
                    trackColor={{ true: '#767577', false: '#81b0ff' }}
                    thumbColor={!filterHour ? '#f4f3f4' : '#f5dd4b'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={!filterHour}
                  />
                  <Text style={styles.filterTextEvening}>ညနေ</Text>
                </View>
              </View>
              <Separator />
              {
                <View style={styles.buttonContainer}>
                  {/* driver when active */}
                  {((moment(current, 'h:mma').isBetween(
                    moment(timeList.drivingMorningStartTime, 'h:mma'),
                    moment(timeList.drivingMorningEndTime, 'h:mma'),
                  ) &&
                    showTodayMorningSchedule
                    &&
                    filterHour) ||
                    (moment(current, 'h:mma').isBetween(
                      moment(timeList.drivingEveningStartTime, 'h:mma'),
                      moment(timeList.drivingEveningEndTime, 'h:mma'),
                    ) &&
                      showTodayEveningSchedule
                      &&
                      !filterHour)) &&
                    userFerryActive === 1 &&
                    userFerryNo === name &&
                    checkcurrent === currenttimeSelected &&
                    userInfo?.driverLogin === false &&
                    userInfo?.userInfomation?.employeeType !== 1 &&
                    userInfo?.userInfomation?.employeeType !== 5 &&
                    (
                      <TouchableOpacity
                        style={[styles.button, styles.goToMapButton]}
                        onPress={() => goToMap()}>
                        <Text
                          style={[styles.buttonText, styles.goToMapButtonText]}>
                          Go To Map
                        </Text>
                      </TouchableOpacity>
                    )}
                  <Separator />
                  {((moment(current, 'h:mma').isBetween(
                    moment(timeList.drivingMorningStartTime, 'h:mma'),
                    moment(timeList.drivingMorningEndTime, 'h:mma'),
                  ) &&
                    filterHour) ||
                    (moment(current, 'h:mma').isBetween(
                      moment(timeList.drivingEveningStartTime, 'h:mma'),
                      moment(timeList.drivingEveningEndTime, 'h:mma'),
                    ) &&
                      !filterHour)) &&
                    checkFerryActive(name) &&
                    checkcurrent === currenttimeSelected &&
                    (userInfo?.userInfomation?.employeeType === 1 ||
                      userInfo?.userInfomation?.employeeType === 5) &&
                    userInfo?.driverLogin === false && (
                      <TouchableOpacity
                        style={[styles.button, styles.ferryMonitoringBtn]}
                        onPress={() => goToMonitor()}>
                        <Text
                          style={[styles.buttonText, styles.goToMapButtonText]}>
                          Ferry Monitoring
                        </Text>
                      </TouchableOpacity>
                    )}
                  {/* driver when not active */}
                  {/* Morning start button */}
                  {((moment(current, 'h:mma').isBetween(
                    moment(timeList.drivingMorningStartTime, 'h:mma'),
                    moment(timeList.drivingMorningEndTime, 'h:mma'),
                  ) &&
                    filterHour) ||
                    (moment(current, 'h:mma').isBetween(
                      moment(timeList.drivingEveningStartTime, 'h:mma'),
                      moment(timeList.drivingEveningEndTime, 'h:mma'),
                    ) &&
                      !filterHour)) &&
                    checkcurrent === currenttimeSelected &&
                    userInfo?.driverLogin === true && (
                      <>
                        <TouchableOpacity
                          style={[styles.button, styles.driveButton]}
                          onPress={() => startDriving(null)}>
                          <Text style={styles.buttonText}>Start Driving</Text>
                        </TouchableOpacity>
                        <Separator />
                      </>
                    )}

                  {/* user */}
                  {userInfo.driverLogin === false &&
                    ((showTodayMorningSchedule && filterHour) ||
                      (showTodayEveningSchedule && !filterHour))
                    &&
                    userFerryNo &&
                    userFerryNo === name &&
                    checkCancelTime(selectedDate) && (
                      <>
                        <Separator />
                        <TouchableOpacity
                          style={[styles.button, styles.cancelButton]}
                          onPress={() => showConfirmDialog()}>
                          <Text style={styles.buttonText}>Cancel Ride</Text>
                        </TouchableOpacity>
                      </>
                    )}
                </View>
              }
            </View>
            <View>
              <Separator />
              <BusStopAccordion
                filterHour={true}
                busStopList={busStopList}
                driverInfo={driverInfo}
                highlightIndex={highlightIndex}
                userInfo={userInfo}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: 'white',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  image2: {
    width: 30,
    height: 30,
    marginTop: 25,
    marginLeft: 15,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  icon: {
    marginRight: 5,
    width: 18,
    height: 18,
  },
  separator: {
    marginVertical: 10,
  },
  input: {
    justifyContent: 'center',
  },
  checkFerry: {
    marginLeft: 70,
    fontSize: 20,
    alignSelf: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'SourceSerif4-Regular',
    elevation: 30,
    zIndex: 1,
    shadowColor: '#48595c',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  filterHighLigth: {
    top: 25,
  },
  filterNoHighLigth: {
    top: 125,
  },
  filterBus: {
    width: '60%',
    marginRight: '1%',
    marginLeft: '2%',
  },
  filterUser: {
    marginTop: 5,
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  filterDriver: {
    marginTop: 5,
    flexDirection: 'row',
    marginLeft: '60%',
  },
  filterText: {
    marginTop: 4,
    marginHorizontal: 5,
  },
  filterTextEvening: {
    marginTop: 4,
    marginHorizontal: 5,
  },
  button: {
    justifyContent: 'center',
    width: '100%',
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10,
    borderRadius: 15,
    height: 50,
  },
  buttonContainer: {
    flex: 1,
    marginTop: -50,
    marginHorizontal: 30,
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'SourceSerif4-Regular',
    elevation: 30,
    shadowColor: '#48595c',
  },
  cancelButton: {
    marginTop: 20,
    marginBottom: -25,
    backgroundColor: '#f75f3f',
  },
  mapButton: {
    backgroundColor: '#f75f3f',
    marginTop: 10,
  },
  allRouteButton: {
    width: '80%',
    marginLeft: 5,
    backgroundColor: '#309DC5',
  },
  driveButton: {
    marginTop: 35,
    marginBottom: -40,
    backgroundColor: '#0E7E80',
  },
  goToMapButton: {
    marginTop: 40,
    marginBottom: -25,
    backgroundColor: '#f5dd4b',
  },
  ferryMonitoringBtn: {
    marginTop: 35,
    marginBottom: 0,
    backgroundColor: '#f5dd4b',
  },
  goToMapButtonText: {
    color: '#000',
  },
});

export default AllRoute;
