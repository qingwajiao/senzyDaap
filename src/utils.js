import contractConfig from './contract-config';
const {ethers} = require("ethers");


// 后端存一个admin的私钥，用于给一些特定的合约方法的参数签名
const adminPrivateKey = "34e99c293405283be8dddc8e847c87ceae9e7e91b1995fd94aabf5032c8917c4";

export async function getMintData(provider,formData) {

    console.log("formData:",formData);
    // 获取 chainId
    const { chainId } = await provider.getNetwork();
    console.log("获取到的chainid:",chainId);

    const signer = new ethers.Wallet(adminPrivateKey, provider);
    // const signer = provider.getSigner();

    // 构造 domain 结构体
    // 最后一个地址字段，由于我们在合约中使用了 address(this)
    // 因此需要在部署合约之后，将合约地址粘贴到这里
    const domain = {
        name: 'Senzy',
        version: '1',
        chainId: chainId,
        verifyingContract: contractConfig.senzyAddress,
    };
    // The named list of all type definitions
    // 构造签名结构体类型对象
    const types = {
        Param: [
            { name: 'to', type: 'address' },
            { name: 'tokenIds', type: 'uint256[]' },
            { name: 'currency', type: 'address' },
            { name: 'discount', type: 'uint256' },
        ]
    };
    // The data to sign
    // 自行构造一个结构体的值
    const value = {
        to: formData.to, // 请替换为接收地址
        tokenIds: formData.tokenIds, // 请替换为tokenIds的实际值
        currency: formData.currency, // 请替换为currency的实际值
        discount: formData.discount, // 请替换为discount的实际值
    };
    const signature = await signer._signTypedData(
        domain,
        types,
        value
    );

    // 将签名分割成 v r s 的格式
    let signParts = ethers.utils.splitSignature(signature);
    console.log(">>> Signature:", signParts);
    // 打印签名本身
    // console.log(signature);

    let mintData = {
        to: formData.to, // 请替换为接收地址
        tokenIds: formData.tokenIds, // 请替换为tokenIds的实际值
        currency: formData.currency, // 请替换为currency的实际值
        discount: formData.discount, // 请替换为discount的实际值
        v:signParts.v,
        r:signParts.r,
        s:signParts.s
    }

    return mintData;
}


let Current = 0;
// 跟用户购买的数量，通过后端获取相应的 tokenId； 如：用户购买数量amount=3  则后端分配3个tokenId [3,4,5] 
export function getTokenIds(amount){
    let tokenIds = [];
    for (var i = 0; i < amount; i++) {
        Current ++
        tokenIds.push(Current);
      }
    console.log("tokenIds:",tokenIds);
    return tokenIds;
}

let nonce = 1;
export function getNonce(){
        nonce ++
    console.log("nonce:",nonce);
    return nonce;
}

// 获取用户的折扣
export function getDiscount(){
    // 8000 = 80% , 9500 = 95%
    return 8000;
}

export async function getSignMessage(provider,formData) {
     // 获取 chainId
     const { chainId } = await provider.getNetwork();  // getNetwork
     console.log("获取到的chainid:",chainId);

    const signer = provider.getSigner();
 
     // 构造 domain 结构体
     // 最后一个地址字段，由于我们在合约中使用了 address(this)
     // 因此需要在部署合约之后，将合约地址粘贴到这里
     const domain = {
         name: 'SenzyExchange',
         version: '1',
         chainId: chainId,
         verifyingContract: contractConfig.senzyExchangeAddress,
     };
     // The named list of all type definitions
 
     // 构造签名结构体类型对象
     const types = {
         MakerOrder: [
             {name: 'isOrderAsk', type: 'bool'},
             {name: 'signer', type: 'address'},
             {name: 'collection', type: 'address'},
             {name: 'price', type: 'uint256'},
             {name: 'tokenId', type: 'uint256'},
             {name: 'amount', type: 'uint256'},
             {name: 'strategy', type: 'address'},
             {name: 'currency', type: 'address'},
             {name: 'nonce', type: 'uint256'},
             {name: 'startTime', type: 'uint256'},
             {name: 'endTime', type: 'uint256'},
             {name: 'minPercentageToAsk', type: 'uint256'},
             {name: 'params', type: 'bytes'},
         ]
     };
     // The data to sign
     // 自行构造一个结构体的值

     const priceInWei = ethers.utils.parseEther(formData.price.toString());
     const value = {
         isOrderAsk: formData.isOrderAsk,
         signer: formData.signer,
         collection: formData.collection,
         price: priceInWei,
         // ethers.utils.parseEther("0.01") 
         tokenId:formData.tokenId,
         amount:formData.amount,
         strategy:formData.strategy,
         currency:formData.currency,
         nonce:formData.nonce,
         startTime:formData.startTime,
         endTime:formData.endTime,
         minPercentageToAsk:formData.minPercentageToAsk,
         params: ethers.utils.defaultAbiCoder.encode([], []),  
         
     };
     const signature = await signer._signTypedData(
         domain,
         types,
         value
     );
     console.log("params:->>:",ethers.utils.defaultAbiCoder.encode([], []));
 
     // 将签名分割成 v r s 的格式
     let signParts = ethers.utils.splitSignature(signature);
     
     formData.price = priceInWei;
     formData.v = signParts.v;
     formData.r = signParts.r;
     formData.s = signParts.s;
     return formData;
}

