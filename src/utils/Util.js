import axios from 'axios';
import { BASE_URL } from '../config';

/**
 * remove not active bus stop.
 * @param {*} busStopList
 */
export function removeNoActiveBusStop(busStopList) {
  let newBusStopList = busStopList?.filter((busStop, i) => {
    let activeEmployeeList = busStop.employees.filter(
      employee => employee.isActive === true,
    );
    busStop.employees = activeEmployeeList;
    if (activeEmployeeList.length != 0) {
      return busStop;
    } else if (i === 0 || i === busStopList.length - 1) {
      return busStop;
    }
  });
  return newBusStopList;
}