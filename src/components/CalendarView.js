import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';

/**
 * Calendar view
 */
let datesWhitelist = [
  {
    start: moment().add(-4, 'days'),
    end: moment().add(5, 'days'),
  },
];
let datesBlacklist = [moment().add(7, 'days')];
const CalendarView = ({ selectDate }) => {
  const defaultSelectedDate = moment().add(0, 'days');

  let customDatesStyles = [];
  let startDate = moment();
  for (let count = -5; count < 6; count++) {
    customDatesStyles.push({
      startDate: startDate.clone().add(count, 'days'), // Single date since no endDate provided
      dateNameStyle: styles.dateNameStyle,
      dateNumberStyle: styles.dateNumberStyle,
    });
  }

  return (
    <View>
      <CalendarStrip
        calendarAnimation={{ type: 'sequence', duration: 0 }}
        daySelectionAnimation={{
          type: 'background',
          duration: 0,
          highlightColor: 'white',
        }}
        style={{ height: 100, paddingTop: 10, paddingBottom: 10 }}
        calendarHeaderStyle={styles.headerTextStyle}
        calendarColor={'#167D7F'}
        dateNameStyle={styles.dateNameStyle}
        highlightDateNumberStyle={{ color: '#167D7F' }}
        highlightDateNameStyle={{ color: '#167D7F' }}
        disabledDateNameStyle={{ color: 'white' }}
        disabledDateNumberStyle={{ color: 'white' }}
        datesWhitelist={datesWhitelist}
        datesBlacklist={datesBlacklist}
        customDatesStyles={customDatesStyles}
        iconLeft={require('../../assets/leftArrow.png')}
        iconRight={require('../../assets/rightArrow.png')}
        onDateSelected={selectDate}
        selectedDate={defaultSelectedDate}
        iconContainer={{ flex: 0.1 }}
        scrollable={true}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  headerTextStyle:{
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold'
  },
  dateNumberStyle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  dateNameStyle: {
    color: 'white',
    fontSize: 12,
  }
});
export default CalendarView;