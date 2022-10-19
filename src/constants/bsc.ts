import uniswapV2FactoryABI from '../abis/uniswapV2Factory.json';
import Erc20Abi from '../abis/erc20.json';

export const getTokenPairs = async (tokenAddress: string, web3: any) => {
  const uniswapV2Factory = new web3.eth.Contract(
    uniswapV2FactoryABI,
    process.env.REACT_APP_PANCAKESWAP_BSC_FACTORY_ADDRESS
  );

  const pairs: any = [];
  let events: any[] = [];

  const toBlock = await web3.eth.getBlockNumber();
  const fromBlock = toBlock - 1000000;

  events = await getPairs(
    fromBlock,
    toBlock,
    { token0: tokenAddress },
    uniswapV2Factory
  );

  if (events.length === 0) {
    events = await getPairs(
      fromBlock,
      toBlock,
      { token1: tokenAddress },
      uniswapV2Factory
    );
  }

  if (events.length > 0) {
    for (const event of events) {
      const { token0, token1, pair } = event.returnValues;

      if (token0 === tokenAddress) {
        const erc20Contract = new web3.eth.Contract(Erc20Abi as any, token1);
        const symbol = await erc20Contract.methods.symbol().call();

        pairs.push({
          pairAddress: pair,
          tokenAddress: token0,
          poolAddress: token1,
          poolSymbol: symbol,
          logo: getPoolLogo(token1)?.logo,
        });
      } else {
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
    }

    return pairs;
  }

  return pairs;
};

const getPairs = async (
  fromBlock: number,
  toBlock: number,
  filter: any,
  uniswapV2Factory: any
) => {
  if (fromBlock <= toBlock) {
    try {
      return await uniswapV2Factory.getPastEvents('PairCreated', {
        filter,
        fromBlock: fromBlock,
        toBlock: toBlock,
      });
    } catch (error) {
      const midBlock = (fromBlock + toBlock) >> 1;
      const events: any[] = await getPairs(
        fromBlock,
        midBlock,
        filter,
        uniswapV2Factory
      );
      const events1: any[] = await getPairs(
        midBlock + 1,
        toBlock,
        filter,
        uniswapV2Factory
      );

      return [...events, ...events1];
    }
  } else {
    return [
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
    ];
  }
};

const getPoolLogo = (poolAddress: string) => {
  const bscPools = [
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
      address: '0x',
      symbol: 'N/A',
      logo: 'https://user-images.githubusercontent.com/46509072/195873643-471eaa95-cb32-4675-a892-329a66cb0ee1.png',
    },
  ];

  const pool = bscPools.find(
    (pool) => pool.address === poolAddress || pool.address === '0x'
  );
  return pool;
};
