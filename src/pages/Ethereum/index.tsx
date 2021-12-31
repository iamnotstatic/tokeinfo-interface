import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import Web3 from 'web3';
import PairContractAbi from '../../abis/tokeinfo.json';
import UniswapPairAbi from '../../abis/uniswapPair.json';
import Erc20Abi from '../../abis/erc20.json';
import axios, { AxiosResponse } from 'axios';
import { ethPools } from '../../constants/eth';
import { getLiquidityLocks, ILiquidityLock } from '../../utils';
import Moment from 'react-moment';

const Ethereum = () => {
  const [address, setAddress] = useState('0x...');
  // const [pairToken, setPairToken] = useState(
  //   '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  // );
  const [liquidityLocks, setLiquidityLocks] = useState<ILiquidityLock[] | []>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState({
    name: '',
    symbol: '',
    decimals: '',
    pairAddress: '',
    pairName: '',
    liquidityPoolSupply: 0,
    liquidityPoolSymbol: '',
    liquidityPoolSupplyUSD: 0,
    liquidityTokenPoolSupply: 0,
    pairPoolSupply: 0,
    totalLockedLiquidity: 0,
    lockedPercentage: 0,
  });

  const [web3, setWeb3] = useState<any | null>(null);
  const [pairContract, setPairContract] = useState<any | null>(null);

  useEffect(() => {
    const web3 = new Web3(process.env.REACT_APP_INFURA_URL as string);

    const pairContract = new web3.eth.Contract(
      PairContractAbi as any,
      process.env.REACT_APP_CONTRACT_ADDRESS as string
    );

    setPairContract(pairContract);
    setWeb3(web3);
  }, []);

  const onGetPoolInfo = async (e: any, pairToken: string) => {
    if (e !== null) {
      e.preventDefault();
    }

    setError('');
    setContent({ ...content, name: '' });
    setLoading(true);

    try {
      const tokenAddress = await web3.utils.toChecksumAddress(address);

      const ethMainnet = new Web3(
        process.env.REACT_APP_INFURA_MAINNET_URL as string
      );
      const addressIsContract = await ethMainnet.eth.getCode(
        tokenAddress
      );

      if (addressIsContract === '0x') {
        setContent({ ...content, name: '' });
        setError('Address is not a contract');
        setLoading(false);
        return;
      }

      const pairAddress = await pairContract.methods
        .getPair(
          pairToken,
          tokenAddress,
          process.env.REACT_APP_UNISWAP_FACTORY_ADDRESS,
          process.env.REACT_APP_UNISWAP_HASH
        )
        .call();

      const isContract = await ethMainnet.eth.getCode(pairAddress);

      if (isContract === '0x') {
        setContent({ ...content, name: '' });
        setError('No liquidity found for this pool token');
        setLoading(false);
        return;
      }

      const erc20Contract = new ethMainnet.eth.Contract(
        Erc20Abi as any,
        tokenAddress
      );

      const poolErc20Contract = new ethMainnet.eth.Contract(
        Erc20Abi as any,
        pairToken
      );
      const coingeckoId = ethPools.find(
        (pool) => pool.address === pairToken
      )?.coingeckoId;

      const { data }: AxiosResponse = await axios.get(
        `${process.env.REACT_APP_COINGECKO_URL}simple/price?ids=${coingeckoId}&vs_currencies=usd`
      );

      const name = await erc20Contract.methods.name().call();
      const symbol = await erc20Contract.methods.symbol().call();
      const decimals = await erc20Contract.methods.decimals().call();

      // Init uniswap pair contract
      const uniswapPairContract = new ethMainnet.eth.Contract(
        UniswapPairAbi as any,
        pairAddress
      );

      // Get liquidity pool supply
      const pairPoolSupply = await uniswapPairContract.methods
        .totalSupply()
        .call();
      const pairPoolDecimals = await uniswapPairContract.methods
        .decimals()
        .call();

      const poolReserves = await uniswapPairContract.methods
        .getReserves()
        .call();

      const poolToken0 = await uniswapPairContract.methods.token0().call();

      let liquidityTokenPoolSupply;
      let liquidityPoolSupply;

      if (web3.utils.toChecksumAddress(poolToken0) === checksummedAddress) {
        liquidityTokenPoolSupply = poolReserves._reserve0;
        liquidityPoolSupply = poolReserves._reserve1;
      } else {
        liquidityTokenPoolSupply = poolReserves._reserve1;
        liquidityPoolSupply = poolReserves._reserve0;
      }

      const liquidityPoolDecimals = await poolErc20Contract.methods
        .decimals()
        .call();
      const liquidityPoolSymbol = await poolErc20Contract.methods
        .symbol()
        .call();

      // Uncrypt locks
      const { liquidityLocksData, totalLockedLiquidity } =
        await getLiquidityLocks(
          ethMainnet,
          pairAddress,
          tokenAddress,
          process.env.REACT_APP_UNICRYPT_ETH_LIQUIDITY_LOCKER_ADDRESS as string,
          process.env.REACT_APP_PINKSALE_ETH_LIQUIDITY_LOCKER_ADDRESS as string,
          pairPoolDecimals
        );

      const initialPairPoolSupply = pairPoolSupply / 10 ** pairPoolDecimals;
      const intialTotalLockedLiquidity =
        totalLockedLiquidity / 10 ** pairPoolDecimals;

      // Percentage of locked liquidity
      const lockedPercentage =
        (intialTotalLockedLiquidity / initialPairPoolSupply) * 100;

      // Get Locked Percentage
      setContent({
        name,
        symbol,
        decimals,
        pairAddress,
        pairName: liquidityPoolSymbol,
        liquidityPoolSupply:
          parseInt(liquidityPoolSupply) / 10 ** liquidityPoolDecimals,
        liquidityPoolSymbol,
        liquidityPoolSupplyUSD:
          (parseInt(liquidityPoolSupply) / 10 ** liquidityPoolDecimals) *
          data[`${coingeckoId}`].usd,
        liquidityTokenPoolSupply:
          parseInt(liquidityTokenPoolSupply) / 10 ** decimals,
        pairPoolSupply: initialPairPoolSupply,
        totalLockedLiquidity: intialTotalLockedLiquidity,
        lockedPercentage,
      });

      setLiquidityLocks(liquidityLocksData);

      setError('');
      setLoading(false);
    } catch (error) {
      setContent({ ...content, name: '' });
      setLoading(false);
      setError('Something went wrong, Please check address and try again');
    }
  };

  const onCopy = () => {
    toast.success('Address copied to clipboard', {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
    });
  };
  return (
    <div className="bg-white mx-auto max-w-lg shadow-2xl rounded-2xl p-4 dark:bg-gray-800 mt-10">
      <form
        className="w-full p-5"
        onSubmit={(e) => onGetPoolInfo(e, ethPools[0].address)}
      >
        {error && (
          <div
            className="bg-red-100 text-center border border-red-400 text-red-700 px-4 py-3 mb-5 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <br />
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <label className="block text-gray-700 text-sm font-bold mb-2 text-left dark:text-gray-50">
          Token Address
        </label>
        <div className="">
          <input
            className="shadow appearance-none border rounded w-full py-5 px-4 text-gray-700 text-lg leading-tight focus:outline-none focus:shadow-outline  dark:bg-gray-800 dark:text-white dark:border-gray-600"
            id="address"
            type="text"
            placeholder="0x..."
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="off"
          />
        </div>

        <label className="block text-gray-700 text-sm font-bold mb-2 text-left dark:text-gray-50 mt-5">
          Select Pool Token
        </label>
        <div className="flex flex-wrap text-center">
          {ethPools.slice(0, -1).map((pool) => (
            <div
              key={pool.address}
              className="flex-auto text-center"
              onClick={() => onGetPoolInfo(null, pool.address)}
            >
              <div className="w-14 bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200">
                <img src={pool.logo} alt={pool.symbol} className="w-8" />
              </div>
            </div>
          ))}
          <div
            className="flex text-center"
            onClick={() => onGetPoolInfo(null, ethPools.slice(-1)[0].address)}
          >
            <div className="w-14 bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200">
              <img
                src={ethPools.slice(-1)[0].logo}
                alt={ethPools.slice(-1)[0].symbol}
                className="w-8"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-16">
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </div>
        )}

        {content.name && (
          <div className="mt-6 text-center">
            <div className="bg-white text-gray-700 dark:bg-gray-800 dark:text-white px-4 py-3 rounded relative">
              <strong className="font-bold text-left">Token Info</strong>
              <div className="text-left mb-3">
                <div>
                  Name: <span className="text-gray-500">{content.name}</span>
                </div>
                <div>
                  Symbol:{' '}
                  <span className="text-gray-500">{content.symbol}</span>
                </div>
                <div>
                  Decimals:{' '}
                  <span className="text-gray-500">{content.decimals}</span>
                </div>
                <div className="cursor-pointer">
                  Uniswap V2 pair:{' '}
                  <CopyToClipboard
                    text={content.pairAddress}
                    onCopy={() => onCopy()}
                  >
                    <span className="text-gray-500">
                      {content.pairAddress?.slice(0, 6)} ...{' '}
                      {content.pairAddress?.slice(-5)}{' '}
                      <i className="fa fa-copy"></i>
                    </span>
                  </CopyToClipboard>
                </div>
                <div>
                  Pooled {content.liquidityPoolSymbol}:{' '}
                  <span className="text-gray-500">
                    {content.liquidityPoolSupply.toLocaleString('en-US')}{' '}
                  </span>
                  <span className="font-bold">
                    (
                    {content.liquidityPoolSupplyUSD.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                    )
                  </span>
                </div>
                <div>
                  Pooled {content.name}:{' '}
                  <span className="text-gray-500">
                    {content.liquidityTokenPoolSupply.toLocaleString('en-US')}
                  </span>
                </div>
                <div>
                  Pool:{' '}
                  <a
                    href={`${process.env.REACT_APP_ETHER_SCAN_URL}address/${content.pairAddress}`}
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.symbol}/{content.pairName}
                  </a>
                </div>
                <div>
                  Total LP tokens:{' '}
                  <span className="text-gray-500">
                    {content.pairPoolSupply.toLocaleString('en-US')}
                  </span>
                </div>
                <div>
                  Total locked LP:{' '}
                  <span className="text-gray-500">
                    {content.totalLockedLiquidity.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="font-bold text-center text-base mt-2">
                  {content.lockedPercentage.toFixed(1)}% LP is locked in
                  Unicrypt <i className="fa fa-lock"></i>
                </div>
              </div>

              <div className="flex mt-3 font-italic">
                <div> Value </div>
                <div className="flex-grow"></div>
                <div> Unlock date </div>
              </div>

              {liquidityLocks.map((lock) => (
                <div key={lock.id}>
                  <div className="border-b-2">
                    <div className="flex items-center">
                      <div>
                        <div className="font-bold"></div>
                        <div className="text-xs text-gray-500">
                          {lock.amount.toLocaleString()} univ2
                        </div>
                      </div>
                      <div className="flex-grow" />
                      <div className="text-right">
                        <div className="font-bold">
                          <Moment fromNow>
                            {new Date(lock.unlockDate * 1000)}
                          </Moment>
                        </div>
                        <div className="text-xs text-gray-500">
                          <Moment format="DD/MM/YYYY h:mm">
                            {new Date(lock.unlockDate * 1000)}
                          </Moment>
                        </div>
                      </div>
                      <i
                        aria-hidden="true"
                        className={`fa ${
                          lock.expired ? 'fa-unlock' : 'fa-lock'
                        } text-lg ${
                          lock.expired ? 'text-red-500' : 'text-green-500'
                        } ml-4`}
                      />
                    </div>
                    <div>
                      <div className="p-2">
                        <CopyToClipboard
                          text={lock.owner}
                          onCopy={() => onCopy()}
                        >
                          <div>
                            Owner:
                            <span className="cursor-pointer text-gray-500">
                              {' '}
                              {lock.owner?.slice(0, 6)} ...{' '}
                              {lock.owner?.slice(-5)}{' '}
                              <i className="fa fa-copy"></i>{' '}
                            </span>
                          </div>
                        </CopyToClipboard>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Ethereum;
