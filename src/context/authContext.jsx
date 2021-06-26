// @flow
import React, { useState, useEffect } from "react";

export const authContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  useEffect(() => {
    setAuth(localStorage.getItem("auth") === "true");
  }, []);
  const setAuthenticate = (value) => {
    setAuth(value);
  };

  const exportContext = {
    auth,
    setAuth: setAuthenticate,
  };

  return (
    <authContext.Provider value={exportContext}>
      {children}
    </authContext.Provider>
  );
};
