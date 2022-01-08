import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import GoldmineAbi from '../../abis/goldmine.json';
import { bscPools } from '../../constants/bsc';
import {
  getPinksaleLiquidityLocks,
  getUnicryptLiquidityLocks,
  ILiquidityLock,
} from '../../utils';
import { toast } from 'react-toastify';
import CopyToClipboard from 'react-copy-to-clipboard';
import Unicrypt from '../../components/Locks/Unicrypt';
import Pinksale from '../../components/Locks/Pinksale';

const Binance = () => {
  const [address, setAddress] = useState('0x...');
  const [unicryptLiquidityLocks, setUnicryptLiquidityLocks] = useState<
    ILiquidityLock[] | []
  >([]);
  const [pinksaleliquidityLocks, setPinksaleLiquidityLocks] = useState<
    ILiquidityLock[] | []
  >([]);
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
    liquidityTokenPoolSupply: 0,
    pairPoolSupply: 0,
    totalLockedLiquidity: 0,
    lockedPercentage: 0,
    pinksaleTotalLockedLiquidity: 0,
    pinksaleLockedPercentage: 0,
    tokenTotalSupply: 0,
    owner: '',
  });

  const [web3, setWeb3] = useState<any | null>(null);
  const [goldmineContract, setGoldmineContract] = useState<any | null>(null);

  useEffect(() => {
    const web3 = new Web3(process.env.REACT_APP_BSC_MAINNET_URL as string);

    const goldmineContract = new web3.eth.Contract(
      GoldmineAbi as any,
      process.env.REACT_APP_CONTRACT_ADDRESS as string
    );

    setGoldmineContract(goldmineContract);
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

      const addressIsContract = await web3.eth.getCode(tokenAddress);

      if (addressIsContract === '0x') {
        setContent({ ...content, name: '' });
        setError('Address is not a contract, or invalid network');
        setLoading(false);
        return;
      }

      const pairAddress = await goldmineContract.methods
        .getPair(pairToken, tokenAddress)
        .call();

      const isContract = await web3.eth.getCode(pairAddress);

      if (isContract === '0x') {
        setContent({ ...content, name: '' });
        setError('No liquidity found for this pool token');
        setLoading(false);
        return;
      }

      const tokenDetails = await goldmineContract.methods
        .getTokenInfo(tokenAddress)
        .call();

      const name = tokenDetails[0];
      const symbol = tokenDetails[1];
      const decimals = tokenDetails[2];
      const owner = tokenDetails[3];
      const totalSupply = tokenDetails[4];

      // Init uniswap pair contract
      const poolDetails = await goldmineContract.methods
        .getPoolInfo(pairAddress)
        .call();

      // Get liquidity pool supply
      const pairPoolSupply = poolDetails[4];
      const pairPoolDecimals = poolDetails[5];
      const poolToken0 = poolDetails[0];

      let liquidityTokenPoolSupply;
      let liquidityPoolSupply;

      if (web3.utils.toChecksumAddress(poolToken0) === tokenAddress) {
        liquidityTokenPoolSupply = poolDetails[2];
        liquidityPoolSupply = poolDetails[3];
      } else {
        liquidityTokenPoolSupply = poolDetails[3];
        liquidityPoolSupply = poolDetails[2];
      }

      const liquidityPoolDecimals = poolDetails[5];
      const liquidityPoolSymbol = bscPools.find(
        (pool) => pool.address === pairToken
      )?.symbol as string;

      // Uncrypt locks
      const { uncryptLiquidityLocksData, uncryptTotalLockedLiquidity } =
        await getUnicryptLiquidityLocks(
          web3,
          pairAddress,
          process.env.REACT_APP_UNICRYPT_BSC_LIQUIDITY_LOCKER_ADDRESS as string,
          pairPoolDecimals
        );

      // Pinsale locks
      const { pinksaleLiquidityLocksData, pinksaleTotalLockedLiquidity } =
        await getPinksaleLiquidityLocks(
          web3,
          tokenAddress,
          process.env.REACT_APP_PINKSALE_BSC_LIQUIDITY_LOCKER_ADDRESS as string,
          decimals
        );

      const initialPairPoolSupply = pairPoolSupply / 10 ** pairPoolDecimals;
      const intialTotalLockedLiquidity =
        uncryptTotalLockedLiquidity / 10 ** pairPoolDecimals;

      // Convert token total supply from Gwei to Ether
      const convertedTokenTotalSupply = totalSupply / 10 ** decimals;

      // Unicrypt Percentage of locked liquidity
      const lockedPercentage =
        (intialTotalLockedLiquidity / initialPairPoolSupply) * 100;

      // PinSale Percentage of locked liquidity
      const pinksaleLockedPercentage =
        (pinksaleTotalLockedLiquidity / convertedTokenTotalSupply) * 100;

      setContent({
        name,
        symbol,
        decimals,
        pairAddress,
        pairName: liquidityPoolSymbol,
        liquidityPoolSupply:
          parseInt(liquidityPoolSupply) / 10 ** liquidityPoolDecimals,
        liquidityPoolSymbol,
        liquidityTokenPoolSupply:
          parseInt(liquidityTokenPoolSupply) / 10 ** decimals,
        pairPoolSupply: initialPairPoolSupply,
        totalLockedLiquidity: intialTotalLockedLiquidity,
        lockedPercentage,
        pinksaleTotalLockedLiquidity: pinksaleTotalLockedLiquidity,
        pinksaleLockedPercentage,
        tokenTotalSupply: convertedTokenTotalSupply,
        owner,
      });

      setUnicryptLiquidityLocks(uncryptLiquidityLocksData);
      setPinksaleLiquidityLocks(pinksaleLiquidityLocksData);

      setError('');
      setLoading(false);
    } catch (error) {
      console.log(error);
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
    <div className="bg-white mx-auto max-w-lg shadow-xl rounded-2xl p-4 dark:bg-gray-800 mt-5">
      <form
        className="w-full p-5"
        onSubmit={(e) => onGetPoolInfo(e, bscPools[0].address)}
      >
        {error && (
          <div
            className="bg-red-100 text-center border border-red-400 text-red-700 px-4 py-3 mb-5 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <br />
            <span className="block text-xs sm:inline">{error}</span>
          </div>
        )}
        <label className="block text-gray-700 text-sm font-bold mb-2 text-left dark:text-gray-50">
          Token Address
        </label>
        <div className="">
          <input
            className="shadow appearance-none border rounded w-full py-5 px-4 text-gray-700 text-lg leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
          {bscPools.slice(0, -1).map((pool) => (
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
            onClick={() => onGetPoolInfo(null, bscPools.slice(-1)[0].address)}
          >
            <div className="w-14 bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200">
              <img
                src={bscPools.slice(-1)[0].logo}
                alt={bscPools.slice(-1)[0].symbol}
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
            <div className="bg-white dark:bg-gray-800 dark:text-white text-gray-700 px-4 py-3 rounded relative">
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
                {content.owner && (
                  <div>
                    Owner:{' '}
                    <CopyToClipboard
                      text={content.owner}
                      onCopy={() => onCopy()}
                    >
                      <span className="text-gray-500 cursor-pointer">
                        {content.owner?.slice(0, 6)} ...{' '}
                        {content.owner?.slice(-5)}{' '}
                        <i className="fa fa-copy"></i>
                      </span>
                    </CopyToClipboard>
                  </div>
                )}
                <div className="cursor-pointer">
                  Pancakeswap V2 pair:{' '}
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
                    href={`${process.env.REACT_APP_BSC_SCAN_URL}address/${content.pairAddress}`}
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.symbol}/{content.pairName}
                  </a>
                </div>
                <Tabs className="mt-3 mb-3">
                  <TabList className="text-center dark:bg-gray-800 dark:text-gray-100">
                    {unicryptLiquidityLocks.length > 0 ? (
                      <>
                        <Tab>Unicrypt</Tab>
                        <Tab>Pinksale</Tab>
                      </>
                    ) : pinksaleliquidityLocks.length > 0 ? (
                      <>
                        <Tab>Pinksale</Tab>
                        <Tab>Unicrypt</Tab>
                      </>
                    ) : (
                      <>
                        <Tab>Unicrypt</Tab>
                        <Tab>Pinksale</Tab>
                      </>
                    )}
                  </TabList>

                  {unicryptLiquidityLocks.length > 0 ? (
                    <>
                      <TabPanel className="mt-5">
                        <Unicrypt
                          unicryptLiquidityLocks={unicryptLiquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                      <TabPanel>
                        <Pinksale
                          pinksaleliquidityLocks={pinksaleliquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                    </>
                  ) : pinksaleliquidityLocks.length > 0 ? (
                    <>
                      <TabPanel className="mt-5">
                        <Pinksale
                          pinksaleliquidityLocks={pinksaleliquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                      <TabPanel>
                        <Unicrypt
                          unicryptLiquidityLocks={unicryptLiquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                    </>
                  ) : (
                    <>
                      <TabPanel className="mt-5">
                        <Unicrypt
                          unicryptLiquidityLocks={unicryptLiquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                      <TabPanel>
                        <Pinksale
                          pinksaleliquidityLocks={pinksaleliquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                    </>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Binance;
