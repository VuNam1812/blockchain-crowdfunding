// @flow
import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Header } from "../../header/header";
import background from "../../../public/image/background.jpg";
import { crowdfundingContext } from "../../../context/crowdfundingContext";
import { authContext } from "../../../context/authContext";
import "./style.scss";
export const Login = (props) => {
  const { crowdfunding } = useContext(crowdfundingContext);
  const { setAuth } = useContext(authContext);
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ show: false, message: "" });

  const handleLogin = async () => {
    if (email.length === 0 || password.length === 0) {
      setError({
        show: true,
        message: "Chưa nhập đầy đủ các trường thông tin!!.",
      });
      return;
    }
    const accounts = await window.web3.eth.getAccounts();
    const accountCurrent = accounts[0];
    const contractAccount = await crowdfunding.methods
      .accounts(accountCurrent)
      .call();
    if (!contractAccount.isReg) {
      setError({ show: true, message: "Địa chỉ metamark chưa tạo tài khoản." });
      return;
    }
    if (
      email !== contractAccount.email ||
      password !== contractAccount.password
    ) {
      setError({ show: true, message: "Sai mật khẩu hoặc địa chỉ Email." });
      return;
    }
    setAuth(true);
    localStorage.setItem("auth", true);
    history.push("/");
  };
  return (
    <>
      <Header></Header>
      <div className="login" style={{ backgroundImage: `url(${background})` }}>
        <div className={`error-message ${error.show ? "active" : "hidden"}`}>
          <p>{error.message}</p>
        </div>
        <div className="card">
          <div className="card__header">Login</div>
          <div className="card__body">
            <div className="field">
              <label className="field__label">Email Address</label>
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
              <label className="field__label">Password</label>
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
            <div className="btn-submit" onClick={handleLogin}>
              Login
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
