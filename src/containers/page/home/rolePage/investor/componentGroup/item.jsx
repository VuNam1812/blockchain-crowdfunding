// @flow
import React, { useState, useEffect, useContext } from "react";
import numeral from "numeral";
import { crowdfundingContext } from "../../../../../../context/crowdfundingContext";
export const Item = ({
  getStateProject,
  handleShowModal,
  HandleRejectProject,
  project,
  indexState,
}) => {
  const { crowdfunding } = useContext(crowdfundingContext);
  const [textState, setTextState] = useState("");
  const [currectFunc, setCurrectFunc] = useState(0);
  const [voted, setVoted] = useState(false);
  useEffect(() => {
    setTextState(getStateProject(0).state);
    loadInvestorFunc();
    getVoted();
  }, [project]);

  const getVoted = () => {
    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const investor = accounts[0];

      const voted = await crowdfunding.methods
        .checkVoted(project.projectMain.id, project.projectMain.owner)
        .call({ from: investor });

      setVoted(voted);
    })();
  };

  const renderState = (index) => {
    return (
      <>
        <div>
          Approve:{" "}
          <span className="text--bold-success">
            {project.stateProjects[index].percentApproved}%
          </span>{" "}
          <span style={{ margin: "0rem .25rem" }}></span> Reject:{" "}
          <span className="text--bold-danger">
            {project.stateProjects[index].percentRemoved}%
          </span>
        </div>
        {!voted && (
          <div style={{ display: "flex", marginTop: "1rem" }}>
            <div
              className="btn--warning btn-smaller btn-basic"
              onClick={() => {
                handleShowModal(3);
              }}
            >
              Approve State
            </div>
            <div
              className="btn--danger btn-smaller btn-basic"
              onClick={HandleRejectProject}
            >
              Reject State
            </div>
          </div>
        )}
      </>
    );
  };

  const renderButton = () => {
    const type = getStateProject(indexState);

    switch (type.state) {
      case "RASING":
        return (
          <div>
            {+currectFunc !== 0 && (
              <p>
                Đã đầu tư:{" "}
                <span className="text--success">
                  {numeral(currectFunc).format("0,0")}{" "}
                </span>{" "}
                ETH
              </p>
            )}
            <div
              className="btn-basic btn--large"
              onClick={() => {
                handleShowModal(1);
              }}
            >
              Đầu tư
            </div>
          </div>
        );
      case "STATE 1":
        return renderState(0);
      case "STATE 2":
        return renderState(1);
      case "STATE 3":
        return renderState(2);
      default:
        return (
          <p>
            Đã đầu tư:{" "}
            <span className="text--success">
              {numeral(currectFunc).format("0,0")}
            </span>{" "}
            ETH
          </p>
        );
    }
  };

  const loadInvestorFunc = () => {
    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const investor = accounts[0];

      const fund = await crowdfunding.methods
        .rases(project.projectMain.id, investor)
        .call();

      setCurrectFunc(fund);
    })();
  };

  return (
    <div
      className={`item ${
        indexState === 1 ? "item--wait" : indexState >= 2 ? "item--approve" : ""
      }`}
    >
      <div className="item__front">
        <div className="item__header">
          <p className="item__header-title">
            {project.projectMain.name} <br></br>
            <span className="text--upper">({textState})</span>
          </p>
          <p className="item__header-date">
            Ngày Bắt đầu:{" "}
            <span className="text--warning">
              {new Date(+project.detailProject.startDate).toLocaleDateString()}
            </span>
          </p>
          <p className="item__header-date">
            Ngày kết thúc:{" "}
            <span className="text--success">
              {new Date(+project.detailProject.endDate).toLocaleDateString()}
            </span>
          </p>
        </div>
        <div className="item__body">
          <p className="item__body-text">
            Mục tiêu 1:{" "}
            {project.stateProjects[0].isCreated
              ? new Date(+project.stateProjects[0].endDate).toLocaleDateString()
              : "EMPTY"}
          </p>
          <p className="item__body-text">
            Mục tiêu 2:{" "}
            {project.stateProjects[1].isCreated
              ? new Date(+project.stateProjects[1].endDate).toLocaleDateString()
              : "EMPTY"}
          </p>
          <p className="item__body-text">
            Mục tiêu 3:{" "}
            {project.stateProjects[2].isCreated
              ? new Date(+project.stateProjects[2].endDate).toLocaleDateString()
              : "EMPTY"}
          </p>
        </div>
        <div className="item__footer">
          <p>
            Tổng số tiền dự án:{" "}
            {numeral(project.projectMain.amount).format("0,0")} CBT
          </p>
          <p>
            Số tiền kêu gọi: {numeral(project.projectMain.rased).format("0,0")}{" "}
            CBT
          </p>
          <p>
            Số tiền đã nhận:{" "}
            {numeral(project.projectMain.coinReceipt).format("0,0")} CBT
          </p>
        </div>
      </div>

      <div className="item__back">
        <div className="item__back-header header--flex">{renderButton()}</div>
        <div className="intro-project">
          <p className="intro-project__title">Giới thiệu dự án</p>
          <p className="intro-project__desc">{project.detailProject.desc}</p>
        </div>
      </div>
    </div>
  );
};
