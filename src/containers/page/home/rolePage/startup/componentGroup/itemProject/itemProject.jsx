// @flow
import React, { useState, useEffect, useReducer, useContext } from "react";
import "./style.scss";
import { Item } from "./item";
import { Modal } from "../../../../../../../components";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { crowdfundingContext } from "../../../../../../../context/crowdfundingContext";
const enumState = {
  HIDDEN: "hidden",
  CLOSE: "close",
  VISIBLE: "visible",
};

const initStatesProject = {
  target_1: new Date().getTime(),
  target_2: new Date().getTime(),
  target_3: new Date().getTime(),
  minDate: new Date().getTime(),
  maxDate: new Date().getTime(),
};

const ACTION = {
  UPDATE_TARGET_1: 1,
  UPDATE_TARGET_2: 2,
  UPDATE_TARGET_3: 3,
  UPDATE_MINDATE: 4,
  UPDATE_MAXDATE: 5,
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTION.UPDATE_TARGET_1:
      return {
        ...state,
        target_1: +payload,
      };
    case ACTION.UPDATE_TARGET_2:
      return {
        ...state,
        target_2: +payload,
      };
    case ACTION.UPDATE_TARGET_3:
      return {
        ...state,
        target_3: +payload,
      };
    case ACTION.UPDATE_MINDATE:
      return {
        ...state,
        minDate: +payload,
      };
    case ACTION.UPDATE_MAXDATE:
      return {
        ...state,
        maxDate: +payload,
      };

    default:
      return state;
  }
};

export const ItemProject = ({ project, loadProject }) => {
  const { crowdfunding } = useContext(crowdfundingContext);
  const [statesProject, dispatch] = useReducer(reducer, initStatesProject);
  const [textModal, setTextModal] = useState('updated');
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const [indexState, setIndexState] = useState(0);

  useEffect(() => {
    dispatch({
      type: ACTION.UPDATE_MINDATE,
      payload: project.detailProject.startDate,
    });
    dispatch({
      type: ACTION.UPDATE_MAXDATE,
      payload: project.detailProject.endDate,
    });
  }, []);

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
    }, 300);
  };
  const handleFinishProject = async () => {
    setTextModal('finished');
    const accounts = await window.web3.eth.getAccounts();
    const startup = accounts[0];

    await crowdfunding.methods
      .setFinishProject(project.projectMain.id)
      .send({ from: startup })
      .on("receipt", () => {
        const index = getStateProject(0).index;
        console.log("finish: ",index);
        setIndexState(index !== 0 ? index - 1 : 0);
        setStep(2);
        loadProject();
        setModalState(enumState.VISIBLE);
      });
  };
  const handleSetNextState = async () => {
    setTextModal('updated');
    const accounts = await window.web3.eth.getAccounts();
    const startup = accounts[0];

    await crowdfunding.methods
      .changeStateProject(project.projectMain.id)
      .send({ from: startup })
      .on("receipt", () => {
        const index = getStateProject(0).index;
        setIndexState(index !== 0 ? index - 1 : 0);
        setStep(2);
        loadProject();
        setModalState(enumState.VISIBLE);
      });
  };

  const handleRemoveProject = async () => {
    setTextModal('removed');
    const accounts = await window.web3.eth.getAccounts();
    const startup = accounts[0];

    await crowdfunding.methods
      .removeProject(project.projectMain.id, project.projectMain.owner)
      .send({ from: startup })
      .on("receipt", () => {
        const index = getStateProject(0).index;
         console.log("remove: ", index);
        setIndexState(index !== 0 ? index - 1 : 0);
        setStep(2);
        loadProject();
        setModalState(enumState.VISIBLE);
      });
  };

  const HandleSetStateProject = () => {
    setModalState(enumState.CLOSE);
    setTextModal('updated');
    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const startup = accounts[0];

      await crowdfunding.methods
        .createStateProject(project.projectMain.id, [
          statesProject.target_1,
          statesProject.target_2,
          statesProject.target_3,
        ])
        .send({
          from: startup,
        });

      setTimeout(() => {
        const index = getStateProject(0).index;
        setIndexState(index !== 0 ? index - 1 : 0);
        setStep(2);
        loadProject();
        setModalState(enumState.VISIBLE);
      }, 200);
    })();
  };

  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
    }, 300);
  };

  return (
    <div className="item-project">
      <Item
        handleFinishProject={handleFinishProject}
        handleRemoveProject={handleRemoveProject}
        handleSetNextState={handleSetNextState}
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
          <p className="header_modal">Tạo mục tiêu dự án</p>
          <div className="form-group">
            <div className="input-item">
              <label>
                <p>
                  Mục tiêu 1 <span className="text--danger">*</span>
                </p>
                <DatePickerComponent
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_TARGET_1,
                      payload: new Date(e.target.value).getTime(),
                    });
                  }}
                  value={new Date(statesProject.target_1)}
                  min={new Date(statesProject.minDate)}
                  max={new Date(statesProject.maxDate)}
                  format="dd-MMM-yyyy"
                  className="date-time"
                  placeholder="End Date"
                ></DatePickerComponent>
              </label>
            </div>
            <div className="input-item">
              <label>
                <p>
                  Mục tiêu 2 <span className="text--danger">*</span>
                </p>
                <DatePickerComponent
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_TARGET_2,
                      payload: new Date(e.target.value).getTime(),
                    });
                  }}
                  value={new Date(statesProject.target_2)}
                  min={new Date(statesProject.target_1)}
                  max={new Date(statesProject.maxDate)}
                  format="dd-MMM-yyyy"
                  className="date-time"
                  placeholder="End Date"
                ></DatePickerComponent>
              </label>
            </div>
            <div className="input-item">
              <label>
                <p>
                  Mục tiêu 3 <span className="text--danger">*</span>
                </p>
                <DatePickerComponent
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_TARGET_3,
                      payload: new Date(e.target.value).getTime(),
                    });
                  }}
                  value={new Date(statesProject.target_3)}
                  min={new Date(statesProject.target_2)}
                  max={new Date(statesProject.maxDate)}
                  format="dd-MMM-yyyy"
                  className="date-time"
                  placeholder="End Date"
                ></DatePickerComponent>
              </label>
            </div>
          </div>
          <div className="btn-submit" onClick={HandleSetStateProject}>
            Tạo Mục Tiêu
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
                You have been {textModal} project successfully.
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
