import React, { useState,useEffect } from 'react';
import { ethers } from 'ethers';
import contractConfig from '../contract-config';
import './SecondMarket.css';
import {getSignMessage} from '../utils'

const { senzyAddress, senzyAbi, usdtAddress, usdtAbi,senzyExchangeAddress,senzyExchangeAbi } = contractConfig;

const FirstMarket2  = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [buystate, setBuyState] = useState(true);
  let [confirmBuyState,setConfirmBuyState] = useState(true);
  const [senzyContract, setSenzyContract] = useState(null);
  let [usdtContract, setUsdtContract] = useState(null);
  let [senzyExchangeContract, setSenzyExchangeContract] = useState(null);
  let [accountAddress,setAccountAddress] = useState(null);
  let [balance,setBalance] = useState(null);
  let [showTakerOrder, setShowTakerOrder] = useState(false); // showMakerOrder
  let [showMakerOrder, setShowMakerOrder] = useState(true);
  let [submitState,setSubmitState] = useState(true);
  let [nftPrice,setNftPrice] = useState(null);
  let [userNftList,setNserNftList]= useState([]);
  let [showAssetList,setShowAssetList] = useState(true);
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



  useEffect(() => {
    if (signer){
      const senzyContract = new ethers.Contract(senzyAddress, senzyAbi, signer);
      setSenzyContract(senzyContract);
      const usdtContract = new ethers.Contract(usdtAddress,usdtAbi,signer);
      setUsdtContract(usdtContract);
      const senzyExchangeContract = new ethers.Contract(senzyExchangeAddress,senzyExchangeAbi,signer);
      setSenzyExchangeContract(senzyExchangeContract);
    }    
  }, [signer]);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setmakerOrderData({ ...makerOrderData, [name]: value });
    setSubmitState(false);
    // console.log(makerOrderData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBuyState(false);
  };

  // 链接钱包
  const connectHandler = async()=>{
    if (window.ethereum) {
      try {
        // 请求用户授权连接钱包
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // 获取Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        // 设置连接的钱包
        setSigner(provider.getSigner());
        const address = await signer.getAddress();
        setAccountAddress(address);

        let balance = await usdtContract.balanceOf(accountAddress);
        let balanceEther = ethers.utils.formatEther(balance);
        setBalance(balanceEther);

        let userNftList = await getAssetList(address);
        setNserNftList(userNftList);

        console.log('Wallet connected:', provider);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
        console.error('No Web3 provider detected.');
    }
  };


  const getAssetList = async(address) => {
    let amount = await senzyContract.balanceOf(address);

    let idList;
    for (var i = 0; i < amount; i++) {
      let tokenId = await senzyContract.tokenOfOwnerByIndex(address,i);
      idList.push(tokenId);
    }
    console.log(idList);

    return idList;
  }


  // 挂单线下签名
  const Confirm = async (makerOrderData) => {
    try {

      setNftPrice(makerOrderData.price);
      makerOrderData.isOrderAsk === "true" ? makerOrderData.isOrderAsk = true : makerOrderData.isOrderAsk = false;
      makerOrderData.signer = accountAddress;
      makerOrderData.collection= senzyAddress;
      // makerOrderData.nonce = getNonce();
      // makerOrderData.startTime = 1691221120;
      // makerOrderData.endTime = 1691307520;
      makerOrderData.startTime = Math.floor(Date.now() / 1000);
      makerOrderData.endTime = makerOrderData.startTime + 86400;
    
      const approvedAddress = await senzyContract.getApproved(makerOrderData.tokenId);
      // 转换单位为 Ether
      console.log("approvedAddress:",approvedAddress)

      // 当前购买的总金额如果大于用户授权给senzy合约的额度
      if (approvedAddress !== senzyExchangeAddress){

        // **************************************  1进入approve的流程  ******************************************
        console.log("进入approve......")
        // 需要调用 usdtContract 合约的approve方法再授权一些额度
        const approveTx = await senzyContract.approve(senzyExchangeAddress,makerOrderData.tokenId);
        await approveTx.wait();
        // 等待交易被确认
        console.log('Approval successful!');

        // ***************************************  2进入签名流程  ******************************************

        const signMakerOrderData = getSignMessage(provider,makerOrderData);
        setSignMakerOrderData(signMakerOrderData);

        alert('NFT sign Successfully!');

        console.log("签名后的信息：",signMakerOrderData)
        console.log('sign NFT successful!');

      }else{
        // **************************************  2进入签名流程  ******************************************
        
        const signMakerOrderData = await getSignMessage(provider,makerOrderData);
        setSignMakerOrderData(signMakerOrderData);

        alert('NFT sign Successfully!');

        console.log("签名信息：",signMakerOrderData)
        console.log('sign NFT successful!');
      }
      setConfirmBuyState(false);
      setShowTakerOrder(true);
      setShowMakerOrder(false);

      setBuyState(false);
    } catch (error) {
      setBuyState(false);
      alert('Error sign NFT: ' + error.message);
    }
  };


    // 确认成单
    const ConfirmOrder = async () => {

      // let senzyExchangeContract = new ethers.Contract(senzyExchangeAddress,senzyExchangeAbi,signer);
      // setSenzyExchangeContract(senzyExchangeContract);
      console.log("确认成单........");
      signMakerOrderData.params = "0x"
      try {
        let takerOrder = {
          isOrderAsk: !makerOrderData.isOrderAsk,
          taker:accountAddress,
          price:makerOrderData.price,
          tokenId:makerOrderData.tokenId,
          minPercentageToAsk: makerOrderData.minPercentageToAsk,
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
            const exchangeTx = await senzyExchangeContract.matchAskWithTakerBidUsingETHAndWETH(takerOrder,signMakerOrderData,{ value: takerOrder.price});
            await exchangeTx.wait();
            // 转换单位为 Ether
            
            alert('NFT Buy Successfully!');
            setShowTakerOrder(false);
            setShowMakerOrder(true);
            setBuyState(true);
          }
          // 获取用户授权给senzy合约的额度
          const allowance = await usdtContract.allowance(accountAddress,senzyExchangeAddress);
          // 转换单位为 Ether
          const allowanceEther = ethers.utils.formatEther(allowance);
          console.log("allowance:", allowanceEther);

          // 当前购买的总金额如果大于用户授权给senzy合约的额度
          if (takerOrder.price > allowanceEther){

            // **************************************  1 进入铸造approve的流程  ******************************************
            console.log("进入approve......")
            // 需要调用 usdtContract 合约的approve方法再授权一些额度
            const approveTx = await usdtContract.approve(senzyExchangeAddress,ethers.utils.parseUnits((takerOrder.price  - allowanceEther).toString(), 18));
            await approveTx.wait();
            // 等待交易被确认
            console.log('Approval erc20 successful!');
          }
        
          // **************************************  2 进入买NFT的流程  ******************************************
          console.log("ConfirmOrder signMakerOrderData",signMakerOrderData);
          console.log("ConfirmOrder takerOrder:",takerOrder);
          
          console.log("开始买nft ...");
          const exchangeTx = await senzyExchangeContract.matchAskWithTakerBid(takerOrder,signMakerOrderData);
          await exchangeTx.wait();
          // 转换单位为 Ether
          
          alert('NFT Buy Successfully!');
          setShowTakerOrder(false);
          setShowMakerOrder(true);
          setBuyState(true);
      }else{
          const approvedAddress = await senzyContract.getApproved(signMakerOrderData.tokenId);
          // 转换单位为 Ether
          console.log("approvedAddress:",approvedAddress)
  
        // 当前购买的总金额如果大于用户授权给senzy合约的额度
        if (approvedAddress !== senzyExchangeAddress){
  
          // **************************************  1进入approve的流程  ******************************************
          console.log("进入approve NFT......")
          // 需要调用 usdtContract 合约的approve方法再授权一些额度
          const approveTx = await senzyContract.approve(senzyExchangeAddress,signMakerOrderData.tokenId);
          await approveTx.wait();
          // 等待交易被确认
          console.log('Approval successful!');
        }

          // **************************************  2 进入卖NFT的流程  ******************************************
          console.log("开始卖nft ...");
          console.log("ConfirmOrder signMakerOrderData",signMakerOrderData);
          console.log("ConfirmOrder takerOrder:",takerOrder);
          const exchangeTx = await senzyExchangeContract.matchBidWithTakerAsk(takerOrder,signMakerOrderData);
          await exchangeTx.wait();
          // 转换单位为 Ether
          
          alert('NFT Buy Successfully!');
          setShowTakerOrder(false);
          setmakerOrderData({
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
          })
          setShowMakerOrder(true);

      }


      } catch (error) {
        setBuyState(false);
        alert('Error Buy NFT: ' + error.message);
      }
    };
    
  return (
    <div className='Senzy'>
      <div className='card'>
        <div className='title'>
          <button className='firstMarket' onClick= {connectHandler} > 一级市场 </button>
          <h1 className='h1'>  二级市场
          </h1>
          <button className='connect-button' onClick= {connectHandler} > connect wallet </button>
        </div>

        {/* <button className='connect-button' onClick= {connectHandler} > connect wallet </button> */}
        <section>
          <div>
            <p>当前地址：{accountAddress}     余额：{balance}  </p>
          </div>
        </section>

        <section>
          {showMakerOrder &&
          <div className='makerOrder-div' >
             <h3>
              MAKER ORDER
             </h3> 
            {/* <input type="text" value={tokenNumber} onChange={handleTokenIdChange} placeholder="购买数量" /> */}
            <form onSubmit={handleSubmit} >
            <div>
                类型：
                  <input type="radio" id="OrderAsk" name="isOrderAsk" value="true" checked={makerOrderData.isOrderAsk === 'true'}onChange={handleInputChange} required
                  />
                  <label htmlFor="OrderAsk">卖单</label>

                  <input
                    type="radio" id="OrderBid" name="isOrderAsk"  value="false" checked={makerOrderData.isOrderAsk === 'false'}onChange={handleInputChange} required
                  />
                  <label htmlFor="OrderBid">买单</label>                         
              </div>

              <div>
                <input type="number" name="tokenId" value={makerOrderData.tokenId} onChange={handleInputChange} placeholder="tokenId:" />
              </div>

              <div>
                <input type="number" name="amount" value={makerOrderData.amount} onChange={handleInputChange} placeholder="数量:" />
              </div>

              <div>
                <input type="number" name="price" value={makerOrderData.price} onChange={handleInputChange} placeholder="价格:" />
              </div>

              <div>
                <input type="text" name="strategy" value={makerOrderData.strategy} onChange={handleInputChange} placeholder="策略:" />
              </div>

              {/* <div>
                <input type="number" name="startTime" value={makerOrderData.startTime} onChange={handleInputChange} placeholder="开始时间:" />
              </div>

              <div>
                <input type="number" name="endTime" value={makerOrderData.endTime} onChange={handleInputChange} placeholder="结束时间:" />
              </div> */}

              <div>
                <input type="number" name="minPercentageToAsk" value={makerOrderData.minPercentageToAsk} onChange={handleInputChange} placeholder="价格不得低于:" />
              </div>

              <div>
                <input type="text" name="params" value={makerOrderData.params} onChange={handleInputChange} placeholder="其他:" />
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
                <button type="submit" disabled={submitState}>提交</button>
                <button onClick={() =>Confirm(makerOrderData)} disabled= {buystate }>确定</button>
              </div>   

            </form>
          </div>}
        </section>

        <section>
          {showTakerOrder && 
          <div className='takerOrder-div' >
          {/* <input type="text" value={tokenNumber} onChange={handleTokenIdChange} placeholder="购买数量" /> */}
          <form onSubmit={handleSubmit}>

            <div>
              Senzy  # {makerOrderData.tokenId} 
            </div>

            <div>
              价格：{nftPrice} 
            </div>

            <div>
              <button onClick={ConfirmOrder} disabled= {confirmBuyState }>确定购买</button>
            </div>   

          </form>
          </div>}
        </section>

      </div>
    </div>
  );
};

export default FirstMarket2 ;
