// @flow
import React, { useState, useContext, useReducer, useEffect } from "react";
import "./style.scss";
import web3 from "web3";
import numeral from "numeral";
import { Modal } from "../../../../../components";
import { crowdfundingContext } from "../../../../../context/crowdfundingContext";
const enumState = {
  HIDDEN: "hidden",
  CLOSE: "close",
  VISIBLE: "visible",
};

export const BtnEndSale = (props) => {
  const [totalSold, setTotalSold] = useState({
    total: 0,
    percent: 0,
    litmit: 0,
  });
  const [contractBalance, setContractBalance] = useState({
    available: 0,
    Ethereum: 0,
  });
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const { CBT_TokenSale, CBT_Token } = useContext(crowdfundingContext);
  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
    }, 300);
  };
  const loadContractBalance = async () => {
    const addressContract = await CBT_TokenSale._address;
    const contractBalanceAvailable = await CBT_Token.methods
      .balanceOf(addressContract)
      .call();
    const contractBalanceEthereum = web3.utils.fromWei(
      await window.web3.eth.getBalance(addressContract),
      "ether"
    );
    setContractBalance({
      available: contractBalanceAvailable,
      Ethereum: contractBalanceEthereum,
    });
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
  const handleEndSale = async () => {
    setModalState(enumState.CLOSE);
    const admin = await CBT_TokenSale.methods.admin().call();

    const addressContract = await CBT_TokenSale._address;
    //check balance

    CBT_TokenSale.methods
      .endSale()
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
    <div className="btn-end-sale">
      <div
        className="btn-sale"
        onClick={() => {
          (async () => {
            setModalState(enumState.VISIBLE);
            await loadTotal();
            await loadContractBalance();
          })();
        }}
      >
        End Sale
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
                <p className="input-sale__title">Available</p>
                <input
                  readOnly
                  className="input-sale__input"
                  value={numeral(contractBalance.available).format("0,0")}
                  placeholder={0}
                ></input>
              </div>
              <div className="input-sale sale-receipt">
                <p className="input-sale__title">Ethereum Sold</p>
                <input
                  readOnly
                  className="input-sale__input"
                  value={numeral(contractBalance.Ethereum).format("0,0")}
                  placeholder={0}
                ></input>
              </div>
            </div>
            <div className="set-sold__btn-submit" onClick={handleEndSale}>
              End Sale
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
                You have been end sale!!<br></br>
                Receipt {numeral(contractBalance.available).format(
                  "0,0[.]000"
                )}{" "}
                CBT and {numeral(contractBalance.Ethereum).format("0,0")} ETH
                from contract successfully.
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
