// @flow
import React, { useContext, useState, useEffect } from "react";
import "./style.scss";
import numeral from "numeral";
import { crowdfundingContext } from "../../../../../context/crowdfundingContext";
import { BlockHeader } from "./blockHeader/blockHeader";
import { ItemProject } from "./componentGroup";
export const Startup = (props) => {
  const { crowdfunding } = useContext(crowdfundingContext);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    const accounts = await window.web3.eth.getAccounts();
    const accountProjecs = await crowdfunding.methods.getProjects().call({
      from: accounts[0],
    });
    let projs = [];
    for (let index = 0; index < accountProjecs.length; index++) {
      const projectId = accountProjecs[index];
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
    <div className="startup">
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
          <BlockHeader loadProject={loadProject}></BlockHeader>
          <div className="projects">
            {projects.map((project) => (
              <ItemProject
                project={project}
                loadProject={loadProject}
              ></ItemProject>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
