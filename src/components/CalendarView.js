import React from 'react';
import {
  View,
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
  const defaultSelectedDate = moment().add(0,'days');

  return (
    <View>
      <CalendarStrip
        calendarAnimation={{ type: 'sequence', duration: 0 }}
        daySelectionAnimation={{
          type: 'border',
          duration: 0,
          borderWidth: 1,
          borderHighlightColor: 'white',
        }}
        style={{ height: 100, paddingTop: 20, paddingBottom: 10 }}
        calendarHeaderStyle={{ color: 'white' }}
        calendarColor={'#00c292'}
        dateNameStyle={{ color: 'white' }}
        highlightDateNumberStyle={{ color: 'yellow' }}
        highlightDateNameStyle={{ color: 'yellow' }}
        disabledDateNameStyle={{ color: 'white' }}
        disabledDateNumberStyle={{ color: 'white' }}
        datesWhitelist={datesWhitelist}
        datesBlacklist={datesBlacklist}
        onDateSelected={selectDate}
        selectedDate={defaultSelectedDate}
        iconContainer={{ flex: 0.1 }}
        scrollable={true}
      />
    </View>
  );
}

export default CalendarView;