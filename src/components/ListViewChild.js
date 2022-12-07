import React, { useState, useEffect, useContext } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  View,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Provider } from 'react-native-paper';
import DropDown from './DropDown';
import BusStopListChild from './BusStopListChild';
import { removeNoActiveBusStop } from '../utils/Util';

const Separator = () => <View style={styles.separator} />;

const ListViewChild = ({
  navigation,
  routeList,
  highlightIndex,
  selectedDate,
  userBusStopList,
  userFerryNo,
  userFerry,
}) => {

  const [busList, setbusList] = useState([]);
  const { userInfo } = useContext(AuthContext);
  const [driverInfo, setDriverInfo] = useState({});
  const [busStopList, setBusStopList] = useState(userBusStopList);
  const [ferryData, setFerryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(userFerry)
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
   * click goToMap button.
   */
  const goToMap = async () => { };
  /**
   * phone call function.
   * @param {*} phone
   */
  const phonecall = phone => {
    Linking.openURL(`tel:${phone}`);
  };
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
    const ferryData = routeData?.filter(
      route => route.ferryNo === selectedFerry,
    );
    if (ferryData?.length > 0) {
      setDriverInfo({
        driverName: ferryData[0].driverName,
        driverPhone: ferryData[0].driverPhone,
      });
      setFerryData(ferryData[0]);
      if (dropdown) {
        const updatedBusStopList = removeNoActiveBusStop(
          ferryData[0].morningData,
        );
        setBusStopList(updatedBusStopList);
        ;
      } else {
        const updatedBusStopList = removeNoActiveBusStop(
          ferryData[0].morningData,
        );
        setBusStopList(updatedBusStopList);
      }
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
                <View style={styles.buttonContainer}>
                  {/* driver when active */}
                  {
                    (
                      <TouchableOpacity
                        style={[styles.button, styles.goToMapButton]}
                        onPress={() => goToMap(navigation.navigate('MapView', { IMEIName: driverInfo.driverName, driverPhone: driverInfo.driverPhone, selectedFerry: selectedItem }))}>
                        <Text
                          style={[styles.buttonText, styles.goToMapButtonText]}>
                          Map View
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
              <View
                style={styles.filterUser}>
                <TouchableOpacity
                  onPress={() => phonecall(driverInfo.driverPhone)}>
                  <Image
                    style={styles.img}
                    source={require('../../assets/phone.png')}
                    accessibilityLabel="driver-phone-icon"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <BusStopListChild
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
  icon: {
    marginRight: 5,
    width: 18,
    height: 18,
  },
  separator: {
    marginVertical: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  filterNoHighLigth: {
    top: 125,
  },
  filterBus: {
    width: '46%',
    marginRight: '3%',
    marginLeft: '2%',
  },
  buttonContainer: {
    width: '46%',
    marginRight: '2%',
  },
  filterUser: {
    flexDirection: 'row',
    marginLeft: 'auto',
    zIndex: 2,
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
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontFamily: 'SourceSerif4-Regular',
    elevation: 30,
    shadowColor: '#48595c',
  },
  mapButton: {
    backgroundColor: '#f75f3f',
    marginTop: 10,
  },
  img: {
    width: 27,
    height: 25,
    marginRight: 30,
    top: 35,
  },
  allRouteButton: {
    width: '80%',
    marginLeft: 5,
    backgroundColor: '#309DC5',
  },
  goToMapButton: {
    backgroundColor: '#f5dd4b',
    padding: 10,
  },
  goToMapButtonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default ListViewChild;
