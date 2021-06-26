// @flow
import React, { useState, useContext, useReducer } from "react";
import "./style.scss";
import numeral from "numeral";
import { Modal } from "../../../../../components";
import { crowdfundingContext } from "../../../../../context/crowdfundingContext";
const enumState = {
  HIDDEN: "hidden",
  CLOSE: "close",
  VISIBLE: "visible",
};

export const NavRight = (props) => {
  const [totalSold, setTotalSold] = useState({
    total: 0,
    percent: 0,
    litmit: 0,
  });
  const [sale, setSale] = useState(0);
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const { CBT_TokenSale, CBT_Token } = useContext(crowdfundingContext);
  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
      setSale(0);
    }, 300);
  };

  const loadTotal = async () => {
    const total = await CBT_TokenSale.methods.tokenSold().call();
    const currentSale = await CBT_TokenSale.methods.currentTokenSale().call();

    const per = currentSale === 0 ? 0 : +((total * 100) / currentSale);

    setTotalSold({ total: total, percent: per, limit: currentSale });
  };

  const handleFinishConfirm = () => {
    handleCloseModal();
  };
  const handleSetTotalSold = async () => {
    setModalState(enumState.CLOSE);
    const admin = await CBT_TokenSale.methods.admin().call();

    const addressContract = await CBT_TokenSale._address;
    //check balance
      
    await CBT_TokenSale.methods.setCurrentTokenSale(sale).send({
      from: admin,
    });
    CBT_Token.methods
      .transfer(addressContract, sale)
      .send({
        from: admin,
      })
      .on("receipt", () => {
        loadTotal();
        setStep(2);
        props.loadAccount();
        setModalState(enumState.VISIBLE);
      });
  };
  return (
    <div className="nav-right">
      <div
        className="btn-sale"
        onClick={() => {
          (async () => {
            setModalState(enumState.VISIBLE);
            await loadTotal();
          })();
        }}
      >
        Total Sale
      </div>
      <Modal state={modalState} onClickOverlay={handleCloseModal}>
        <div className={`total-sale ${step === 1 ? "" : "token-sale--hidden"}`}>
          <div className="token-sold">
            <div className="token-sold__bar">
              <div
                className="token-sold__bar-loading"
                style={{ width: `${totalSold.percent}%` }}
              ></div>
            </div>
            <p className="token-sold__title">
              Total Sold:{" "}
              <span className="text-main">
                {numeral(totalSold.total).format("0,0")}
              </span>{" "}
              CBT
            </p>
            <p className="token-sold__title title--none-margin">
              Limit Sold:{" "}
              <span className="text-main">
                {numeral(totalSold.limit).format("0,0")}
              </span>{" "}
              CBT
            </p>
          </div>
          <div className="set-sold">
            <div className="set-sold__content">
              <div className="input-sale">
                <p className="input-sale__title">Token Sale</p>
                <input
                  className="input-sale__input"
                  value={numeral(sale).format("0,0")}
                  onChange={(e) => {
                    const newValue = e.target.value.replace(",", "");
                    setSale(+newValue);
                  }}
                  placeholder={0}
                ></input>
              </div>
              <p className="unit-convert">
                {numeral(sale * 0.001).format("0,0[.]000")} ETH
              </p>
            </div>
            <div className="set-sold__btn-submit" onClick={handleSetTotalSold}>
              Set Limit Sale
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
                You have set {numeral(sale).format("0,0[.]000")} CBT to sale
                successfully.
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
