import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import Web3 from 'web3';
import PairContractAbi from '../../abis/pairGetter.json';
import Erc20Abi from '../../abis/erc20.json';
import axios, { AxiosResponse } from 'axios';
import { ethPools } from '../../constants/eth';

const Ethereum = () => {
  const [address, setAddress] = useState('0x...');
  const [pairToken, setPairToken] = useState(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState({
    name: '',
    symbol: '',
    decimals: '',
    pairAddress: '',
    pairName: '',
    liquidity: 0,
    liquiditySymbol: '',
    liquidityUSD: 0,
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

  const onGetPair = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const checksummedAddress = await web3.utils.toChecksumAddress(address);

      const ethMainnet = new Web3(
        process.env.REACT_APP_INFURA_MAINNET_URL as string
      );
      const addressIsContract = await ethMainnet.eth.getCode(
        checksummedAddress
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
          checksummedAddress,
          process.env.REACT_APP_UNISWAP_FACTORY_ADDRESS,
          process.env.REACT_APP_UNISWAP_HASH
        )
        .call();

      const isContract = await ethMainnet.eth.getCode(pairAddress);

      if (isContract === '0x') {
        setContent({ ...content, name: '' });
        setError('No liquidity found for this token');
        setLoading(false);
        return;
      }

      const erc20Contract = new ethMainnet.eth.Contract(
        Erc20Abi as any,
        checksummedAddress
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

      const liquidityBalance = await poolErc20Contract.methods
        .balanceOf(pairAddress)
        .call();
      const liquidityDecimals = await poolErc20Contract.methods
        .decimals()
        .call();
      const liquiditySymbol = await poolErc20Contract.methods.symbol().call();

      setContent({
        name,
        symbol,
        decimals,
        pairAddress,
        pairName: liquiditySymbol,
        liquidity: parseInt(liquidityBalance) / 10 ** liquidityDecimals,
        liquiditySymbol,
        liquidityUSD:
          (parseInt(liquidityBalance) / 10 ** liquidityDecimals) *
          data[`${coingeckoId}`].usd,
      });

      setError('');
      setLoading(false);
    } catch (error) {
      setContent({ ...content, name: '' });
      setLoading(false);
      setError('Something went wrong, please try again');
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
    <div className="bg-gray-100 mx-auto max-w-lg shadow-lg rounded-2xl overflow-hidden p-4 sm:flex dark:bg-gray-800 mt-20">
      <form className="w-full p-5" onSubmit={onGetPair}>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-5 rounded relative"
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
            className="shadow appearance-none border rounded w-full py-5 px-4 text-gray-700 text-lg leading-tight focus:outline-none focus:shadow-outline"
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
        <div className="">
          <select
            className="shadow appearance-none border rounded w-full py-5 px-4 text-gray-700 text-lg leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => setPairToken(e.target.value)}
          >
            {ethPools.map((pool) => (
              <option key={pool.symbol} value={pool.address}>
                {pool.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6">
          <button
            className={`bg-gray-800 w-full py-4 px-8 rounded-lg text-gray-50 ${
              loading === true ? 'disabled:opacity-50 cursor-not-allowed' : null
            }`}
          >
            {loading ? 'Getting Pair...' : 'Get Pair'}
          </button>
        </div>

        {content.name && (
          <div className="mt-6 text-center">
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative">
              <strong className="font-bold text-left">Token Info</strong>
              <div className="sm:inline block text-left">
                <div>Name: {content.name}</div>
                <div>Symbol: {content.symbol}</div>
                <div>Decimals: {content.decimals}</div>
                <div>
                  Liquidity: {content.liquidity.toFixed(4)}{' '}
                  {content.liquiditySymbol}{' '}
                  <span className="font-bold">
                    (
                    {content.liquidityUSD.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                    )
                  </span>
                </div>
                <div className="cursor-pointer">
                  Pair Address:{' '}
                  <CopyToClipboard
                    options={{ message: '' }}
                    text="Hello!"
                    onCopy={() => onCopy()}
                  >
                    <span>
                      {content.pairAddress?.slice(0, 6)} ...{' '}
                      {content.pairAddress?.slice(-5)}{' '}
                      <i className="fa fa-copy"></i>
                    </span>
                  </CopyToClipboard>
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
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Ethereum;
