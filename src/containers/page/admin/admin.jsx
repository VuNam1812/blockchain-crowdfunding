// @flow
import React, { useContext, useEffect, useReducer, useState } from "react";
import { NavAdmin } from "./navAdmin/navAdmin";
import background from "../../../public/image/background.jpg";
import { ItemProject } from "./itemProject/itemProject";
import "./style.scss";
import numeral from "numeral";
import { crowdfundingContext } from "../../../context/crowdfundingContext";
import { useHistory } from "react-router-dom";

const initAsset = {
  name: "Administrator",
  balance: 0,
  projects: [],
};

const ACTION = {
  UPDATE_NAME: 1,
  UPDATE_BALANCE: 2,
  UPDATE_PROJECT: 3,
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTION.UPDATE_NAME:
      return {
        ...state,
        name: payload,
      };
    case ACTION.UPDATE_BALANCE:
      return {
        ...state,
        balance: payload,
      };
    case ACTION.UPDATE_PROJECT:
      return {
        ...state,
        projects: payload,
      };

    default:
      return state;
  }
};

export const Admin = (props) => {
  const { crowdfunding, CBT_TokenSale, CBT_Token, loading } =
    useContext(crowdfundingContext);
  const [adminInfo, dispatch] = useReducer(reducer, initAsset);
  const history = useHistory();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    let accountProjects = [];
    const accounts = await crowdfunding.methods.getAccountList().call();

    for (let index = 0; index < accounts.length; index++) {
      const account = accounts[index];
      const accProjects = await crowdfunding.methods.getProjects().call({
        from: account,
      });
      accountProjects = [...accountProjects, ...accProjects];
    }
    let projs = [];
    for (let index = 0; index < accountProjects.length; index++) {
      const projectId = accountProjects[index];
      const projectMain = await crowdfunding.methods
        .projects(accounts[0], projectId)
        .call();
      const detailProject = await crowdfunding.methods
        .detailProjects(projectId)
        .call();
      const stateProjects = [
        await crowdfunding.methods.stateProjects(projectId, 1).call(),
        await crowdfunding.methods.stateProjects(projectId, 2).call(),
        await crowdfunding.methods.stateProjects(projectId, 3).call(),
      ];
      projs = [
        ...projs,
        {
          projectMain,
          detailProject,
          stateProjects,
        },
      ];
    }

    setProjects([...projs]);
  };

  useEffect(() => {
    (async () => {
      if (loading) {
        await loadAccount();
      }
    })();
  }, [loading]);

  const loadAccount = async () => {
    const accounts = await window.web3.eth.getAccounts();
    const currentAccount = accounts[0];
    const deployer = await CBT_TokenSale.methods.admin().call();
    const balance = await CBT_Token.methods.balanceOf(currentAccount).call();
    if (deployer !== currentAccount) {
      console.log("redirect");
      history.push("/");
    }
    dispatch({
      type: ACTION.UPDATE_BALANCE,
      payload: balance,
    });
  };

  return (
    <>
      <NavAdmin loadAccount={loadAccount}></NavAdmin>
      <div
        className="admin-page"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="wrap">
          <div className="account">
            <p className="account__name">
              <i className="icon fa fa-rocket" aria-hidden="true"></i>
              {adminInfo.name}
            </p>
            <p className="account__balance">
              <i className="icon fa fa-eercast" aria-hidden="true"></i>
              {numeral(adminInfo.balance).format("0,0")} CBT
            </p>
          </div>
          <div className="page__content">
            <div className="block__header">
              <p className="block__header-title">Tất cả dự án chờ xác nhận</p>
            </div>
            <div className="projects">
              {projects.map((project) => {
                return (
                  <ItemProject
                    project={project}
                    loadProject={loadProject}
                  ></ItemProject>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
