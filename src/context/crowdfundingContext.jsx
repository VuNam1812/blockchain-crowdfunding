// @flow
import React, { useState } from "react";

export const crowdfundingContext = React.createContext();

export const CrowdfundingProvider = ({ children }) => {
  const [crowdfunding, setCrowdfunding] = useState(null);
  const [CBT_Token, setCBToken] = useState(null);
  const [CBT_TokenSale, setCBTokenSale] = useState(null);

  const [loading, setLoading] = useState(false);
  const setStateCrowdfunding = (value) => {
    setCrowdfunding(value);
  };
  const setStateCBT_TokenSale = (value) => {
    setCBTokenSale(value);
  };
  const setStateCBT_Token = (value) => {
    setCBToken(value);
  };

  const exportContext = {
    CBT_TokenSale,
    CBT_Token,
    loading,
    crowdfunding,
    setCBTokenSale: setStateCBT_TokenSale,
    setCBToken: setStateCBT_Token,
    setLoading,
    setCrowdfunding: setStateCrowdfunding,
  };

  return (
    <crowdfundingContext.Provider value={exportContext}>
      {children}
    </crowdfundingContext.Provider>
  );
};
