import "./App.scss";
import React, { useEffect, useContext, Suspense, useState } from "react";
import Crowdfunding from "./abis/Crowdfunding.json";
import CBTokenSale from "./abis/CBTokenSale.json";
import CBToken from "./abis/CBToken.json";

import { Loader } from "./containers/loader/loader";
import { Switch, Route, Redirect } from "react-router-dom";
import Web3 from "web3";
import { lazily } from "react-lazily";
import { crowdfundingContext } from "./context/crowdfundingContext";
import { authContext } from "./context/authContext";
import { Home, Register, Login, Admin } from "./containers/page";

function App() {
  const { auth, setAuth } = useContext(authContext);
  const {
    setCrowdfunding,
    CBT_TokenSale,
    setCBToken,
    setCBTokenSale,
    setLoading,
    loading,
  } = useContext(crowdfundingContext);
  const [accept, setAccept] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      await checkAccount();
    })();
  }, [ready]);

  useEffect(() => {
    (async () => {
      await loadWeb3();
      window.ethereum.on("accountsChanged", function (accounts) {
        setLoading(false);
        setReady(false);
        setAccept(false);
        setAuth(false);
        localStorage.setItem('auth', false);
        setTimeout(async () => {
          setReady(true);
        }, 2000);
      });

      window.ethereum.on("networkChanged", function (networkId) {
        setLoading(false);
        setAuth(false);
        setAccept(false);
        setReady(false);
        localStorage.setItem('auth', false);
        setTimeout(async () => {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          loadContract();
        }, 2000);
      });
      //load Blockchain
      await loadContract();
    })();
    //init web3
  }, []);

  const checkAccount = async () => {
    if (ready) {
      const deployer = await CBT_TokenSale.methods.admin().call();
      const accounts = await window.web3.eth.getAccounts();
      const admin = accounts[0];
      if (admin === deployer) {
        setAccept(true);
      }
      setLoading(true);
    }
  };

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      alert("Error");
    }
  };

  const loadContract = async () => {
    const web3 = window.web3;
    const networdId = await web3.eth.net.getId();
    const networdData_crowdfunding = Crowdfunding.networks[networdId];
    const networdData_CBToken = CBToken.networks[networdId];
    const networdData_CBTokenSale = CBTokenSale.networks[networdId];

    if (
      networdData_crowdfunding &&
      networdData_CBToken &&
      networdData_CBTokenSale
    ) {
      const CBT_Token = new web3.eth.Contract(
        CBToken.abi,
        networdData_CBToken.address
      );
      const CBT_TokenSale = new web3.eth.Contract(
        CBTokenSale.abi,
        networdData_CBTokenSale.address
      );
      const crowdfunding = new web3.eth.Contract(
        Crowdfunding.abi,
        networdData_crowdfunding.address
      );

      setCBToken(CBT_Token);
      setCBTokenSale(CBT_TokenSale);
      setCrowdfunding(crowdfunding);
      setReady(true);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {!loading ? (
        <Loader></Loader>
      ) : (
        <>
          <Switch>
            <Route path="/login">
              {!auth ? <Login /> : <Redirect to="/" />}
            </Route>
            <Route path="/register-startup">
              {!auth ? <Register accountType="Startup" /> : <Redirect to="/" />}
            </Route>
            <Route path="/register-investor">
              {!auth ? (
                <Register accountType="Investor" />
              ) : (
                <Redirect to="/" />
              )}
            </Route>
            <Route path="/admin">
              {accept ? <Admin /> : <Redirect to="/" />}
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </>
      )}
    </div>
  );
}
export default App;
