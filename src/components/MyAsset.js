import { ethers } from 'ethers';
import React, { useState,useEffect } from 'react';
import './MyAsset.css'
import NftAsset from './NftAsset';


function MyAsset({parenAccount,HomeSetMakeOrder}){

    let [account,setAccount] = useState( parenAccount );

    let [userNftAsset,setUserNftAsset] = useState([]);
    let [balance,setBalance] = useState(0);
    const [tokenAsset, setTokenAsset] = useState('BNB');
    
    const getNftAsset = async() =>{
        
        let amount = await account.senzyContract.balanceOf(account.address);

        let userNftAsset = [] ;
        for (var i = 0; i < amount; i++) {
          let tokenId = await account.senzyContract.tokenOfOwnerByIndex(account.address,i);
          userNftAsset.push({
            tokenId:tokenId.toNumber(),
            makeOrder:null
          });
        }
        setUserNftAsset(userNftAsset);
        console.log("userNftAsset:",userNftAsset);

    }

    

    const handleOptionChange =  (event) => {
        setTokenAsset(event.target.value);
        
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
        setAccount(parenAccount);
      }, [parenAccount]);


    useEffect(() => {
        if (account.signer){
            getNftAsset();
            getTokenAsset()
        }  
      }, [account]);

    useEffect(() => {
        if (account.signer){
            getTokenAsset()
        } 
        }, [tokenAsset]);


    const setMakeOrder = (date) =>{
        // setmakerOrderData(date);
        HomeSetMakeOrder(date);
    }


    return(
        <div className='myAsset'>

            <div className='myTokenAsset'>
                <div className='tittle'>
                    <h3 className='my'>我的资产</h3> 
                
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
                    <NftAsset account = {account} nftInfo = {nftInfo} MyAssetSetMakeOrder= {setMakeOrder}/>)}
                </ul>           
            </div>

        </div>
    )
}


export default MyAsset;