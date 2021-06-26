// @flow
import React, { useState, useEffect, useContext } from "react";
import "./style.scss";
import { RightHeader } from "./rightHeader/rightHeader";
import { LeftHeader } from "./leftHeader/leftHeader";
import { authContext } from "../../context/authContext";
import { useHistory } from "react-router-dom";
export const Header = (props) => {
  const { auth } = useContext(authContext);
  const history = useHistory();
  const [hiddenBtnLog, setHiddenBtnLog] = useState(false);
  useEffect(() => {
    if (
      history.location.pathname.startsWith("/login") ||
      history.location.pathname.startsWith("/register")
    ) {
      setHiddenBtnLog(true);
    }
  }, []);

  return (
    <div className="header">
      <div className="wrap">
        <div className="nav-bar">
          <ul className="nav-bar__left">
            <li
              className="nav-logo"
              onClick={() => {
                history.push("/");
              }}
            >
              <p>
                <i className="icon fa fa-free-code-camp" aria-hidden="true"></i>
                Crowd<span className="text--main">funding</span>
              </p>
            </li>
            <li
              className="block--hover"
              onClick={() => {
                history.push("/");
              }}
            >
              Home
            </li>
            {!auth && <LeftHeader></LeftHeader>}
          </ul>
          <RightHeader
            loadAccount={props.loadAccount}
            hiddenBtnLog={hiddenBtnLog}
          ></RightHeader>
        </div>
      </div>
    </div>
  );
};
