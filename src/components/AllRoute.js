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
import { AuthContext } from '../context/AuthContext';
import { Provider } from 'react-native-paper';
import DropDown from '../components/DropDown';
import BusStopAccordion from './BusStopAccordion';
import { removeNoActiveBusStop } from '../utils/Util';

const Separator = () => <View style={styles.separator} />;

const AllRoute = ({
  navigation,
  routeList,
  cancelRide,
  timeList,
  timeFilter,
  showTodayMorningSchedule,
  showTodayEveningSchedule,
  highlightIndex,
  selectedDate,
  userBusStopList,
  userFerryNo,
  goToMap,
}) => {

  const [busList, setbusList] = useState([]);
  const { userInfo } = useContext(AuthContext);
  const [driverInfo, setDriverInfo] = useState({});
  const [busStopList, setBusStopList] = useState(userBusStopList);
  const [filterHour, setFilterHour] = useState(timeFilter);
  const [ferryData, setFerryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null)
  let current = moment();

  /**
   * Drop down function.
   */
  const onSelect = (item) => {
    let choosenferry;
    setSelectedItem(item);
    choosenferry = item.name;
    showRouteList(routeList, choosenferry, true);
  }

  /**
   * call route API with dateTime.
   */
  async function fetchMyAPI() {
    if (userInfo.driverLogin) {
      const list = [];
      routeList?.map(route => {
        list.push({
          id: route.ferryNo,
          name: route.ferryNo,
        });
      });
      setbusList(list);
      // console.log("List =>  ", list)
      // console.log("routeList =>  ", routeList)
      list?.length > 0 && setSelectedItem(list[0]);
      const index = routeList.findIndex(
        route => route.driverId === userInfo.driverInformation.id,
      );
      let selectedFerry = [];
      if (list?.length > 0 && index !== -1) {
        selectedFerry = list[index].name;
      }
      showRouteList(routeList, selectedFerry);
    } else {
      const list = [];
      routeList?.map(route => {
        list.push({
          id: route.ferryNo,
          name: route.ferryNo,
        });
      });
      setbusList(list);
      let data = [];
      if (userFerryNo) {
        data = list.filter(route => route.name === userFerryNo);
      } else if (list?.length > 0) {
        data = [list[0]];
      }
      const selectedFerry = data?.length > 0 ? data[0].name : null;
      showRouteList(routeList, selectedFerry);
    }
  }

  /**
   * show route list with ferryNo.
   * @param {*} routeData
   * @param {*} selectedFerry
   */
  const showRouteList = (routeData, selectedFerry, dropdown = false) => {

    // {console.log("routeData :  ", routeData)}
    // {console.log("selectedFerry => : ", selectedFerry)}
    const ferryData = routeData?.filter(
      route => route.ferryNo === selectedFerry,
    );
    //  {console.log("ferryData : ", ferryData)}
    if (ferryData?.length > 0) {
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
            ferryData[0].morningData,
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
    return () => {
      setBusStopList([]);
    };
  }, [selectedDate]);



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
    const isToday =
      selectedDate.format('YYYY-MM-DD') === current.format('YYYY-MM-DD');
    const isAnotherDay =
      selectedDate?.format('YYYY-MM-DD') > current.format('YYYY-MM-DD');
    if (
      (!filterHour &&
        isToday &&
        currentTime.isBetween(
          moment(timeList.cancelEveningStartTime, 'h:mma'),
          moment(timeList.cancelEveningEndTime, 'h:mma'),
        )) ||
      (!filterHour && isAnotherDay)
    )
      return true;
    else if (
      (filterHour &&
        isToday &&
        currentTime.isBetween(
          moment(timeList.cancelMorningStartTime, 'h:mma'),
          moment(timeList.cancelMorningEndTime, 'h:mma'),
        )) ||
      (filterHour && isAnotherDay)
    )
      return true;
    else return false;
  };

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
                      value={selectedItem}
                      data={busList}
                      onSelect={onSelect}
                      busSchedulePage={true}
                    />
                  </View>
                )}

                <View
                  style={styles.filterUser}>
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
                  {((
                    showTodayMorningSchedule &&
                    filterHour) ||
                    (
                      showTodayEveningSchedule &&
                      !filterHour)) &&
                    (
                      <TouchableOpacity
                        style={[styles.button, styles.goToMapButton]}
                        onPress={() => goToMap(navigation.navigate('MapView', { IMEIName: driverInfo.driverName, driverPhone: driverInfo.driverPhone }))}>
                        <Text
                          style={[styles.buttonText, styles.goToMapButtonText]}>
                          Map View
                        </Text>
                      </TouchableOpacity>
                    )}
                  <Separator />
                  {/* user */}
                  {userInfo.driverLogin === false && (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => showConfirmDialog()}>
                      <Text style={styles.buttonText}>Cancel Ride</Text>
                    </TouchableOpacity>
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10,
    borderRadius: 4,
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
