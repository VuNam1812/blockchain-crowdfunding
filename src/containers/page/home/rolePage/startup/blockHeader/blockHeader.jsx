// @flow
import React, { useState, useContext, useReducer } from "react";
import "./style.scss";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { Modal } from "../../../../../../components";
import { crowdfundingContext } from "../../../../../../context/crowdfundingContext";
import numeral from "numeral";
const enumState = {
  HIDDEN: "hidden",
  CLOSE: "close",
  VISIBLE: "visible",
};

const initProject = {
  _name: "",
  _desc: "",
  _startDate: new Date().getTime(),
  _endDate: new Date().getTime(),
  amount: 0,
};

const ACTION = {
  UPDATE_PROJECT_NAME: 1,
  UPDATE_PROJECT_DESC: 2,
  UPDATE_PROJECT_STARTDATE: 3,
  UPDATE_PROJECT_ENDDATE: 4,
  UPDATE_PROJECT_AMOUNT: 5,
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTION.UPDATE_PROJECT_NAME:
      return {
        ...state,
        _name: payload,
      };
    case ACTION.UPDATE_PROJECT_DESC:
      return {
        ...state,
        _desc: payload,
      };
    case ACTION.UPDATE_PROJECT_STARTDATE:
      return {
        ...state,
        _startDate: payload,
      };
    case ACTION.UPDATE_PROJECT_ENDDATE:
      return {
        ...state,
        _endDate: payload,
      };
    case ACTION.UPDATE_PROJECT_AMOUNT:
      return {
        ...state,
        amount: +payload.replace(",", ""),
      };

    default:
      return state;
  }
};

export const BlockHeader = (props) => {
  const { crowdfunding } = useContext(crowdfundingContext);
  const [project, dispatch] = useReducer(reducer, initProject);
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const handleFinishConfirm = () => {
    handleCloseModal();
    setTimeout(() => {
      setStep(1);
    }, 300);
  };
  const handleShowModal = () => {
    setModalState(enumState.VISIBLE);
  };

  const HandleCreateProject = () => {
    setModalState(enumState.CLOSE);
    //handle create project

    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const startup = accounts[0];

      await crowdfunding.methods
        .createProject(
          project._name,
          project._desc,
          project._startDate,
          project._endDate,
          project.amount
        )
        .send({
          from: startup,
        })
        .on("receipt", (receipt) => {
          setTimeout(() => {
            setStep(2);
            props.loadProject();
            setModalState(enumState.VISIBLE);
          }, 200);
        });
    })();
  };

  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
    }, 300);
  };
  return (
    <div className="block__header">
      <p className="block__header-title">Dự án của tôi</p>
      <div className="block__header-btn" onClick={handleShowModal}>
        Tạo dự án
      </div>
      <Modal state={modalState} onClickOverlay={handleCloseModal}>
        <div
          className={`create-project-modal ${
            step === 1 ? "" : "create-project-modal--hidden"
          }`}
        >
          <p className="header_modal">Tạo mới dự án</p>
          <div className="form-group">
            <div className="input-item">
              <label>
                <p>
                  Tên dự án <span className="text--danger">*</span>
                </p>

                <input
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_PROJECT_NAME,
                      payload: e.target.value,
                    });
                  }}
                  value={project._name}
                  placeholder="Project Name"
                ></input>
              </label>
            </div>
            <div className="input-item">
              <label>
                <p>
                  Mô tả dự án <span className="text--danger">*</span>
                </p>
                <input
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_PROJECT_DESC,
                      payload: e.target.value,
                    });
                  }}
                  value={project._desc}
                  placeholder="Descriptions"
                ></input>
              </label>
            </div>
            <div className="input-item">
              <label>
                <p>
                  Ngày bắt đầu <span className="text--danger">*</span>
                </p>
                <DatePickerComponent
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_PROJECT_STARTDATE,
                      payload: new Date(e.target.value).getTime(),
                    });
                  }}
                  value={new Date(project._startDate)}
                  format="dd-MMM-yyyy"
                  className="date-time"
                  placeholder="Start Date"
                ></DatePickerComponent>
              </label>
            </div>
            <div className="input-item">
              <label>
                <p>
                  Ngày kết thúc <span className="text--danger">*</span>
                </p>
                <DatePickerComponent
                  onChange={(e) => {
                    dispatch({
                      type: ACTION.UPDATE_PROJECT_ENDDATE,
                      payload: new Date(e.target.value).getTime(),
                    });
                  }}
                  value={new Date(project._endDate)}
                  format="dd-MMM-yyyy"
                  className="date-time"
                  placeholder="End Date"
                ></DatePickerComponent>
              </label>
            </div>
            <div className="input-item">
              <label>
                <div className="item__header">
                  <p>
                    Số vốn gọi <span className="text--danger">*</span>
                  </p>
                  <p className="unit">
                    {numeral(project.amount * 45973).format("0,0")} VND
                  </p>
                </div>
                <div className="input-unit">
                  <input
                    onChange={(e) => {
                      dispatch({
                        type: ACTION.UPDATE_PROJECT_AMOUNT,
                        payload: e.target.value,
                      });
                    }}
                    value={numeral(project.amount).format("0,0")}
                    placeholder="Amount"
                  ></input>
                </div>
              </label>
            </div>
          </div>
          <div className="btn-submit" onClick={HandleCreateProject}>
            Tạo Dự Án
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
                You have create project successfully.
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
