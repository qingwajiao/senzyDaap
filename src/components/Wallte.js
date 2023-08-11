import './Home.css'
import { ethers } from 'ethers';
import contractConfig from '../contract-config';
const { senzyAddress, senzyAbi, usdtAddress, usdtAbi,senzyExchangeAddress,senzyExchangeAbi } = contractConfig;


function Wallet({ onDataUpdate }){


      // 链接钱包
    const connectWallte = async()=>{
        if (window.ethereum) {
        try {
            // 请求用户授权连接钱包
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // 获取Provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // 设置连接的钱包
            let signer = provider.getSigner();
            // setSigner(provider.getSigner());
            const address = await signer.getAddress();
            // setAccount({
            //     isConnect:true,
            //     signer:signer,
            //     address:address
            // });

            onDataUpdate({
                isConnect:true,
                provider:provider,
                signer:signer,
                address:address,
                senzyContract : new ethers.Contract(senzyAddress, senzyAbi, signer),
                usdtContract : new ethers.Contract(usdtAddress,usdtAbi,signer),
                senzyExchangeContract : new ethers.Contract(senzyExchangeAddress,senzyExchangeAbi,signer)
            });

            console.log('Wallet connected:', signer);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
        } else {
            console.error('No Web3 provider detected.');
        }
    };

    return(
        <div className='Wallet'>
            <button className='connect-wallet' onClick= {connectWallte} > connect wallet </button>
        </div>
    )
}


export default Wallet;