// @flow
import React, { useEffect, useState } from "react";
import numeral from "numeral";

export const Item = ({
  handleFinishProject,
  handleRemoveProject,
  handleSetNextState,
  getStateProject,
  handleShowModal,
  project,
  indexState,
}) => {
  const [textState, setTextState] = useState("");
  useEffect(() => {
    setTextState(getStateProject(0).state);
  }, [project]);

  const renderButton = () => {
    const type = getStateProject(indexState);
    console.log(indexState);
    switch (type.state) {
      case "CREATED":
        return (
          <>
            <div className="btn-basic" onClick={handleShowModal}>
              Đặt mục tiêu
            </div>
          </>
        );
      case "WAITING APPROVE":
        return <></>;
      case "APPROVED":
        return <></>;
      case "RASING":
        return (
          <>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "RASED":
        return (
          <>
            <div className="btn-basic btn-warning" onClick={handleSetNextState}>
              Vào Mục tiêu 1
            </div>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "STATE 1":
        return (
          <>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "APPROVED STATE 1":
        return (
          <>
            <div
              className="btn-basic btn--warning"
              onClick={handleSetNextState}
            >
              Vào Mục tiêu 2
            </div>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "STATE 2":
        return (
          <>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "APPROVED STATE 2":
        return (
          <>
            <div
              className="btn-basic btn--warning"
              onClick={handleSetNextState}
            >
              Vào Mục tiêu 3
            </div>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "STATE 3":
        return (
          <>
            <div
              className="btn-basic btn--danger"
              onClick={handleRemoveProject}
            >
              Hủy dự án
            </div>
          </>
        );
      case "APPROVED STATE 3":
        return (
          <>
            <div
              className="btn-basic btn--success"
              onClick={handleFinishProject}
            >
              Hoàn thành
            </div>
          </>
        );
      case "FINISH":
        return <></>;
      default:
        return <></>;
    }
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
        <div className="item__back-header">{renderButton()}</div>
        <div className="intro-project">
          <p className="intro-project__title">Giới thiệu dự án</p>
          <p className="intro-project__desc">{project.detailProject.desc}</p>
        </div>
      </div>
    </div>
  );
};
