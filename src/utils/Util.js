import axios from 'axios';
import { BASE_URL } from '../Config';

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

/**
 * search employee with employeeId and company
 * @param {*} busStopList
 * @param {*} employeeId
 * @returns
 */
export function searchEmployee(busStopList, employeeId, company) {
  let index = busStopList?.findIndex((busStop, i) => {
    const dist = busStop.employees.find(
      employee =>
        employee.employeeId === employeeId &&
        employee.isActive === true &&
        employee.company === company,
    );
    if (dist !== undefined) {
      return true;
    } else {
      return false;
    }
  });
  return index;
};

/**
 * get time list data from API.
 */
export async function getTimeList() {
  const res = await axios(`${BASE_URL}/timeList`)
    .then(response => {
      let timeParam = {};
      if (response?.data?.timeList && response?.data?.timeList.length > 0) {
        timeParam = {
          checkHour: response.data.timeList[0].checkHour,
          drivingMorningStartTime:
            response.data.timeList[0].drivingMorningStartTime,
          drivingMorningEndTime:
            response.data.timeList[0].drivingMorningEndTime,
          drivingEveningStartTime:
            response.data.timeList[0].drivingEveningStartTime,
          drivingEveningEndTime:
            response.data.timeList[0].drivingEveningEndTime,
          cancelMorningStartTime:
            response.data.timeList[0].cancelMorningStartTime,
          cancelMorningEndTime: response.data.timeList[0].cancelMorningEndTime,
          cancelEveningStartTime:
            response.data.timeList[0].cancelEveningStartTime,
          cancelEveningEndTime: response.data.timeList[0].cancelEveningEndTime
        };
      }
      return timeParam;
    }).catch(error => {
      console.log('time list error: ', error);
      return {};
    });
  return res;
}