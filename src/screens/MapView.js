import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, SafeAreaView, View, Image, TouchableOpacity, Linking, } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import moment from 'moment';
import { CommonStyle } from "./Common.style";
import { accessToken } from "../Config";
import { AuthContext } from '../context/AuthContext';
import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';
import { lineString as makeLineString } from '@turf/helpers';
import { BASE_URL, JIMI_URL, callTimer } from '../Config';
import gps from '../../assets/gps.png';

MapboxGL.setAccessToken(accessToken);
const directionsClient = MapboxDirectionsFactory({ accessToken });
const MapView = ({ navigation, route }) => {
  let [carLocation, setCarLocation] = useState(null);
  let [allBusStopArr, setAllBusStop] = useState();
  let [allRouteArr, setRoute] = useState([]);
  let _camera;
  let timer;
  const [modalVisible, setModalVisible] = useState(false);
  const { userInfo } = useContext(AuthContext);
  const [modalObject, setmodalObject] = useState(null);
  /**
   * Call jimi location api
   */
  const callJimiLocationInterface = () => {
    axios
      .get(`${JIMI_URL}`)
      .then(response => {
        const selectedIMEI = response?.data?.imeiList.find(item => item.imei === '865784052487926');
        setCarLocation([selectedIMEI.lng, selectedIMEI.lat]);
      })
      .catch(err => {
        console.log("Location request from GPS device failed.", err)
      });
  }
  /**
   * Get access token
   */
  const getLocation = () => {
    callJimiLocationInterface();
    timer = setInterval(() => {
      callJimiLocationInterface();
    }, callTimer * 1000);
  }
  /**
   * Clear interval
   */
  const StopInterval = () => {
    clearInterval(timer);
    console.log("Cleared interval!!!");
  }
  /**
   * Zoom button
   */
  const centeringButtonPress = () => {
    _camera !== undefined &&
      _camera?.flyTo(carLocation, 1000);
  };
  useEffect(() => {
    getLocation();
    getAllRoutes(route.params.selectedFerry);
    setModalVisible(true);
    centeringButtonPress();
    return () => {
      StopInterval();
    }
  }, []);

  const stopPress = () => {
    StopInterval();
    setCarLocation(null);
    navigation.navigate(`ListView`);
  };

  /**
   * Get all route
   */
  async function getAllRoutes(ferryActiveList) {
    let dateParams = moment().format('YYYY-MM-DD');
    let accessToken = `Bearer ` + userInfo.token;
    let configAuth = {
      headers: { Authorization: accessToken },
    };
    await axios
      .get(`${BASE_URL}/route?date=${dateParams}`, configAuth)
      .then(response => {
        if (response.data) {
          const busallRoute = response.data;
          const activeIndex = busallRoute.routeData.find(
            ferry => ferry.ferryNo === ferryActiveList.name,
          );
          if (activeIndex.morningData?.length > 0) {
            drawRoute(activeIndex, '#167D7F');
            setAllBusStop(activeIndex.morningData);
          }
        }
      })
      .catch(err => {
        console.log(" Failed fetching route data by date from ems api!!!!", err)
      })
  };
  /**
   * Draw Route
   */
  async function drawRoute(busStopData, color) {
    let preAllRouteArr = allRouteArr;
    if (busStopData) {
      const waypoints = [];
      for (let element of busStopData?.eveningData) {
        if (element?.location) {
          let coordinatesObj = {
            coordinates: [
              Number(element.location.lng),
              Number(element.location.lat),
            ],
          };
          waypoints.push(coordinatesObj);
        }
      }
      const reqOptions = {
        waypoints: waypoints,
        profile: 'driving',
        geometries: 'geojson',
      };
      const res = await directionsClient.getDirections(reqOptions).send();
      let newRoute = makeLineString(res.body.routes[0].geometry.coordinates);
      (newRoute.properties = {
        color: color,
      }),
        preAllRouteArr.push(newRoute);
      setRoute([...preAllRouteArr]);
    }
  }
  /**
   * Render Busstop List
   */
  const renderBusStopAnnotations = () => {
    let features = [];
    allBusStopArr?.map((item, index) => {
      let feature = {
        type: 'Feature',
        id: `${index}`,
        properties: {
          id: `${index}`,
        },
        geometry: {
          type: 'Point',
          coordinates: [Number(item.location.lng), Number(item.location.lat)],
        },
      };
      features.push(feature);
    });
    const featureCollection = {
      type: 'FeatureCollection',
      features: features,
    };
    return allBusStopArr ? (
      <>
        <MapboxGL.ShapeSource
          id="symbolLocationSource"
          shape={featureCollection}>
          <MapboxGL.SymbolLayer
            id="userPoints"
            aboveLayerID="routeFill"
            style={{
              iconImage: gps,
              iconSize: 0.5,
              iconPadding: 0,
              iconAnchor: 'center',
            }}
          />
        </MapboxGL.ShapeSource>
      </>
    ) : null;
  };
  /**
   * Render Route
   */
  const renderRoute = (routeArr, i) => {
    return routeArr ? (
      <MapboxGL.LineLayer
        id="routeFill"
        key={Math.random()}
        style={{
          lineJoin: 'round',
          lineColor: ['get', 'color'],
          lineWidth: 3,
          lineCap: 'round',
        }}
      />
    ) : null;
  };

  const renderActions = () => (
    <View
      style={{
        position: 'absolute',
        left: 10,
        top: 10,
        padding: 5,
      }}>
      <TouchableOpacity
        style={{
          ...CommonStyle.mapButton,
        }}
        onPress={() => {
          stopPress()
        }}>
        <Image
          source={require('../../assets/back.png')}
          style={styles.image2}
        />
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex}>

        <MapboxGL.MapView
          style={styles.flex}
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
            centerCoordinate={carLocation}
            followUserLocation={false}
            defaultSettings={{
              centerCoordinate: carLocation,
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
            coordinate={carLocation}>
            <View>
              <Image
                testID="car-location{renderModal()}"
                style={styles.car_location}
                source={require('../../assets/car_location.png')}
              />
            </View>
          </MapboxGL.MarkerView>
          {allBusStopArr?.length > 0 && renderBusStopAnnotations()}
          {allBusStopArr?.length > 0 && (      
            <MapboxGL.ShapeSource
              id="routeSource"
              shape={{
                type: 'FeatureCollection',
                features: allRouteArr,
              }}>

              {allRouteArr?.map((data, index) => renderRoute(data, index))}
            </MapboxGL.ShapeSource>
          )}          
        </MapboxGL.MapView>
        {renderActions()}
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
  image2: {
    width: 30,
    height: 30,
  },
  img3: {
    width: 30,
    height: 30,
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
