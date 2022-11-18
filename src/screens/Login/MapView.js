import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
// import MapboxGL from '@mapbox/react-native-mapbox-gl';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken('pk.eyJ1IjoibWF5dGh1emFybGluIiwiYSI6ImNsOTgwYmptNDJqaG4zdnFtMGZkOWdueHQifQ.IN2f_fxmhMtT8RhqnOclrg');
// MapboxGL.setAccessToken('pk.eyJ1IjoibWF5dGh1emFybGluIiwiYSI6ImNsOTgwYmptNDJqaG4zdnFtMGZkOWdueHQifQ.IN2f_fxmhMtT8RhqnOclrg');
const MapView = () => {
    
        return (
          <View style={styles.page}>
            <View style={styles.container}>
            <MapboxGL.MapView style={styles.map} />
              {/* <MapboxGL.MapView style={styles.map} /> */}
              {/* <Text>Map View</Text> */}
            </View>
          </View>
        );
      
    }
const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'tomato'
  },
  map: {
    flex: 1
  }
});

export default MapView;
