import React, { useState,useEffect } from 'react';
import { ethers } from 'ethers';
import contractConfig from '../contract-config';
import './FirstMarket.css';
import {getMintData, getTokenIds,getDiscount} from '../utils'

const { senzyAddress, senzyAbi, usdtAddress, usdtAbi } = contractConfig;

const FirstMarket  = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [buystate, setBuyState] = useState(true);
  const [senzyContract, setSenzyContract] = useState(null);
  let [usdtContract, setUsdtContract] = useState(null);
  let [accountAddress,setAccountAddress] = useState(null);
  let [balance,setBalance] = useState(null);
  let [nftPrice,setNftPrice] = useState(null);
  let [submitState,setSubmitState] = useState(true);
  let [formData, setFormData] = useState({
    to: '',
    amount: '',
    currency: '',
  });


  useEffect(() => {
    if (signer){
      const senzyContract = new ethers.Contract(senzyAddress, senzyAbi, signer);
      setSenzyContract(senzyContract);
      const usdtContract = new ethers.Contract(usdtAddress,usdtAbi,signer);
      setUsdtContract(usdtContract);
      console.log("senzyContract:",senzyContract);
      console.log("usdtContract:",usdtContract);
    }    
  }, [signer]);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setSubmitState(false);
    console.log(formData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("进入submint:",formData);
    if (formData.currency === ''){
      alert('缺少参数！');
    }
  
    if (formData.currency === '0x000000000000000000000000000000000000000b'){
      let balance = await provider.getBalance(accountAddress);
      let balanceEther = ethers.utils.formatEther(balance);
      setBalance(balanceEther);
    }else{

      const usdtContract = new ethers.Contract(formData.currency,usdtAbi,signer);
      setUsdtContract(usdtContract);
      let balance = await usdtContract.balanceOf(accountAddress);
      let balanceEther = ethers.utils.formatEther(balance);
      setBalance(balanceEther);
    }

    let nftPrice = await senzyContract.price(formData.currency);
    let nftPriceEther = ethers.utils.formatEther(nftPrice);
    setNftPrice(nftPriceEther);
    console.log("nftPrice:",nftPriceEther);
    
    setBuyState(false);
    // console.log(formData);
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

        console.log('Wallet connected:', provider);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('No Web3 provider detected.');
    }
  };


  // 买nft
  const buySenzy = async (formData) => {
    try {
      // console.log(formData);
      
      // 计算总价格 
      let totalPrice = nftPrice * formData.amount;
      console.log("totalPrice:",totalPrice);
      // 用平台币(BNB)购买
      if (formData.currency === '0x000000000000000000000000000000000000000b'){
        // **************************************  2进入铸造NFT的流程  ******************************************

        //2.1 根据用户购买数量amount通过后端获取到对应的tokenIds 如：tokenIds = [1,2,3]  批量铸造3个nft
        formData.tokenIds = getTokenIds(formData.amount);

          //2.2 通过后端获取到当前用户的折扣 discount
        formData.discount = getDiscount();
        let finalTotalPrice = formData.discount * totalPrice / 10000;
        console.log("finaltotalPrice:",finalTotalPrice);
          //2.3 调用后端对formData数据进行签名
        let mintData = await getMintData(provider,formData)
        console.log("mintData:",mintData);
          //2.4 调用senzy合约的mint方法铸造NFT
        const mintTx = await senzyContract.buyNftUsingETH(mintData,{ value: finalTotalPrice});
        await mintTx.wait();
        alert('NFT Minted Successfully!');
        console.log('Mint NFT successful!');
      }
      else  // 用其他erc20代币购买
      {
          // 获取用户授权给senzy合约的额度
        const allowance = await usdtContract.allowance(accountAddress,senzyAddress);
        // 转换单位为 Ether
        const allowanceEther = ethers.utils.formatEther(allowance);
        console.log("allowance:", allowanceEther);

        // 当前购买的总金额如果大于用户授权给senzy合约的额度
        if (totalPrice > allowanceEther){

          // **************************************  1进入铸造approve的流程  ******************************************
          console.log("进入approve......")
          // 需要调用 usdtContract 合约的approve方法再授权一些额度
          const approveTx = await usdtContract.approve(senzyAddress,ethers.utils.parseUnits((totalPrice - allowanceEther).toString(), 18));
          await approveTx.wait();
          // 等待交易被确认
          console.log('Approval successful!');

          // **************************************  2进入铸造NFT的流程  ******************************************

            //2.1 根据用户购买数量amount通过后端获取到对应的tokenIds 如：tokenIds = [1,2,3]  批量铸造3个nft
          formData.tokenIds = getTokenIds(formData.amount);
          console.log("tokenIds:",formData.tokenIds);

            //2.2 通过后端获取到当前用户的折扣 discount
          formData.discount = getDiscount();
            //2.3 调用后端对formData数据进行签名
          let mintData = await getMintData(provider,formData)
            //2.4 调用senzy合约的mint方法铸造NFT
          const mintTx = await senzyContract.buyNftUsingErc20(mintData);
          await mintTx.wait();
          alert('NFT Minted Successfully!');
          console.log('Mint NFT successful!');

        }else{
          // **************************************  2进入铸造NFT的流程  ******************************************

          //2.1 根据用户购买数量amount通过后端获取到对应的tokenIds 如：tokenIds = [1,2,3]  批量铸造3个nft
          formData.tokenIds = getTokenIds(formData.amount);
          console.log("tokenIds:",formData.tokenIds);

            //2.2 通过后端获取到当前用户的折扣 discount
          formData.discount = getDiscount();
            //2.3 调用后端对formData数据进行签名
          let mintData = await getMintData(provider,formData)
          console.log("mintData:",mintData);
            //2.4 调用senzy合约的mint方法铸造NFT
          const mintTx = await senzyContract.buyNftUsingErc20(mintData);
          await mintTx.wait();
          alert('NFT Minted Successfully!');
          console.log('Mint NFT successful!');
        }
      }
      


      setBuyState(true);
      setFormData({
        to: '',
        amount: '',
        currency: '',
        discount: '',
      });

    } catch (error) {
      setBuyState(false);
      alert('Error minting NFT: ' + error.message);
    }
  };

  return (
    <div className='Senzy'>
      <div className='card'>
        <h1 className='h1'>  一级市场</h1>
        <button className='connect-button' onClick= {connectHandler} > connect wallet </button>
        <h3> 当前地址：{accountAddress}</h3>
        <section>
          <div>
            <p>余额：{balance}</p>
          </div>
        </section>
        <section>
          <div className='buy-div'>
            {/* <input type="text" value={tokenNumber} onChange={handleTokenIdChange} placeholder="购买数量" /> */}
            <form onSubmit={handleSubmit}>
              <div>
                <input type="text" name="to" value={formData.to} onChange={handleInputChange} placeholder="to" />
              </div>
              <div>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="购买数量:" />
              </div>
              <div>
                        支付方式：
                          <input
                            type="radio"
                            id="alipay"
                            name="currency"
                            value="0x000000000000000000000000000000000000000b"
                            checked={formData.currency === '0x000000000000000000000000000000000000000b'}
                            onChange={handleInputChange}
                            required
                          />
                          <label htmlFor="NBN">NBN</label>

                          <input
                            type="radio"
                            id="USDT"
                            name="currency"
                            value="0x17494f594E44482Ef2bc151B12582c786e89AFFb"
                            checked={formData.currency === '0x17494f594E44482Ef2bc151B12582c786e89AFFb'}
                            onChange={handleInputChange}
                            required
                          />
                          <label htmlFor="USDT">USDT</label>
                      
                  
              </div>
              <div>
                <button type="submit" disabled={submitState} >提交</button>
                <button onClick={() =>buySenzy(formData)} disabled= {buystate }>购买</button>
              </div>
    
            </form>
            </div>
        </section>
      </div>
    </div>
  );
};

export default FirstMarket ;
