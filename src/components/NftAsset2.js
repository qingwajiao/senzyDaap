import React, { useState,useEffect } from 'react';
import contractConfig from '../contract-config';
import {getSignMessage} from '../utils'
import './NftAsset.css'

const { senzyAddress, usdtAddress,senzyExchangeAddress,strategy } = contractConfig;


const NftAsset2 = ({account,nftInfo,MyAssetSetMakeOrder}) =>{

    const [showModal, setShowModal] = useState(false);
    const [price, setPrice] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [minPercentageToAsk,setMinPercentageToAsk] = useState('');
    const [nonce,setNonce] = useState('');
    // let [makerOrderData, setmakerOrderData] = useState(null);
    const [currency, setCurrency] = useState('BNB');
    let [submitState,setSubmitState] = useState(false);
    let [buystate, setBuyState] = useState(false);
    let [showParams,setShowParams] = useState(false);

    let [makerOrderData, setmakerOrderData] = useState({
        isOrderAsk: '',
        signer: '',
        collection: '',
        price: '',
        tokenId: '',
        amount: '',
        strategy: '',
        currency: '',
        nonce: '',
        startTime: '',
        endTime: '',
        minPercentageToAsk:'',
        params:""
      });
      let [signMakerOrderData,setSignMakerOrderData] = useState(null)

    const handleShelveClick = () => {
        // setSelectedProduct(product);
        setShowModal(true);
    };

    // const handleModalConfirm = async () => {
    //     // TODO: 在这里处理上架逻辑，使用 price、startTime 和 endTime

    //     // let startTime = Math.floor(Date.now() / 1000);
    //     // let endTime = startTime + 86400;
    //     setmakerOrderData({
    //             isOrderAsk: true,
    //             signer: account.address,
    //             collection: senzyAddress,
    //             price: price,
    //             tokenId: nftInfo.tokenId,
    //             amount: 1,
    //             strategy: strategy,
    //             currency: currency === "USDT" ? usdtAddress: "0x000000000000000000000000000000000000000b",
    //             nonce: nonce,
    //             minPercentageToAsk: minPercentageToAsk,
    //             startTime: startTime,
    //             endTime:endTime,
    //             params:""
              
    //     });

    //     await sleep(5000); 

    //     console.log("makeOrderData:",makerOrderData);
    //     // 如果是卖单，需要先将nft授权给二级市场
    //     if (makerOrderData.isOrderAsk){
    //         // **************************************  1进入NFT 的approve流程  ******************************************
    //         const approvedAddress = await account.senzyContract.getApproved(makerOrderData.tokenId);
    //         // 转换单位为 Ether
    //         console.log("approvedAddress:",approvedAddress)

    //     if (approvedAddress !== senzyExchangeAddress){
    //         console.log("进入approve......")
    //         // 需要调用 usdtContract 合约的approve方法再授权一些额度
    //         const approveTx = await account.senzyContract.approve(senzyExchangeAddress,makerOrderData.tokenId);
    //         await approveTx.wait();
    //         // 等待交易被确认
    //         console.log('Approval successful!');

    //         // ***************************************  2进入签名流程  ******************************************

    //         const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
    //         setmakerOrderData(signMakerOrderData);

    //         console.log("签名后的信息：",signMakerOrderData)

    //         // 将签名后的信息设置给上级组件
    //         MyAssetSetMakeOrder(signMakerOrderData);
    //         console.log('sign NFT successful!');
    //         alert('NFT sign Successfully!');

    //     }

    //         // ***************************************  2进入签名流程  ******************************************

    //         const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
    //         setmakerOrderData(signMakerOrderData);

    //         console.log("签名后的信息：",signMakerOrderData)

    //         // 将签名后的信息设置给上级组件
    //         MyAssetSetMakeOrder(signMakerOrderData);
    //         console.log('sign NFT successful!');

    //         alert('NFT sign Successfully!');

    //     }
       


    //     setShowModal(false);
      
    // };

    // const handleOptionChange =  (event) => {
    //     setCurrency(event.target.value);
    // };

      // 挂单线下签名
  const Confirm = async (makerOrderData) => {
    try {

    //   setNftPrice(makerOrderData.price);
      makerOrderData.isOrderAsk = true ;
      makerOrderData.signer = account.address;
      makerOrderData.collection= senzyAddress;
      makerOrderData.tokenId = nftInfo.tokenId;
      makerOrderData.amount = 1;
      makerOrderData.startTime = Math.floor(Date.now() / 1000);
      makerOrderData.endTime = makerOrderData.startTime + 86400;
    
      const approvedAddress = await account.senzyContract.getApproved(makerOrderData.tokenId);
      // 转换单位为 Ether
      console.log("approvedAddress:",approvedAddress)

      // 当前购买的总金额如果大于用户授权给senzy合约的额度
      if (approvedAddress !== senzyExchangeAddress){

        // **************************************  1进入approve的流程  ******************************************
        console.log("进入approve......")
        // 需要调用 usdtContract 合约的approve方法再授权一些额度
        const approveTx = await account.senzyContract.approve(senzyExchangeAddress,makerOrderData.tokenId);
        await approveTx.wait();
        // 等待交易被确认
        console.log('Approval successful!');

        // ***************************************  2进入签名流程  ******************************************

        const signMakerOrderData = getSignMessage(account.provider,makerOrderData);
        setSignMakerOrderData(signMakerOrderData);
        MyAssetSetMakeOrder(signMakerOrderData);

        console.log("签名后的信息：",signMakerOrderData)
        console.log('sign NFT successful!');
        alert('NFT sign Successfully!');
        setShowModal(false);

      }else{
        // **************************************  2进入签名流程  ******************************************
        
        const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
        setSignMakerOrderData(signMakerOrderData);
        MyAssetSetMakeOrder(signMakerOrderData);
        console.log("签名信息：",signMakerOrderData)
        console.log('sign NFT successful!');
        alert('NFT sign Successfully!');
        setShowModal(false);
      }

    } catch (error) {

    alert('Error sign NFT: ' + error.message);
    }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setmakerOrderData({ ...makerOrderData, [name]: value });
        if (name === 'strategy'){
            value === 'privateSale' ? setShowParams(true) : setShowParams(false)
        }
        // console.log(makerOrderData);
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
    };

    const cancel = () => {
        setShowModal(false);
    }
    return(
        <li >
        Senzy # {nftInfo.tokenId} &nbsp;&nbsp;
        <button onClick={() => handleShelveClick(nftInfo.makeOrder)}>上架</button>
        {showModal && (
            <div className='makerOrder-div' >
            <form onSubmit={handleSubmit} >
                <div>
                <input type="number" name="price" value={makerOrderData.price} onChange={handleInputChange} placeholder="价格:" />
                </div>

                <div>
                <input type="number" name="minPercentageToAsk" value={makerOrderData.minPercentageToAsk} onChange={handleInputChange} placeholder="价格不得低于:" />
                </div>

                <div>
                策略:
                    <input type="radio" id="standardSale" name="strategy" value="0xF4205837b4F6bDEF82CA02667E831eB4441703F3" checked={makerOrderData.strategy === '0xF4205837b4F6bDEF82CA02667E831eB4441703F3'}onChange={handleInputChange} required
                    />
                    <label htmlFor="standardSale">标准定价</label>

                    <input
                    type="radio" id="privateSale" name="strategy"  value="privateSale" checked={makerOrderData.strategy === 'privateSale'}onChange={handleInputChange} required
                    />
                    <label htmlFor="privateSale">指定买家</label>   
                    {showParams && ( 
                    <div> &nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="text" name="params" value={makerOrderData.params} onChange={handleInputChange} placeholder="输入买家地址:" />
                    </div>)
                    }                      
                </div>

                <div>
                <input type="number" name="nonce" value={makerOrderData.nonce} onChange={handleInputChange} placeholder="nonce:" />
                </div>

                <div>
                支付方式：
                    <input type="radio" id="NBN" name="currency" value="0x000000000000000000000000000000000000000b" checked={makerOrderData.currency === '0x000000000000000000000000000000000000000b'}onChange={handleInputChange} required
                    />
                    <label htmlFor="NBN">NBN</label>

                    <input
                    type="radio" id="USDT" name="currency"  value="0x17494f594E44482Ef2bc151B12582c786e89AFFb" checked={makerOrderData.currency === '0x17494f594E44482Ef2bc151B12582c786e89AFFb'}onChange={handleInputChange} required
                    />
                    <label htmlFor="USDT">USDT</label>                         
                </div>

                <div>
                {/* <button type="submit" disabled={submitState}>提交</button> */}
                <button onClick={() =>Confirm(makerOrderData)} disabled= {buystate }>确定</button>
                <button onClick={cancel} disabled= {buystate }>取消</button>
                </div>   

            </form>
            </div>
            )}
        </li>
    )
}

export default NftAsset2;