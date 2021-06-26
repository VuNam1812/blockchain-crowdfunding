// @flow
import React, { useEffect, useState, useContext, Suspense } from "react";
import { Header } from "../../header/header";
import background from "../../../public/image/background.jpg" ;
import "./style.scss";
import { crowdfundingContext } from "../../../context/crowdfundingContext";
import { authContext } from "../../../context/authContext";
import { Startup, Investor, HomeBase } from "./rolePage";
import {Loader} from '../../loader/loader';

export const Home = (props) => {
  const { auth, setAuth } = useContext(authContext);
  const { crowdfunding, loading, CBT_Token } = useContext(crowdfundingContext);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (loading && auth) {
      (async () => {
        await loadAccount();
      })();
    }
  }, [loading, auth]);

  const loadAccount = async () => {
    const accounts = await window.web3.eth.getAccounts();
    const currentAccount = accounts[0];
    const newAccount = await crowdfunding.methods
      .accounts(currentAccount)
      .call();
    if (!newAccount.isReg) {
      setAuth(false);
      return;
    }
    newAccount.balance = await CBT_Token.methods
      .balanceOf(currentAccount)
      .call();
    setAccount(newAccount);
  };

  return (
    <>
      <Header loadAccount={loadAccount}></Header>
      <Suspense fallback={<Loader></Loader>}>

        <div
          className="home"
          style={{ backgroundImage: `url(${background})` }}
        >
          
          {!auth || account === null ? (
            <HomeBase></HomeBase>
          ) : (
            (() => {
              switch (account.accountType) {
                case "Startup":
                  return (
                    <Startup
                      loadAccount={loadAccount}
                      account={account}
                    ></Startup>
                  );
                case "Investor":
                  return (
                    <Investor
                      loadAccount={loadAccount}
                      account={account}
                    ></Investor>
                  );
                default:
                  return (
                    <div className="home--base">
                      <h1 className="home--base__title">
                        Crowdfunding apply
                        <span className="text--warning"> Blockchain</span>
                      </h1>
                    </div>
                  );
              }
            })()
          )}
        </div>
      </Suspense>
    </>
  );
};
