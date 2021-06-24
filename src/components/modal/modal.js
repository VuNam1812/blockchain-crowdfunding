// @flow 
import React, {useState,useEffect} from 'react';
import './style.scss';
export const Modal = ({state, children, className, onClickOverlay}) => {
    const [isShow, setShow] = useState(null);
    useEffect(() => {
        
        switch (state) {
            case 'visible':
                setShow(true);
                document.body.style = 'overflow-y: hidden';
                break;
            case 'close':
                setShow(false);
                document.body.style = 'overflow-y: auto';
                break;

            default:
                break;
        }
    }, [state, isShow]);

    return (
        <div className={`modal ${className || ''} 
                        ${(isShow)? 'modal--open' : 
                                    (isShow === null)? 'modal--hidden' : 'modal--close'}`}
             onClick={(e) => {
                if (e.target.className.includes('modal--open')){
                 onClickOverlay();
                }
             }}>
            <div className='modal__body'>
                {children}
            </div>
        </div>
    );
};