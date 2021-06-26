// @flow
import React, { useState, useEffect, useReducer, useContext } from "react";
import "./style.scss";
import { Item } from "./item";
import { Modal } from "../../../../components";
import { crowdfundingContext } from "../../../../context/crowdfundingContext";
const enumState = {
  HIDDEN: "hidden",
  CLOSE: "close",
  VISIBLE: "visible",
};

export const ItemProject = ({ project, loadProject }) => {
  const { crowdfunding } = useContext(crowdfundingContext);
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const [indexState, setIndexState] = useState(0);
  const [textModal, setTextModal] = useState('accepted');
  useEffect(() => {
    const index = getStateProject(0).index;
    setIndexState(index !== 0 ? index - 1 : 0);
  }, [project]);

  const getStateProject = (index) => {
    let state = "";
    let passed = index;
    switch (+index) {
      case 0:
        if (+project.projectMain.stateCount === 0) {
          state = "CREATED";
          passed++;
        }
        if (+project.projectMain.stateCount >= 3) {
          passed++;
        }
      case 1:
        if (
          passed === 1 &&
          +project.projectMain.stateCount >= 3 &&
          !project.projectMain.isApprove
        ) {
          state = "WAITING APPROVE";
          passed++;
        }
        if (project.projectMain.isApprove) {
          passed++;
        }
      case 2:
        if (
          passed === 2 &&
          +project.projectMain.stateCount >= 3 &&
          project.projectMain.isApprove
        ) {
          state = "APPROVED";
          passed++;
        }
      case 3:
        if (
          passed === 3 &&
          +project.projectMain.amount > +project.projectMain.rased
        ) {
          state = "RASING";
          if (project.projectMain.isFinished) {
            state = "FINISH";
          }
          passed++;
        }
        if (+project.projectMain.amount === +project.projectMain.rased) {
          passed++;
        }
      case 4:
        if (
          passed === 4 &&
          +project.projectMain.amount === +project.projectMain.rased
        ) {
          state = "RASED";
          if (project.projectMain.isFinished) {
            state = "FINISH";
          }
          passed++;
        }
      case 5:
        if (passed === 5 && +project.projectMain.state === 1) {
          state = "STATE 1";
          if (project.stateProjects[0].isApprove) {
            state = "APPROVED STATE 1";
          }
          if (project.projectMain.isFinished) {
            state = "FINISH";
          }
          passed++;
        }
        if (+project.projectMain.state > 1) {
          passed++;
        }
      case 6:
        if (passed === 6 && +project.projectMain.state === 2) {
          state = "STATE 2";
          if (project.stateProjects[1].isApprove) {
            state = "APPROVED STATE 2";
          }
          if (project.projectMain.isFinished) {
            state = "FINISH";
          }
          passed++;
        }
        if (+project.projectMain.state > 2) {
          passed++;
        }
      case 7:
        if (passed === 7 && +project.projectMain.state === 3) {
          state = "STATE 3";
          if (project.stateProjects[2].isApprove) {
            state = "APPROVED STATE 3";
          }
          if (project.projectMain.isFinished) {
            state = "FINISH";
          }
          passed++;
        }
    }
    return {
      state,
      index: passed,
    };
  };

  const handleShowModal = () => {
    setModalState(enumState.VISIBLE);
  };

  const handleFinishConfirm = () => {
    handleCloseModal();
    setTimeout(() => {
      setStep(1);
    }, 500);
  };

  const HandleAcceptStateProject = () => {
    setModalState(enumState.CLOSE);
    setTextModal('accepted');
    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const admin = accounts[0];
      switch (indexState) {
        case 1:
          await crowdfunding.methods
            .setApproveProject(
              +project.projectMain.id,
              project.projectMain.owner
            )
            .send({
              from: admin,
            });
          break;
        default:
          break;
      }

      setTimeout(() => {
        const index = getStateProject(0).index;
        setIndexState(index !== 0 ? index - 1 : 0);
        setStep(2);
        loadProject();
        setModalState(enumState.VISIBLE);
      }, 200);
    })();
  };

  const handleRemoveProject = async () => {
    setTextModal('removed');
    const accounts = await window.web3.eth.getAccounts();
    const admin = accounts[0];

    await crowdfunding.methods
      .removeProject(+project.projectMain.id, project.projectMain.owner)
      .send({
        from: admin,
      });
    setTimeout(() => {
      const index = getStateProject(0).index;
      setIndexState(index !== 0 ? index - 1 : 0);
      setStep(2);
      loadProject();
      setModalState(enumState.VISIBLE);
    }, 200);
  };

  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
    }, 500);
  };

  return (
    <div className="item-project">
      <Item
        handleRemoveProject={handleRemoveProject}
        getStateProject={getStateProject}
        indexState={indexState}
        project={project}
        handleShowModal={handleShowModal}
      ></Item>
      <Modal state={modalState} onClickOverlay={handleCloseModal}>
        <div
          className={`create-state-modal ${
            step === 1 ? "" : "create-state-modal--hidden"
          }`}
        >
          <p className="header_modal"></p>
          <div className="content">
            <i className="content__icon fa fa-times" aria-hidden="true"></i>
            <p className="content__confirm">Bạn thực sự chắc chắn?</p>
            <p className="content__desc">
              Bạn không thể sửa đổi khi trạng thái đã được thêm vào Blockchain
            </p>
          </div>
          <div className="btn-group">
            <div className="btn-submit" onClick={HandleAcceptStateProject}>
              Xác nhận
            </div>
            <div
              className="btn-submit btn--danger"
              onClick={handleFinishConfirm}
            >
              Hủy
            </div>
          </div>
        </div>

        <div className={`notice ${step === 2 ? "" : "notice--hidden"}`}>
          <div className="modal-block">
            <div className="status-modal">
              <i
                className="fa fa-check fa-5x status-modal__icon "
                aria-hidden="true"
              ></i>
              <p className="status-modal__title">Success</p>
              <h5 className="status-modal__desc">
                You have {textModal} project successfully.
              </h5>
            </div>

            <div
              className="basic-button button--icon-hidden"
              onClick={handleFinishConfirm}
            >
              Confirm
              <i
                className="fa fa-arrow-right basic-button__icon"
                aria-hidden="true"
              ></i>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
