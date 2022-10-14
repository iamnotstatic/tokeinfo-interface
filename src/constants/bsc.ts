import uniswapV2FactoryABI from '../abis/uniswapV2Factory.json';

export const getTokenPools = async (tokenAddress: string, web3: any) => {
  const uniswapV2Factory = new web3.eth.Contract(
    uniswapV2FactoryABI,
    process.env.REACT_APP_UNISWAP_BSC_FACTORY_ADDRESS
  );

  // Get all pairs events
  const pools = await uniswapV2Factory.getPastEvents('PairCreated', {
    filter: { token1: tokenAddress },
    fromBlock: 19675439,
    toBlock: 'latest',
  });

  console.log(pools);

  return pools;
};

export const bscPools = [
  {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    coingeckoId: 'wbnb',
    symbol: 'WBNB',
    logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=014',
  },
  {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    coingeckoId: 'binance-usd',
    symbol: 'BUSD',
    logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png?v=014',
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955',
    coingeckoId: 'tether',
    symbol: 'USDT',
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=014',
  },
  {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    coingeckoId: 'usd-coin',
    symbol: 'USDC',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=014',
  },
  {
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    coingeckoId: 'dai',
    symbol: 'DAI',
    logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=014',
  },
];
