import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import Web3 from 'web3';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import GoldmineAbi from '../../abis/goldmine.json';
import Erc20Abi from '../../abis/erc20.json';
import {
  getUnicryptLiquidityLocks,
  ILiquidityLock,
  getPinksaleLiquidityLocks,
  getTeamFinanceLiquidityLocks,
} from '../../utils';
import Unicrypt from '../../components/Locks/Unicrypt';
import Pinksale from '../../components/Locks/Pinksale';
import { getTokenPairs } from '../../constants/eth';
import { IContent } from '../../utils/index.interface';
import TeamFinance from '../../components/Locks/TeamFinance';

const Ethereum = () => {
  const [isActiveIndex, setIsActiveIndex] = useState(0);
  const [tokenAddress, setAddress] = useState('0x...');
  const [unicryptLiquidityLocks, setUnicryptLiquidityLocks] = useState<
    ILiquidityLock[] | []
  >([]);
  const [pinksaleliquidityLocks, setPinksaleLiquidityLocks] = useState<
    ILiquidityLock[] | []
  >([]);

  const [teamFinanceLiquidityLocks, setTeamFinanceLiquidityLocks] = useState<
    ILiquidityLock[] | []
  >([]);

  const [tokenPairs, setTokenPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState<IContent>({
    name: '',
    symbol: '',
    decimals: 0,
    pairAddress: '',
    liquidityPoolSymbol: '',
    liquidityPoolSupply: 0,
    liquidityTokenPoolSupply: 0,
    pairPoolSupply: 0,
    tokenTotalSupply: 0,
    uncryptTotalLockedLiquidity: 0,
    unicryptLockedPercentage: 0,
    pinksaleTotalLockedLiquidity: 0,
    pinksaleLockedTokenPercentage: 0,
    pinksaleLockedLpTokenPercentage: 0,
    pinksaleTotalLockedTokens: 0,
    pinksaleTotalLockedLpTokens: 0,
    owner: '',
    network: 'eth',
    teamFinanceTotalLockedLiquidity: 0,
    teamFinanceLockedTokenPercentage: 0,
    teamFinanceLockedLpTokenPercentage: 0,
    teamFinanceTotalLockedTokens: 0,
    teamFinanceTotalLockedLpTokens: 0,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');

    if (address) {
      setAddress(address);
      onSetAddress(null, address);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGetPoolInfo = async (
    e: any,
    tokenAddress: string,
    pairAddress: string,
    poolSymbol: string
  ) => {
    if (e !== null) {
      e.preventDefault();
    }

    setError('');
    setContent({ ...content, name: '' });
    setLoading(true);

    try {
      const web3 = new Web3(process.env.REACT_APP_ETH_MAINNET_URL as string);

      const goldmineContract = new web3.eth.Contract(
        GoldmineAbi as any,
        process.env.REACT_APP_ETH_CONTRACT_ADDRESS as string
      );

      const isContract = await web3.eth.getCode(pairAddress);

      if (isContract === '0x') {
        setContent({ ...content, name: '' });
        setError('No liquidity found for this pool token');
        setLoading(false);
        return;
      }

      const erc20Contract = new web3.eth.Contract(
        Erc20Abi as any,
        tokenAddress
      );

      let owner: string = '';
      try {
        owner = await erc20Contract.methods.owner().call();
      } catch (error) {
        owner = '';
      }

      const name = await erc20Contract.methods.name().call();
      const symbol = await erc20Contract.methods.symbol().call();
      const decimals = await erc20Contract.methods.decimals().call();
      const totalSupply = await erc20Contract.methods.totalSupply().call();

      // Init uniswap pair contract
      const poolDetails = await goldmineContract.methods
        .getPoolInfo(pairAddress)
        .call();

      // Get liquidity pool supply
      const pairPoolSupply = poolDetails.poolTotalSupply;
      const pairPoolDecimals = poolDetails.poolDecimals;
      const poolToken0 = poolDetails.token0;

      let liquidityTokenPoolSupply;
      let liquidityPoolSupply;

      if (web3.utils.toChecksumAddress(poolToken0) === tokenAddress) {
        liquidityTokenPoolSupply = poolDetails._reserve0;
        liquidityPoolSupply = poolDetails._reserve1;
      } else {
        liquidityTokenPoolSupply = poolDetails._reserve1;
        liquidityPoolSupply = poolDetails._reserve0;
      }

      const liquidityPoolDecimals = poolDetails.poolDecimals;

      const initialPairPoolSupply = pairPoolSupply / 10 ** pairPoolDecimals;
      const tokenTotalSupply = totalSupply / 10 ** decimals;

      // Uncrypt locks
      const { uncryptLiquidityLocksData, uncryptTotalLockedLiquidity } =
        await getUnicryptLiquidityLocks(
          web3,
          pairAddress,
          process.env.REACT_APP_UNICRYPT_ETH_LIQUIDITY_LOCKER_ADDRESS as string,
          pairPoolDecimals
        );

      // Pinsale locks
      const {
        pinksaleLiquidityLocksData,
        pinksaleTotalLockedLiquidity,
        pinksaleTotalLockedTokens,
        pinksaleTotalLockedLpTokens,
      } = await getPinksaleLiquidityLocks(
        web3,
        tokenAddress,
        pairAddress,
        content.network,
        decimals,
        pairPoolDecimals
      );

      // Team finance locks
      const {
        teamFinanceLiquidityLocksData,
        teamFinanceTotalLockedTokens,
        teamFinanceTotalLockedLpTokens,
        teamFinanceTotalLockedLiquidity,
      } = await getTeamFinanceLiquidityLocks(
        tokenAddress,
        pairAddress,
        decimals,
        pairPoolDecimals,
        process.env.REACT_APP_ETH_TEAM_FINANCE_LOCKER_V2_ADDRESS as string,
        web3,
        content.network
      );

      // Uncrypt Percentage of locked liquidity in the pool
      const unicryptLockedPercentage =
        (uncryptTotalLockedLiquidity / initialPairPoolSupply) * 100;

      // Pinksale locked liquidity percentage
      const pinksaleLockedTokenPercentage =
        (pinksaleTotalLockedTokens / tokenTotalSupply) * 100;

      // Pinksale locked lp tokens percentage
      const pinksaleLockedLpTokenPercentage =
        (pinksaleTotalLockedLpTokens / initialPairPoolSupply) * 100;

      // Team finance locked liquidity percentage
      const teamFinanceLockedTokenPercentage =
        (teamFinanceTotalLockedTokens / tokenTotalSupply) * 100;

      // Team finance locked lp tokens percentage
      const teamFinanceLockedLpTokenPercentage =
        (teamFinanceTotalLockedLpTokens / initialPairPoolSupply) * 100;

      // Get Locked Percentage
      setContent({
        name,
        symbol,
        decimals,
        pairAddress,
        liquidityPoolSymbol: poolSymbol,
        liquidityPoolSupply:
          parseInt(liquidityPoolSupply) / 10 ** liquidityPoolDecimals,
        liquidityTokenPoolSupply:
          parseInt(liquidityTokenPoolSupply) / 10 ** decimals,
        pairPoolSupply: initialPairPoolSupply,
        tokenTotalSupply,
        uncryptTotalLockedLiquidity,
        unicryptLockedPercentage,
        pinksaleTotalLockedLiquidity,
        pinksaleLockedTokenPercentage,
        pinksaleLockedLpTokenPercentage,
        pinksaleTotalLockedTokens,
        pinksaleTotalLockedLpTokens,
        teamFinanceTotalLockedLiquidity,
        teamFinanceLockedTokenPercentage,
        teamFinanceLockedLpTokenPercentage,
        teamFinanceTotalLockedTokens,
        teamFinanceTotalLockedLpTokens,
        owner,
        network: 'eth',
      });

      setUnicryptLiquidityLocks(uncryptLiquidityLocksData);
      setPinksaleLiquidityLocks(pinksaleLiquidityLocksData);
      setTeamFinanceLiquidityLocks(teamFinanceLiquidityLocksData);

      setError('');
      setLoading(false);
    } catch (error) {
      console.log(error);
      setContent({ ...content, name: '' });
      setLoading(false);
      setError('Something went wrong, Please check address and try again');
    }
  };

  const onSetAddress = async (e: any, address: string) => {
    if (e !== null) {
      e.preventDefault();
    }

    setLoading(true);
    setError('');
    setContent({ ...content, name: '' });
    setTokenPairs([]);

    try {
      const web3 = new Web3(process.env.REACT_APP_ETH_MAINNET_URL as string);

      const urlParams = new URLSearchParams(window.location.search);
      const paramAddress = urlParams.get('address');

      if (paramAddress) {
        urlParams.set('address', address);
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}?${urlParams.toString()}`
        );
      }

      if (!web3.utils.isAddress(address)) {
        setContent({ ...content, name: '' });
        setError('Invalid address provided');
        setLoading(false);
        return;
      }

      const tokenAddress = web3.utils.toChecksumAddress(address);
      const addressIsContract = await web3.eth.getCode(tokenAddress);

      if (addressIsContract === '0x') {
        setContent({ ...content, name: '' });
        setError('Address is not a contract, or invalid network');
        setLoading(false);
        return;
      }

      // get token pairs
      const pairs = await getTokenPairs(tokenAddress, web3);

      if (pairs.length === 0) {
        setContent({ ...content, name: '' });
        setError('No liquidity found for this token');
        setLoading(false);
        return;
      }

      setTokenPairs(pairs);
      setAddress(tokenAddress);

      onGetPoolInfo(
        null,
        tokenAddress,
        pairs[0].pairAddress,
        pairs[0].poolSymbol
      );
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
        onSubmit={(e) => onSetAddress(e, tokenAddress)}
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
            className="shadow appearance-none border rounded w-full py-5 px-4 text-gray-700 text-lg leading-tight focus:outline-none focus:shadow-outline  dark:bg-gray-800 dark:text-white dark:border-gray-600"
            id="address"
            type="text"
            required={true}
            placeholder="0x..."
            onChange={(e) => onSetAddress(null, e.target.value)}
            autoComplete="off"
          />
        </div>

        {tokenPairs.length > 0 && (
          <>
            <label className="block text-gray-700 text-sm font-bold mb-2 text-left dark:text-gray-50 mt-5">
              Select Pair
            </label>
            <div
              className={`flex text-center max-w-full gap-2 overflow-scroll ${
                tokenPairs?.length < 5 && 'justify-center'
              }`}
            >
              {tokenPairs.map((pair, index) => (
                <div
                  key={index}
                  className="text-center"
                  onClick={() => {
                    setIsActiveIndex(index);
                    onGetPoolInfo(
                      null,
                      pair.tokenAddress,
                      pair.pairAddress,
                      pair.poolSymbol
                    );
                  }}
                >
                  <div
                    className={`w-20 ${
                      isActiveIndex === index ? 'bg-gray-100' : 'bg-gray-500'
                    } p-2 rounded-lg cursor-pointer hover:bg-gray-300 text-center`}
                  >
                    <img src={pair.logo} alt="pool" className="w-8 mx-auto" />
                    <p className="text-xs mt-2 font-bold">{pair.poolSymbol}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
              <div className="text-left mb-3">
                <div className="cursor-pointer">
                  Token:{' '}
                  <CopyToClipboard text={tokenAddress} onCopy={() => onCopy()}>
                    <span>
                      <a
                        href={`${process.env.REACT_APP_ETHERSCAN_URL}address/${tokenAddress}`}
                        className="text-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tokenAddress?.slice(0, 6)} ...{' '}
                        {tokenAddress?.slice(-5)}{' '}
                      </a>

                      <i className="fa fa-copy"></i>
                    </span>
                  </CopyToClipboard>
                </div>
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
                <div>
                  Total Supply:{' '}
                  <span className="text-gray-500">
                    {content.tokenTotalSupply.toLocaleString('en-US')}
                  </span>
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
                    href={`${process.env.REACT_APP_ETHERSCAN_URL}address/${content.pairAddress}`}
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content.symbol}/{content.liquidityPoolSymbol}
                  </a>
                </div>
                <div>
                  Total LP tokens:{' '}
                  <span className="text-gray-500">
                    {content.pairPoolSupply.toLocaleString('en-US')}
                  </span>
                </div>

                <Tabs className="mt-3 mb-3">
                  <TabList className="text-center dark:bg-gray-800 dark:text-gray-100">
                    {unicryptLiquidityLocks.length > 0 ? (
                      <>
                        <Tab>Unicrypt</Tab>
                        <Tab>Pinksale</Tab>
                        <Tab>Team Finance</Tab>
                      </>
                    ) : pinksaleliquidityLocks.length > 0 ? (
                      <>
                        <Tab>Pinksale</Tab>
                        <Tab>Unicrypt</Tab>
                        <Tab>Team Finance</Tab>
                      </>
                    ) : teamFinanceLiquidityLocks.length > 0 ? (
                      <>
                        <Tab>Team Finance</Tab>
                        <Tab>Pinksale</Tab>
                        <Tab>Unicrypt</Tab>
                      </>
                    ) : (
                      <>
                        <Tab>Pinksale</Tab>
                        <Tab>Unicrypt</Tab>
                        <Tab>Team Finance</Tab>
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
                      <TabPanel>
                        <TeamFinance
                          teamFinanceLiquidityLocks={teamFinanceLiquidityLocks}
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
                      <TabPanel>
                        <TeamFinance
                          teamFinanceLiquidityLocks={teamFinanceLiquidityLocks}
                          onCopy={onCopy}
                          content={content}
                        />
                      </TabPanel>
                    </>
                  ) : teamFinanceLiquidityLocks.length > 0 ? (
                    <>
                      <TabPanel className="mt-5">
                        <TeamFinance
                          teamFinanceLiquidityLocks={teamFinanceLiquidityLocks}
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
                      <TabPanel>
                        <Pinksale
                          pinksaleliquidityLocks={pinksaleliquidityLocks}
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

                      <TabPanel>
                        <TeamFinance
                          teamFinanceLiquidityLocks={teamFinanceLiquidityLocks}
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

export default Ethereum;
