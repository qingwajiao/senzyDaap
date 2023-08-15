import React, { useState,useEffect } from 'react';
import { ethers } from 'ethers';
import contractConfig from '../contract-config';
import './SecondMarket.css';
const {senzyExchangeAddress } = contractConfig;


const MakerOrder = ({SecondMarketAccount, makerOrderData}) =>{


    let [confirmBuyState,setConfirmBuyState] = useState(false);
    let [showOrder,setShowOrder] = useState(true);
    let [account,setAccount] = useState(SecondMarketAccount);

    useEffect(() => {
        setAccount(SecondMarketAccount);
      }, [SecondMarketAccount]);

        // 确认成单
    const ConfirmOrder = async (signMakerOrderData) => {

        signMakerOrderData.params = "0x"
        try {
            let takerOrder = {
            isOrderAsk: !signMakerOrderData.isOrderAsk,
            taker:account.address,
            price:signMakerOrderData.price,
            tokenId:signMakerOrderData.tokenId,
            minPercentageToAsk: signMakerOrderData.minPercentageToAsk,
            params:signMakerOrderData.params
            }
    
            // 买单
            if (!takerOrder.isOrderAsk){
                
                if (signMakerOrderData.currency === "0x000000000000000000000000000000000000000b"){
                    // 用NBN买
        
                    // **************************************  2 进入买NFT的流程  ******************************************
                    console.log("ConfirmOrder signMakerOrderData",signMakerOrderData);
                    console.log("ConfirmOrder takerOrder:",takerOrder);
                    
                    console.log("开始用BNB买nft ...");
                    const exchangeTx = await account.senzyExchangeContract.matchAskWithTakerBidUsingETHAndWETH(takerOrder,signMakerOrderData,{ value: takerOrder.price});
                    await exchangeTx.wait();
                    // 转换单位为 Ether
                    
                    alert('NFT Buy Successfully!');
                    setShowOrder(false);
                    return;

                }
                
                // 获取用户授权给senzy合约的额度
                const allowance = await account.usdtContract.allowance(account.address,senzyExchangeAddress);

                // 转换单位为 Ether
                const allowanceEther = ethers.utils.formatEther(allowance);
                console.log("allowance:", allowanceEther);
    
                // 当前购买的总金额如果大于用户授权给senzy合约的额度
                if (takerOrder.price > allowanceEther){
        
                    // **************************************  1 进入铸造approve的流程  ******************************************
                    console.log("进入approve......")
                    // 需要调用 usdtContract 合约的approve方法再授权一些额度
                    const approveTx = await account.usdtContract.approve(senzyExchangeAddress,ethers.utils.parseUnits((takerOrder.price  - allowanceEther).toString(), 18));
                    await approveTx.wait();
                    // 等待交易被确认
                    console.log('Approval erc20 successful!');
                }
            
                // **************************************  2 进入买NFT的流程  ******************************************
                console.log("ConfirmOrder signMakerOrderData",signMakerOrderData);
                console.log("ConfirmOrder takerOrder:",takerOrder);
                
                console.log("开始买nft ...");
                const exchangeTx = await account.senzyExchangeContract.matchAskWithTakerBid(takerOrder,signMakerOrderData);
                await exchangeTx.wait();
                // 转换单位为 Ether
                
                alert('NFT Buy Successfully!');
                setShowOrder(false);
 
            }else{
                const approvedAddress = await account.senzyContract.getApproved(signMakerOrderData.tokenId);
                // 转换单位为 Ether
                console.log("approvedAddress:",approvedAddress)
        
                // 先授权nft给交易市场
                if (approvedAddress !== senzyExchangeAddress){
        
                    // **************************************  1进入approve的流程  ******************************************
                    console.log("进入approve NFT......")
                    // 需要调用 usdtContract 合约的approve方法再授权一些额度
                    const approveTx = await account.senzyContract.approve(senzyExchangeAddress,signMakerOrderData.tokenId);
                    await approveTx.wait();
                    // 等待交易被确认
                    console.log('Approval successful!');
                    }
        
                // **************************************  2 进入卖NFT的流程  ******************************************
                console.log("开始卖nft ...");
                console.log("ConfirmOrder signMakerOrderData",signMakerOrderData);
                console.log("ConfirmOrder takerOrder:",takerOrder);
                const exchangeTx = await account.senzyExchangeContract.matchBidWithTakerAsk(takerOrder,signMakerOrderData);
                await exchangeTx.wait();
                // 转换单位为 Ether
                
                alert('NFT Buy Successfully!');
                setShowOrder(false);
        
            }
    
    
        } catch (error) {
            // setBuyState(false);
            alert('Error Buy NFT: ' + error.message);
        }
        };

    return (
        <li>
        { showOrder && ( 
            <div>
                <div> 藏品: &nbsp;&nbsp; Senzy&nbsp;#{makerOrderData.tokenId}</div>
                <div> Owner: &nbsp;&nbsp;{makerOrderData.signer} </div>
                <div> 价格：&nbsp;&nbsp; {ethers.utils.formatEther(makerOrderData.price)}</div>
                <div>
                    支付方式：&nbsp;&nbsp;{makerOrderData.currency === '0x000000000000000000000000000000000000000b' ? "NBN": "USDT"} 
                </div> 

                <div>
                    <button onClick={() =>ConfirmOrder(makerOrderData)} disabled= {confirmBuyState }>确定购买</button>
                </div>
                <br></br>   
    
            </div>
            )}
        </li>
    )
}


export default MakerOrder;