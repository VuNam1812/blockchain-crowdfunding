// @flow
import React, { useContext, useState, useEffect } from "react";
import "./style.scss";
import { BlockHeader } from "./blockHeader/blockHeader";
import { ItemProject } from "./componentGroup/itemProject";
import { crowdfundingContext } from "../../../../../context/crowdfundingContext";
import numeral from "numeral";
export const Investor = (props) => {
  const { crowdfunding } = useContext(crowdfundingContext);
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
  return (
    <div className="investor">
      <div className="wrap">
        <div className="account">
          <p className="account__name">
            <i className="icon fa fa-rocket" aria-hidden="true"></i>
            {props.account.name}
          </p>
          <p className="account__email">
            <i className="icon fa fa-envelope" aria-hidden="true"></i>
            {props.account.email}
          </p>
          <p className="account__balance">
            <i className="icon fa fa-eercast" aria-hidden="true"></i>
            {numeral(props.account.balance).format("0,0")} CBT
          </p>
        </div>
        <div className="page__content">
          <BlockHeader></BlockHeader>
          <div className="projects">
            {projects.map((project) => {
              return (
                <ItemProject
                  loadAccount={props.loadAccount}
                  project={project}
                  loadProject={loadProject}
                ></ItemProject>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
