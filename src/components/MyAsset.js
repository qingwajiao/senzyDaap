import { ethers } from 'ethers';
import React, { useState,useEffect } from 'react';
import './MyAsset.css'
import NftAsset2 from './NftAsset2';
import Wallet from './Wallte';
import NftAsset from './NftAsset';

// {account,HomeSetMakeOrder}
function MyAsset({HomeSetMakeOrder}){

    // let [signer,setSigner] = useState(account.signer)
    let [userNftAsset,setUserNftAsset] = useState([]);
    let [balance,setBalance] = useState(0);
    const [tokenAsset, setTokenAsset] = useState('BNB');
    let [makerOrderData, setmakerOrderData] = useState(null);
    
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

    const initContract = async () =>{
        let userNftAsset = await getNftAsset();
        setUserNftAsset(userNftAsset);
        console.log("userNftAsset:",userNftAsset);
    }

    const getNftAsset = async() =>{
        
        let amount = await account.senzyContract.balanceOf(account.address);

        let idList = [] ;
        for (var i = 0; i < amount; i++) {
          let tokenId = await account.senzyContract.tokenOfOwnerByIndex(account.address,i);
          idList.push({
            tokenId:tokenId.toNumber(),
            makeOrder:null
          });
        }
        console.log(idList);
    
        return idList;
    }

    

    const handleOptionChange =  (event) => {
        setTokenAsset(event.target.value);
        // TODO 注意这里刚好相反了，待解决
    };

    const getTokenAsset = async () =>{
        if (account.address === ""){
            setBalance(0);
            return;
        }
        if(tokenAsset === "BNB"){
            console.log("provider####BNB:",account.provider);
            let balance = await account.provider.getBalance(account.address);
            let balanceEther = ethers.utils.formatEther(balance);
            setBalance(balanceEther);


        }
        else if (tokenAsset === "USDT") {
            console.log("provider####USDT:",account.provider);
            let balance = await account.usdtContract.balanceOf(account.address);
            let balanceEther = ethers.utils.formatEther(balance);
            setBalance(balanceEther);
        }
    }


    useEffect(() => {
        if (account.signer){
            initContract();
        }  
        
        if (tokenAsset){
            getTokenAsset();
        }
      }, [account.signer,tokenAsset]);

    // let userNftAsset = getTokenAsset()

    const setMakeOrder = (date) =>{
        setmakerOrderData(date);
        HomeSetMakeOrder(date);
    }


    const connectWallte = (data) => {
        setAccount(data);
      }

    return(
        <div className='myAsset'>

            <div className='myTokenAsset'>
                <div className='tittle'>
                    <h3 className='my'>我的资产</h3> 
                    <div className= "wallte">
                        < Wallet onDataUpdate={connectWallte}  />
                    </div>
                
                </div>
                <p>账户地址：{account.address} </p>
                <div> 
                    <label>
                        <input
                        type="radio"
                        value="BNB"
                        checked={tokenAsset === 'BNB'}
                        onChange={handleOptionChange}
                        />
                        BNB
                    </label>
                    <br />
                        <input
                        type="radio"
                        value="USDT"
                        checked={tokenAsset === 'USDT'}
                        onChange={handleOptionChange}
                        />
                        USDT
                    <p>余额: {balance}</p>                   
                </div>

            </div>

            <div className='myNftAsset'>
                <p>我的NFT:</p>
                <ul>{userNftAsset.map(nftInfo =>
                    <NftAsset2 account = {account} nftInfo = {nftInfo} MyAssetSetMakeOrder= {setMakeOrder}/>)}
                </ul>           
            </div>

        </div>
    )
}


export default MyAsset;