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
  amount: 0,
};

const ACTION = {
  UPDATE_PROJECT_AMOUNT: 5,
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
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
  const { crowdfunding, CBT_Token } = useContext(crowdfundingContext);
  const [project, dispatch] = useReducer(reducer, initProject);
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const handleFinishConfirm = () => {
    handleCloseModal();
    setTimeout(() => {
      setStep(1);
    }, 500);
  };
  const handleShowModal = () => {
    setModalState(enumState.VISIBLE);
  };

  const HandleSetApprove = () => {
    setModalState(enumState.CLOSE);
    //handle create project

    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const investor = accounts[0];
        const contractAddress = await crowdfunding._address;
      await CBT_Token.methods
        .approve(contractAddress, project.amount)
        .send({
          from: investor,
        })
        .on("receipt", (receipt) => {
          setTimeout(() => {
            setStep(2);
            setModalState(enumState.VISIBLE);
          }, 200);
        });
    })();
  };

  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
    }, 500);
  };
  return (
    <div className="block__header">
      <p className="block__header-title">T???t c??? d??? ??n</p>
      <div className="block__header-btn" onClick={handleShowModal}>
        ?????t h???n m???c
      </div>
      <Modal state={modalState} onClickOverlay={handleCloseModal}>
        <div
          className={`create-project-modal ${
            step === 1 ? "" : "create-project-modal--hidden"
          }`}
        >
          <p className="header_modal">?????t h???n m???c h???p ?????ng s??? d???ng</p>
          <div className="form-group">
            <div className="input-item">
              <label>
                <div className="item__header">
                  <p>
                    H???n m???c <span className="text--danger">*</span>
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
          <p className="text-desc">
            H???n m???c ???????c ?????t gi??p cho b???n kh??ng b??? m???t CBT n???u nh?? c?? l???i x???y ra
            ho???c h???p ?????ng t??? ?????ng tr??? qu?? nhi???u CBT t??? t??i kho???n c???a b???n
          </p>
          <div className="btn-submit" onClick={HandleSetApprove}>
            Thi???t l???p
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
                You have set approve successfully.
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
