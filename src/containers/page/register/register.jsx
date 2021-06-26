// @flow
import React, { useContext, useState, useEffect } from "react";
import { Header } from "../../header/header";
import background from "../../../public/image/background.jpg";
import { useHistory } from "react-router-dom";
import { crowdfundingContext } from "../../../context/crowdfundingContext";
import "./style.scss";
export const Register = (props) => {
  const history = useHistory();
  const { crowdfunding } = useContext(crowdfundingContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegisAccount = async () => {
    const accounts = await window.web3.eth.getAccounts();
    const accountCurrent = accounts[0];

    switch (props.accountType) {
      case "Startup":
        crowdfunding.methods
          .createAccountStartup(name, password, email)
          .send({ from: accountCurrent })
          .on("receipt", (receipt) => {
            history.push("/");
          });
        break;
      case "Investor":
        crowdfunding.methods
          .createAccountInvestor(name, password, email)
          .send({ from: accountCurrent })
          .on("receipt", (receipt) => {
            history.push("/");
          });
        break;
    }
  };

  return (
    <>
      <Header></Header>
      <div
        className="register"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="card">
          <div className="card__header">{props.accountType} REGISTER</div>
          <div className="card__body">
            <div className="field">
              <label className="field__label">
                Name of {props.accountType}
                <span className="text--danger">*</span>
              </label>
              <input
                className="field__input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              ></input>
            </div>
            <div className="field">
              <label className="field__label">
                Email Address<span className="text--danger">*</span>
              </label>
              <input
                className="field__input"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              ></input>
            </div>
            <div className="field">
              <label className="field__label">
                Password<span className="text--danger">*</span>
              </label>
              <input
                className="field__input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <div className="card__footer">
            <div className="btn-submit" onClick={handleRegisAccount}>
              Register
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
