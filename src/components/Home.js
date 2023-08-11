import React, { useState,useEffect } from 'react';
import './Home.css'
import MyAsset from './MyAsset';
import SecondMarket1 from './SecondMarket1'

function Home(){

    let [account,setAccount] = useState(
        {   isConnect:false,
            provider:'',
            signer:'',
            address:'',
            senzyContract : '',
            usdtContract : '',
            senzyExchangeContract : ''
        }
    );

    const [makerOrderData, setmakerOrderData] = useState(
        {
            isOrderAsk: true,
            signer: '',
            collection: '',
            price: '',
            tokenId: '',
            amount: 1,
            strategy: '',
            currency: '',
            nonce: '',
            minPercentageToAsk: '',
            params:''
          
    }
    );

    const connectWallte = (data) => {
        setAccount(data);
      }
    
    const setMakeOrder = (date) =>{
        setmakerOrderData(date);
    }

//HomeSetMakeOrder = {setMakeOrder}
    return(
        <div className='Home'>
            <div className='columns'>
                <div className='left '>
                     <MyAsset  HomeSetMakeOrder = {setMakeOrder} /> 
                </div>
                <div className='right'>
                    <div className='firstMarket'>
                        firstMarket
                    </div>
                    <div className='secondMarket'>
                        <SecondMarket1  makerOrderData = {makerOrderData} />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Home;