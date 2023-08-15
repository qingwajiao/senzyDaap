import React, { useState,useEffect } from 'react';
import MakerOrder from './MakerOrder'
import './SecondMarket.css';

const SecondMarket = ({parenAccount,parenMakerOrderList}) =>{
    let [account,setAccount] = useState(parenAccount);

    useEffect(() => {
        setAccount(parenAccount);
      }, [parenAccount]);

    return (
        <div>
            <div className='tittle'>
                <h3 className='market'>二级市场</h3>              
            </div>

            <ul>{parenMakerOrderList.map(makerOrderData =>
                    <MakerOrder SecondMarketAccount = {account} makerOrderData = {makerOrderData}/>)}
                </ul> 

            <div>当前账户：{account.address}</div>
            
        </div>
    )
}


export default SecondMarket;