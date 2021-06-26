// @flow
import * as React from "react";
import { useHistory } from "react-router-dom";

export const LeftHeader = (props) => {
  const history = useHistory();
  const HandleRedirectRegis = (type) => {
    history.push(`/register-${type}`);
  };

  return (
    <>
      <li>
        <div className="select">
          <div className="select-style">
            Register
            <i className="icon fa fa-chevron-down" aria-hidden="true"></i>
          </div>
          <div className="select-dropdown">
            <div
              className="select-dropdown__item"
              onClick={() => {
                HandleRedirectRegis("startup");
              }}
            >
              Startup
            </div>
            <div
              className="select-dropdown__item"
              onClick={() => {
                HandleRedirectRegis("investor");
              }}
            >
              Investor
            </div>
          </div>
        </div>
      </li>
      <li></li>
      <li className='block--hover'
        onClick={() => {
          history.push("/admin");
        }}
      >
        Admin
      </li>
    </>
  );
};
