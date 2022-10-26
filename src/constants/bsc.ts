import uniswapV2FactoryABI from '../abis/uniswapV2Factory.json';
import Erc20Abi from '../abis/erc20.json';

export const getTokenPairs = async (tokenAddress: string, web3: any) => {
  const uniswapV2Factory = new web3.eth.Contract(
    uniswapV2FactoryABI,
    process.env.REACT_APP_PANCAKESWAP_BSC_FACTORY_ADDRESS
  );

  let pairs: any[] = [];
  const pools: any[] = [
    {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      symbol: 'WBNB',
      logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=014',
    },
    {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      symbol: 'BUSD',
      logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png?v=014',
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=014',
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=014',
    },
    {
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      symbol: 'DAI',
      logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=014',
    },
    {
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      symbol: 'Cake',
      logo: 'https://cryptologos.cc/logos/pancakeswap-cake-logo.svg?v=14',
    }
  ];

  for (const pool of pools) {
    const pair = pairs.find((pair) => pair.poolAddress === pool.address);
    if (!pair) {
      const pairAddress = await uniswapV2Factory.methods
        .getPair(tokenAddress, pool.address)
        .call();

      if (pairAddress !== '0x0000000000000000000000000000000000000000') {
        const erc20Contract = new web3.eth.Contract(
          Erc20Abi as any,
          pool.address
        );
        const symbol = await erc20Contract.methods.symbol().call();

        pairs.push({
          pairAddress: pairAddress,
          tokenAddress,
          poolAddress: pool.address,
          poolSymbol: symbol,
          logo: pool.logo,
        });
      }
    }
  }

  return pairs;
};
