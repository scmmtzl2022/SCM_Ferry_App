import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import {List} from 'react-native-paper';

const BusStopAccordion = ({
  busStopList,
  driverInfo,
  highlightIndex,
  userInfo,
  driverMap,
}) => {
  /**
   * phone call function.
   * @param {*} phone
   */
  const phonecall = phone => {
    Linking.openURL(`tel:${phone}`);
  };
  return (
    <List.Section
      style={
        driverMap ? styles.busStopCardDriverMap : styles.busStopCardBusSchedule
      }>
      {busStopList !== undefined &&
        busStopList?.map((busStopData, index) => {
          return index === 0 ||
            index === busStopList.length - 1 ||
            busStopData.employees.length > 0 ? (
            <List.Accordion
              key={'busstopCard' + index}
              theme={{colors: {primary: '#000'}}}
              style={{
                backgroundColor:
                  busStopData.employees.findIndex(
                    employee =>
                      employee.employeeId ===
                        userInfo?.userInfomation?.employeeId &&
                      employee.company === userInfo?.userInfomation?.company,
                  ) !== -1
                    ? '#f5dd4b'
                    : 'white',
                marginBottom: 1,
              }}
              title={busStopData.name}
              right={props => {
                return index === 0 ? (
                  <View style={styles.rightInfo}>
                    <Image
                      style={styles.arrowIcon}
                      source={require('../../assets/driver.png')}
                    />
                  </View>
                ) : index !== busStopList.length - 1 &&
                  busStopData.employees.length === 1 ? (
                  <View style={styles.rightInfo}>
                    <Image
                      style={styles.riderIcon}
                      source={require('../../assets/one_user.png')}
                    />
                    <Text style={styles.riderNo}>
                      {'  ' + busStopData.employees.length + ' ဦး'}
                    </Text>
                    {props.isExpanded ? (
                      <Image
                        style={styles.arrowIcon}
                        source={require('../../assets/arrowUp.png')}
                      />
                    ) : (
                      <Image
                        style={styles.arrowIcon}
                        source={require('../../assets/arrow.png')}
                      />
                    )}
                  </View>
                ) : index !== busStopList.length - 1 &&
                  busStopData.employees.length > 1 ? (
                  <View style={styles.rightInfo}>
                    <Image
                      style={styles.riderIcon}
                      source={require('../../assets/two_user.png')}
                    />

                    <Text style={styles.riderNo}>
                      {'  ' + busStopData.employees.length + '  ဦး'}
                    </Text>
                    {props.isExpanded ? (
                      <Image
                        style={styles.arrowIcon}
                        source={require('../../assets/arrowUp.png')}
                      />
                    ) : (
                      <Image
                        style={styles.arrowIcon}
                        source={require('../../assets/arrow.png')}
                      />
                    )}
                  </View>
                ) : null;
              }}
              left={() => (
                <View style={styles.leftContainer}>
                  <Text style={styles.busStopTime}>{busStopData?.time}</Text>
                  {/* left icons */}
                  {index === 0 ? (
                    <Image
                      style={styles.busStopIcon}
                      source={require('../../assets/logo_5.png')}
                    />
                  ) : index !== busStopList.length - 1 ? (
                    <Image
                      style={styles.busStopIcon}
                      source={require('../../assets/rre.png')}
                    />
                  ) : (
                    <Image
                      style={styles.lastBusStopIcon}
                      source={require('../../assets/work.png')}
                    />
                  )}
                </View>
              )}>
              {/* first list items */}
              {index === 0 && (
                <List.Item
                  key={index}
                  left={() => (
                    <Text style={styles.employeeName}>
                      {'Driver - ' + driverInfo.driverName}
                    </Text>
                  )}
                  right={() => (
                    <TouchableOpacity
                      onPress={() => phonecall(driverInfo.driverPhone)}>
                      <Image
                        style={styles.img}
                        source={require('../../assets/phone.png')}
                        accessibilityLabel="driver-phone-icon"
                      />
                    </TouchableOpacity>
                  )}
                />
              )}
              {/* list items */}
              {index !== 0 &&
                busStopData.employees.map((employee, index) => {
                  return (
                    <List.Item
                      key={index}
                      left={() => (
                        <Text
                          style={
                            userInfo?.userInfomation?.employeeId !==
                              employee.employeeId ||
                            userInfo?.userInfomation?.company !==
                              employee.company
                              ? styles.employeeName
                              : [styles.employeeName, styles.activeEmployee]
                          }>
                          {employee.employeeName}
                        </Text>
                      )}
                      right={() =>
                        userInfo.driverLogin && (
                          <TouchableOpacity
                            onPress={() => phonecall(employee.phone)}>
                            <Image
                              style={styles.phoneImg}
                              source={require('../../assets/phone.png')}
                              accessibilityLabel="employee-phone-icon"
                            />
                          </TouchableOpacity>
                        )
                      }
                    />
                  );
                })}
            </List.Accordion>
          ) : null;
        })}
    </List.Section>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'center',
  },
  busStopCardBusSchedule: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 20,
    fontSize: 14,
    justifyContent: 'center',
    marginBottom: 120,
    paddingBottom: 20,
  },
  busStopCardDriverMap: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 14,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  busStopTime: {
    marginTop: 5,
    marginRight: 10,
  },
  employeeName: {
    marginLeft: 75,
    fontSize: 14,
    alignSelf: 'center',
    color: '#000',
  },
  activeEmployee: {
    color: 'green',
  },
  img: {
    width: 25,
    height: 25,
  },
  phoneImg: {
    width: 25,
    height: 25,
    marginRight: '22%',
  },
  busStopIcon: {
    width: 30,
    height: 30,
  },
  riderIcon: {
    marginTop: -8,
    width: 30,
    height: 30,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  lastBusStopIcon: {
    width: 25,
    height: 25,
  },
  rightInfo: {
    flexDirection: 'row',
  },
  riderNo: {
    marginRight: 20,
    fontSize: 14,
    color: '#000',
  },
});

export default BusStopAccordion;
