import React, { useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

const Offlinealert = () => {
  const netInfo = useNetInfo();
  const handleBackButton = () => {
    Alert.alert(
      'Applicationမှထွက်ရန်',
      'Applicationမှ ထွက်ရန် သေချာပါသလား?',
      [
        {
          text: 'မထွက်ပါ',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'ထွက်မည်',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      {
        cancelable: false,
      },
    );
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  }, [netInfo.isConnected]);

  /**
   * go to settings page.
   */
  const goToSetting = () => {
    console.log('go to Setting');
    Platform.OS === 'ios'
      ? Linking.openURL('App-prefs:root=MOBILE_DATA_SETTINGS_ID')
      : Linking.sendIntent("android.settings.DATA_ROAMING_SETTINGS");
  };

  if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false)
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require('../../assets/waiting.png')}
          style={styles.img2}
        />
        <Text style={styles.warningText}>Offline ဖြစ်နေပါသည်</Text>
        <Text style={styles.warningText02}>
          သင်၏ internet connection အားစစ်ဆေးပါ။
        </Text>
        <TouchableOpacity style={styles.button02} onPress={() => goToSetting()}>
          <Text style={styles.buttonText}>Go to Setting</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f9fb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
  button02: {
    justifyContent: 'center',
    width: Dimensions.get('window').width / 1.9,
    backgroundColor: '#167D7F',
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10,
    borderRadius: 12,
    height: 45,
    marginTop: 13,
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    elevation: 30,
    shadowColor: '#48595c',
  },
  warningText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#808080',
    backgroundColor: 'transparent',
    elevation: 30,
    shadowColor: '#48595c',
    margin: 5,
  },
  warningText02: {
    fontSize: 16,
    textAlign: 'center',
    color: '#979797',
    backgroundColor: 'transparent',
    elevation: 30,
    shadowColor: '#48595c',
    marginBottom: 5,
  },
  img2: {
    width: 150,
    height: 130,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default Offlinealert;
