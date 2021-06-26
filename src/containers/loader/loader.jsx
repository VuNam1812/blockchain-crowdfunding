// @flow 
import * as React from 'react';
import './style.scss';
export const Loader = (props) => {
    return (
        <div className='loader'>
            <div className='loading'>
                {
                    (new Array(20).fill({})).map((item, index) => {
                        return (
                            <span key={index}></span>
                        )
                    })
                }
                <div className='rocket'></div>
            </div>
        </div>
    );
};