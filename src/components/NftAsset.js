import React, { useState,useEffect } from 'react';
import contractConfig from '../contract-config';
import {getSignMessage} from '../utils'

const { senzyAddress, usdtAddress,senzyExchangeAddress,strategy } = contractConfig;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const NftAsset = ({account,nftInfo,MyAssetSetMakeOrder}) =>{

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [price, setPrice] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [minPercentageToAsk,setMinPercentageToAsk] = useState('');
    const [nonce,setNonce] = useState('');
    let [makerOrderData, setmakerOrderData] = useState(null);

    const [currency, setCurrency] = useState('BNB');

    const handleShelveClick = (product) => {
        // setSelectedProduct(product);
        setShowModal(true);
    };

    const handleModalConfirm = async () => {
        // TODO: 在这里处理上架逻辑，使用 price、startTime 和 endTime

        // let startTime = Math.floor(Date.now() / 1000);
        // let endTime = startTime + 86400;
        setmakerOrderData({
                isOrderAsk: true,
                signer: account.address,
                collection: senzyAddress,
                price: price,
                tokenId: nftInfo.tokenId,
                amount: 1,
                strategy: strategy,
                currency: currency === "USDT" ? usdtAddress: "0x000000000000000000000000000000000000000b",
                nonce: nonce,
                minPercentageToAsk: minPercentageToAsk,
                startTime: startTime,
                endTime:endTime,
                params:""
              
        });

        await sleep(5000); 

        console.log("makeOrderData:",makerOrderData);
        // 如果是卖单，需要先将nft授权给二级市场
        if (makerOrderData.isOrderAsk){
            // **************************************  1进入NFT 的approve流程  ******************************************
            const approvedAddress = await account.senzyContract.getApproved(makerOrderData.tokenId);
            // 转换单位为 Ether
            console.log("approvedAddress:",approvedAddress)

        if (approvedAddress !== senzyExchangeAddress){
            console.log("进入approve......")
            // 需要调用 usdtContract 合约的approve方法再授权一些额度
            const approveTx = await account.senzyContract.approve(senzyExchangeAddress,makerOrderData.tokenId);
            await approveTx.wait();
            // 等待交易被确认
            console.log('Approval successful!');

            // ***************************************  2进入签名流程  ******************************************

            const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
            setmakerOrderData(signMakerOrderData);

            console.log("签名后的信息：",signMakerOrderData)

            // 将签名后的信息设置给上级组件
            MyAssetSetMakeOrder(signMakerOrderData);
            console.log('sign NFT successful!');
            alert('NFT sign Successfully!');

        }

            // ***************************************  2进入签名流程  ******************************************

            const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
            setmakerOrderData(signMakerOrderData);

            console.log("签名后的信息：",signMakerOrderData)

            // 将签名后的信息设置给上级组件
            MyAssetSetMakeOrder(signMakerOrderData);
            console.log('sign NFT successful!');

            alert('NFT sign Successfully!');

        }
       


        setShowModal(false);
      
    };

    const handleOptionChange =  (event) => {
        setCurrency(event.target.value);
    };
    return(
        <li >
        Senzy # {nftInfo.tokenId} &nbsp;&nbsp;
        <button onClick={() => handleShelveClick(nftInfo.makeOrder)}>上架</button>
        {showModal && (
        <div className="modal">
        
        <label>收款方式：</label>
        <label>
            <input
            type="radio"
            value="BNB"
            checked={currency === 'BNB'}
            onChange={handleOptionChange}
            />
            BNB
        </label>
        <label>
            <input
            type="radio"
            value="USDT"
            checked={currency === 'USDT'}
            onChange={handleOptionChange}
            />
            USDT
        </label>
        <br />
        <label>
            售价:
            <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            />
        </label>
        <br />
        <label>
            价格滑点:
            <input
            type="text"
            value={minPercentageToAsk}
            onChange={(e) => setMinPercentageToAsk(e.target.minPercentageToAsk)}
            />
        </label>
        <br />
        <label>
            nonce:
            <input
            type="text"
            value={nonce}
            onChange={(e) => setNonce(e.target.nonce)}
            />
        </label>
        <br />
        <label>
            开始时间:
            <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            />
        </label>
        <br />
        <label>
            结束时间:
            <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            />
        </label>
        <br />
        <button onClick={handleModalConfirm}>确定</button>
        </div>
    )}
    </li>
    )
}

export default NftAsset;