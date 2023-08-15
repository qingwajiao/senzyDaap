import React, { useState } from 'react';
import './Home.css';
import MyAsset from './MyAsset';
import SecondMarket from './SecondMarket';
import FirstMarket from './FirstMarket';
import Wallet from './Wallte';

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
    const [makerOrderList,setMakerOrderList] = useState([])

    const connectWallte = (data) => {
        setAccount(data);
      }
    
    const setMakeOrder = (date) =>{
        const newList =  makerOrderList.concat([date]);
        setMakerOrderList(newList);
    }

    return(
        <div className='Home'>
            <div className='columns'>
                <div className='left '>
                    <div className= "wallte">
                        < Wallet onDataUpdate={connectWallte}  />
                    </div>
                     <MyAsset  parenAccount = {account}  HomeSetMakeOrder = {setMakeOrder} /> 
                </div>
                <div className='right'>
                    <div className='firstMarket'>
                        {/* <h3>一级市场</h3> */}
                        <FirstMarket parenAccount = {account} />
                    </div>
                    <div className='secondMarket'>
                        <SecondMarket  parenAccount = {account} parenMakerOrderList = {makerOrderList} />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Home;