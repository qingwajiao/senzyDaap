import React, { useState ,useEffect} from 'react';
import { ethers } from 'ethers';
import contractConfig from '../contract-config';
import './SecondMarket.css';
import {getMintData, getTokenIds,getDiscount,commonSenzyContract} from '../utils'

const { senzyAddress,senzyAbi } = contractConfig;

const FirstMarket = ({parenAccount}) =>{

    const [buystate, setBuyState] = useState(true);
    let [submitState,setSubmitState] = useState(true);
    let [confirmBuyState,setConfirmBuyState] = useState(false);
    let [showOrder,setShowOrder] = useState(true);
    let [nftPrice,setNftPrice] = useState(0);
    let [totalPrice,setTotalPrice] = useState(0);
    let [currency,setCurrency] = useState('')
    let [formData, setFormData] = useState({
      to: '',
      amount: '',
      currency: '',
    });
    let [account,setAccount] = useState(parenAccount);

    useEffect(() => {
      setAccount(parenAccount);
    }, [parenAccount]);

    useEffect( () => {
      getNftPrice();
    }, [formData.currency]);

    useEffect( () => {
      getTotalPrice();
    }, [formData.amount]);


    const getNftPrice = async () => {

      if (formData.currency === ''){
        setNftPrice(0);
      }else{

        let nftPrice = await commonSenzyContract.price(formData.currency);
        let nftPriceEther = ethers.utils.formatEther(nftPrice);
        setNftPrice(nftPriceEther);

        // 计算总价格 
      let totalPrice = nftPriceEther * formData.amount;
        setTotalPrice(totalPrice);
      }

    }

    const getTotalPrice = async () => {

      if (formData.amount === ''){
        setNftPrice(0);
      }else{
        // 计算总价格 
        let totalPrice = nftPrice * formData.amount;
          setTotalPrice(totalPrice);
        }
    }

    const handleInputChange = (event) => {
      const { name, value } = event.target;
      // if (name === 'currency'){
      //   setCurrency(value);
      // }
      setFormData({ ...formData, [name]: value });
      // setSubmitState(false);
      console.log(formData);
      if (formData.to !== '' && formData.amount !== '' && formData.currency !== ''){
        setBuyState(false);
      }

    };

      const handleSubmit = (event) => {
        event.preventDefault();
        console.log("进入submint:",formData);
        if (formData.currency === '' && formData.amount === '' && formData.to == ''){
          alert('缺少参数！');
        }         

      };

      // 买nft
  const buySenzy = async (formData) => {
    try {
      // console.log(formData);
      
      // 计算总价格 
      // let totalPrice = nftPrice * formData.amount;
      console.log("totalPrice:",totalPrice);
      // 用平台币(BNB)购买
      if (formData.currency === '0x000000000000000000000000000000000000000b'){
        // **************************************  2进入铸造NFT的流程  ******************************************

        //2.1 根据用户购买数量amount通过后端获取到对应的tokenIds 如：tokenIds = [1,2,3]  批量铸造3个nft
        formData.tokenIds = await getTokenIds(formData.amount);
        // formData.tokenIds = [1,5];

          //2.2 通过后端获取到当前用户的折扣 discount
        formData.discount = getDiscount();
        let finalTotalPrice = formData.discount * totalPrice / 10000;
        let totalPriceEther = ethers.utils.parseEther(finalTotalPrice.toString());
        console.log("finaltotalPrice:", totalPriceEther);
          //2.3 调用后端对formData数据进行签名  
        let mintData = await getMintData(account.provider,formData)
        console.log("mintData:",mintData);
          //2.4 调用senzy合约的mint方法铸造NFT
        const mintTx = await account.senzyContract.buyNftUsingETH(mintData,{ value: totalPriceEther});
        await mintTx.wait();
        alert('NFT Minted Successfully!');
        console.log('Mint NFT successful!');
      }
      else  // 用其他erc20代币购买
      {
          // 获取用户授权给senzy合约的额度
        const allowance = await account.usdtContract.allowance(account.address,senzyAddress);
        // 转换单位为 Ether
        const allowanceEther = ethers.utils.formatEther(allowance);
        console.log("allowance:", allowanceEther);

        // 当前购买的总金额如果大于用户授权给senzy合约的额度
        if (totalPrice > allowanceEther){

          // **************************************  1进入铸造approve的流程  ******************************************
          console.log("进入approve......")
          // 需要调用 usdtContract 合约的approve方法再授权一些额度
          const approveTx = await account.usdtContract.approve(senzyAddress,ethers.utils.parseUnits((totalPrice - allowanceEther).toString(), 18));
          await approveTx.wait();
          // 等待交易被确认
          console.log('Approval successful!');

          // **************************************  2进入铸造NFT的流程  ******************************************

            //2.1 根据用户购买数量amount通过后端获取到对应的tokenIds 如：tokenIds = [1,2,3]  批量铸造3个nft
          formData.tokenIds = await getTokenIds(formData.amount);
          console.log("tokenIds:",formData.tokenIds);
          console.log("进入到3。。。:");

            //2.2 通过后端获取到当前用户的折扣 discount
          formData.discount = getDiscount();
            //2.3 调用后端对formData数据进行签名
          let mintData = await getMintData(account.provider,formData)
            //2.4 调用senzy合约的mint方法铸造NFT
          const mintTx = await account.senzyContract.buyNftUsingErc20(mintData);
          await mintTx.wait();
          alert('NFT Minted Successfully!');
          console.log('Mint NFT successful!');

        }else{
          // **************************************  2进入铸造NFT的流程  ******************************************

          //2.1 根据用户购买数量amount通过后端获取到对应的tokenIds 如：tokenIds = [1,2,3]  批量铸造3个nft
          formData.tokenIds = await getTokenIds(formData.amount);
          console.log("tokenIds:",formData.tokenIds);

            //2.2 通过后端获取到当前用户的折扣 discount
          formData.discount = getDiscount();
            //2.3 调用后端对formData数据进行签名
          let mintData = await getMintData(account.provider,formData)
          console.log("mintData:",mintData);
            //2.4 调用senzy合约的mint方法铸造NFT
          const mintTx = await account.senzyContract.buyNftUsingErc20(mintData);
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
        <div>
            <div className='tittle'>
                <h3 className='market'>一级市场</h3> 
            </div>

            <div>
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
                    <div>
                      单价：{nftPrice}
                    </div>
                    <div>
                      总价：{totalPrice}
                    </div> 
                </div>
                <div>
                  {/* <button type="submit" disabled={submitState} >提交</button> */}
                  <button onClick={() =>buySenzy(formData)} disabled= {buystate }>购买</button>
                </div>
      
              </form>
            </div>
            <br></br>
            <div>当前账户：{account.address}</div>
        </div>
    )
}

export default FirstMarket;