import React, { useState } from 'react';
import contractConfig from '../contract-config';
import {getSignMessage} from '../utils'
import './NftAsset.css'

const { senzyAddress,senzyExchangeAddress } = contractConfig;

const NftAsset = ({account,nftInfo,MyAssetSetMakeOrder}) =>{

    const [showModal, setShowModal] = useState(false);
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


    const handleShelveClick = () => {
        // setSelectedProduct(product);
        setShowModal(true);
    };

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

        const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
        // setSignMakerOrderData(signMakerOrderData);
        MyAssetSetMakeOrder(signMakerOrderData);

        console.log("签名后的信息：",signMakerOrderData)
        console.log('sign NFT successful!');
        alert('NFT sign Successfully!');
        setShowModal(false);

      }else{
        // **************************************  2进入签名流程  ******************************************       
        const signMakerOrderData = await getSignMessage(account.provider,makerOrderData);
        // setSignMakerOrderData(signMakerOrderData);
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
                <button onClick={() =>Confirm(makerOrderData)} disabled= {buystate }>确定</button>
                <button onClick={cancel} disabled= {buystate }>取消</button>
                </div>   

            </form>
            </div>
            )}
        </li>
    )
}

export default NftAsset;