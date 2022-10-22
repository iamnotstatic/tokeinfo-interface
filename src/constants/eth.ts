import uniswapV2FactoryABI from '../abis/uniswapV2Factory.json';
import Erc20Abi from '../abis/erc20.json';

export const getTokenPairs = async (tokenAddress: string, web3: any) => {
  const uniswapV2Factory = new web3.eth.Contract(
    uniswapV2FactoryABI,
    process.env.REACT_APP_UNISWAP_ETH_FACTORY_ADDRESS
  );

  const pairs: any = [];
  let events: any;

  // Get all pairs events
  events = await uniswapV2Factory.getPastEvents('PairCreated', {
    filter: { token0: tokenAddress },
    fromBlock: 0,
    toBlock: 'latest',
  });

  if (events.length > 0) {
    for (const event of events) {
      const { token0, token1, pair } = event.returnValues;
      const erc20Contract = new web3.eth.Contract(Erc20Abi as any, token1);
      const symbol = await erc20Contract.methods.symbol().call();

      pairs.push({
        pairAddress: pair,
        tokenAddress: token0,
        poolAddress: token1,
        poolSymbol: symbol,
        logo: getPoolLogo(token1)?.logo,
      });
    }

    return pairs;
  } else {
    events = await uniswapV2Factory.getPastEvents('PairCreated', {
      filter: { token1: tokenAddress },
      fromBlock: 0,
      toBlock: 'latest',
    });

    for (const event of events) {
      const { token0, token1, pair } = event.returnValues;
      const erc20Contract = new web3.eth.Contract(Erc20Abi as any, token0);
      const symbol = await erc20Contract.methods.symbol().call();

      pairs.push({
        pairAddress: pair,
        tokenAddress: token1,
        poolAddress: token0,
        poolSymbol: symbol,
        logo: getPoolLogo(token0)?.logo,
      });
    }

    return pairs;
  }
};

const getPoolLogo = (poolAddress: string) => {
  const ethPools = [
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=014',
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=014',
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=014',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=014',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png?v=014',
    },
    {
      address: '0x',
      symbol: 'N/A',
      logo: 'https://user-images.githubusercontent.com/46509072/195873643-471eaa95-cb32-4675-a892-329a66cb0ee1.png',
    },
  ];

  const pool = ethPools.find(
    (pool) => pool.address === poolAddress || pool.address === '0x'
  );
  return pool;
};
