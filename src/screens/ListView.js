import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  DeviceEventEmitter,
} from 'react-native';
import moment from 'moment';
import axios from 'axios';
import { searchEmployee } from '../utils/Util';
import { AuthContext } from '../context/AuthContext';
import CalendarView from '../components/CalendarView';
import ErrorComponent from '../components/ErrorComponent';
import ListViewChild from '../components/ListViewChild';
import { BASE_URL } from '../Config';

const ListView = ({ navigation }) => {
  const [busData, setBusData] = useState({});
  const [busStopList, setBusStopList] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [userFerryNo, setUserFerryNo] = useState();
  const [userFerry, setUserFerry] = useState();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());
  const { userInfo } = useContext(AuthContext);

  let current = moment();
  const [currenttimeSelected, setCurrentTimeSelected] = useState();
  const { logout } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [routeList, setRouteList] = useState([]);
  /**
   * fetch route API data.
   * @param {*} param
   */
  async function fetchBusStopListData(param = null) {
    let checkedIndex = -1;
    let dateParams = null;
    if (param) {
      dateParams = moment(param).format('YYYY-MM-DD');
    } else {
      dateParams = current.format('YYYY-MM-DD');
      setCurrentTimeSelected(current.format('YYYY-MM-DD'));
    }
    const accessToken = `Bearer ` + userInfo.token;
    let configAuth = {
      headers: { Authorization: accessToken },
    };
    await axios
      .get(`${BASE_URL}/route?date=${dateParams}`, configAuth)
      .then(response => {
        let data = [];
        const list = response?.data?.routeData || [];
        setRouteList(list);
        if (userInfo?.driverLogin && response?.data?.routeData) {
          const responseData = response?.data?.routeData.find(
            route => route.driverId === userInfo?.driverInformation?.id,
          );
          if (responseData?.length > 0) data = responseData;
        } else if (response?.data?.routeData) {
          let index = response?.data?.routeData.findIndex((route, index) => {
            let result = route?.morningData.find((dist, count) => {
              const findData = dist.employees.find(
                data =>
                  data?.employeeId === userInfo?.userInfomation?.employeeId &&
                  data?.company === userInfo?.userInfomation?.company,
              );
              if (findData) {
                return true;
              } else if (count === route.morningData.length - 1) {
                return false;
              }
            });
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
        if (data && userInfo.driverLogin === false) {
          setBusData(data);
          checkedIndex = searchEmployee(
            data.morningData,
            userInfo.userInfomation.employeeId,
            userInfo.userInfomation.company,
          );
          setHighlightIndex(checkedIndex);
          if (checkedIndex >= 0) {
            setUserFerryNo(data.ferryNo);
            setUserFerry({ "id": data.ferryNo, "name": data.ferryNo });
          }
        } else {
          setBusData(data);
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
    fetchBusStopListData(param);
  };

  useEffect(() => {
    let callAPI = async () => {
      try {
        await fetchBusStopListData();
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
      callAPI = () => { };
    };
  }, []);

  useEffect(() => {
    if (
      busData !== undefined &&
      Object.keys(busData).length !== 0 &&
      userInfo.driverLogin === false
    ) {
      let checkedIndex = -1;
      checkedIndex = searchEmployee(
        busData.morningData,
        userInfo.userInfomation.employeeId,
        userInfo.userInfomation.company,
      );
      setHighlightIndex(checkedIndex);
    } else if (busData !== undefined) {
      setBusStopList(busData.morningData);
    }
  }, [busData, highlightIndex]);

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
                  error || 'သင်သည် ယနေ့အတွက် ဖယ်ရီစီးရန် စာရင်းမသွင်းထားပါ'
                }
              />
            </View>
          ) : (
            <ListViewChild
              navigation={navigation}
              routeList={routeList}
              userBusStopList={busStopList}
              highlightIndex={highlightIndex}
              selectedDate={selectedDate}
              currenttimeSelected={currenttimeSelected}
              userFerryNo={userFerryNo}
              userFerry={userFerry}
              busData={busData}></ListViewChild>
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
                      source={require('../../assets/icons8-logout-48.png')}
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

export default ListView;
