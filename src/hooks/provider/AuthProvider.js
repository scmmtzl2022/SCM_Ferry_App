import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../config"
import { AuthContext } from "../context/Context";

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(false);

  /**
   * login user.
   * @param {*} loginID
   * @param {*} password
   * @returns
   */
  const login = async (loginID, password, company) => {
    setIsLoading(true);

    const res = await axios
      .post(`${BASE_URL}/ferryLogin`, {
        loginId: loginID,
        password: password,
        company: company,
      })
      .then(res => {
        let userInfo = res.data;
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        setIsLoading(false);
        return true;
      })
      .catch(e => {
        console.log('ferry login error');
        console.log(e);
        setIsLoading(false);
        return false;
      });
    return res;
  };

  /**
   * check user login status
   */
  const isLoggedIn = async () => {
    try {
      setSplashLoading(true);

      let userInfo = await AsyncStorage.getItem('userInfo');
      userInfo = JSON.parse(userInfo);

      if (userInfo) {
        setUserInfo(userInfo);
      }

      setSplashLoading(false);
    } catch (e) {
      setSplashLoading(false);
      console.log(`is logged in error ${e}`);
    }
  };

  /**
   * user logout function.
   */
  const logout = () => {
    AsyncStorage.removeItem('userInfo');
    setUserInfo({});
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userInfo,
        splashLoading,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
