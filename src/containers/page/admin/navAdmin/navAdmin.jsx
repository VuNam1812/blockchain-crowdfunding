// @flow
import * as React from "react";
import { useHistory } from "react-router-dom";
import "./style.scss";
import { NavRight } from "./navRight/navRight";
import { BtnEndSale } from "./btnEndSale/btnEndSale";
export const NavAdmin = (props) => {
  const history = useHistory();

  return (
    <div className="nav-admin">
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
              onClick={() => {
                history.push("/");
              }}
            >
              Home
            </li>
          </ul>
          <div className="btn-group-right">
            <BtnEndSale loadAccount={props.loadAccount}></BtnEndSale>
            <NavRight loadAccount={props.loadAccount}></NavRight>
          </div>
        </div>
      </div>
    </div>
  );
};
