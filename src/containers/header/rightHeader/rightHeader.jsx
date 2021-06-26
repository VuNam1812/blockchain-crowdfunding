// @flow
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { authContext } from "../../../context/authContext";
import { crowdfundingContext } from "../../../context/crowdfundingContext";
import { Modal } from "../../../components";
import "./style.scss";
import web3 from "web3";
import numeral from "numeral";
const enumState = {
  HIDDEN: "hidden",
  CLOSE: "close",
  VISIBLE: "visible",
};
export const RightHeader = (props) => {
  const { auth, setAuth } = React.useContext(authContext);
  const { CBT_TokenSale,CBT_Token, loading } = React.useContext(crowdfundingContext);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(1);
  const [totalSold, setTotalSold] = useState({ total: 0, percent: 0 });
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [modalState, setModalState] = useState(enumState.HIDDEN);

  useEffect(() => {
    (async () => {
      const accounts = await window.web3.eth.getAccounts();
      const currentAccount = accounts[0];
      setAddress(currentAccount);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      if (loading) {
        const tokenPrice = await CBT_TokenSale.methods.tokenPrice().call();
        const scale = web3.utils.fromWei(tokenPrice, "Ether");
        setPrice(amount * scale);
        loadTotal();
      }
    })();
  }, [amount, loading]);
  const handleShowModelBuyCBT = () => {
    setModalState(enumState.VISIBLE);
  };

  const loadTotal = async () => {
    const total = await CBT_TokenSale.methods.tokenSold().call();
    const currectSold = await CBT_TokenSale.methods.currentTokenSale().call();
    const per = currectSold === 0 ? 0 : +((total * 100) / currectSold);

    setTotalSold({ total: total, percent: per });
  };

  const handleCloseModal = () => {
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      setStep(1);
    }, 300);
  };
  const handleFinishConfirm = () => {
    handleCloseModal();
    setTimeout(() => {
      setAmount(1);
    }, 200);
  };
  const handleBuyCoin = async () => {
    await CBT_TokenSale.methods.buyTokens(amount).send({
      from: address,
      value: web3.utils.toWei(`${price}`, "Ether"),
    });
    setModalState(enumState.CLOSE);

    setTimeout(() => {
      props.loadAccount();
      loadTotal();
      setStep(2);
      setModalState(enumState.VISIBLE);
    }, 200);
  };
  return (
    <div className="right-header">
      {!props.hiddenBtnLog &&
        (() => {
          return auth ? (
            <>
              <div className="btn-buy" onClick={handleShowModelBuyCBT}>
                <i className="icon fa fa-eercast" aria-hidden="true"></i>Buy CBT
              </div>
              <Modal state={modalState} onClickOverlay={handleCloseModal}>
                <div
                  className={`buy-coin-modal ${
                    step === 1 ? "" : "buy-coin-modal--hidden"
                  }`}
                >
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
                  </div>
                  <div className="top-content">
                    <div className="top-content-item">
                      <p className="top-content-item__label">Amount</p>
                      <div className="body">
                        <input
                          type="number"
                          onChange={(e) => {
                            setAmount(e.target.value);
                          }}
                          value={amount}
                          className="body__input"
                        />
                        <div className="body__sub-desc">CBT</div>
                      </div>
                    </div>
                    <div className="top-content-item">
                      <p className="top-content-item__label">Price</p>
                      <div className="body">
                        <input
                          className="body__input"
                          value={numeral(price).format("0,0[.]000")}
                          readOnly
                        />
                        <div className="body__sub-desc">ETH</div>
                      </div>
                    </div>
                  </div>
                  <div className="buy-address">
                    <div className="buy-address__top">
                      <p className="buy-address__label">CBT Address</p>
                      <p className="buy-address__sub-label">Don't have one?</p>
                    </div>
                    <input
                      onChange={(e) => {
                        setAddress(e.target.value);
                      }}
                      value={address}
                      placeholder="Please enter the address"
                      className="buy-address__input"
                    />
                  </div>
                  <div className="buy-btn" onClick={handleBuyCoin}>
                    Buy
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
                        You have purchased {numeral(amount).format("0,0[.]000")}{" "}
                        CBT successfully.
                      </h5>
                    </div>

                    <div
                      className="basic-button button--icon-hidden"
                      onClick={handleFinishConfirm}
                    >
                      Accept
                      <i
                        className="fa fa-arrow-right basic-button__icon"
                        aria-hidden="true"
                      ></i>
                    </div>
                  </div>
                </div>
              </Modal>
              <div
                className="btn-log"
                onClick={() => {
                  setAuth(false);
                  localStorage.setItem("auth", false);
                  history.push("/");
                }}
              >
                Logout
              </div>
            </>
          ) : (
            <div
              className="btn-log"
              onClick={() => {
                history.push("/login");
              }}
            >
              Login
            </div>
          );
        })()}
    </div>
  );
};
