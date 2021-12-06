import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import PairContractAbi from '../../abis/pairGetter.json';
import Erc20Abi from '../../abis/erc20.json';

const Binance = () => {
  const [address, setAddress] = useState('0x...');
  const [pairToken, setPairToken] = useState(
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,WBNB'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState({
    name: '',
    symbol: '',
    decimals: '',
    pairAddress: '',
    pairName: '',
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

    const checksummedAddress = await web3.utils.toChecksumAddress(address);

    const bscMainnet = new Web3(process.env.REACT_APP_BSC_RPC as string);
    const addressIsContract = await bscMainnet.eth.getCode(checksummedAddress);

    if (addressIsContract === '0x') {
      setError('Address is not a contract');
      setLoading(false);
      return;
    }

    const pairAddress = await pairContract.methods
      .getPair(
        pairToken?.split(',')[0] as string,
        checksummedAddress,
        process.env.REACT_APP_PANCAKE_SWAP_FACTORY_ADDRESS,
        process.env.REACT_APP_PANCAKE_SWAP_HASH
      )
      .call();

    const isContract = await bscMainnet.eth.getCode(pairAddress);

    if (isContract === '0x') {
      setError('No liquidity found for this token');
      setLoading(false);
      return;
    }

    const erc20Contract = new bscMainnet.eth.Contract(
      Erc20Abi as any,
      checksummedAddress
    );

    const name = await erc20Contract.methods.name().call();
    const symbol = await erc20Contract.methods.symbol().call();
    const decimals = await erc20Contract.methods.decimals().call();

    setContent({
      name,
      symbol,
      decimals,
      pairAddress,
      pairName: pairToken?.split(',')[1] as string,
    });

    setError('');
    setLoading(false);
  };
  return (
    <div className="bg-gray-100 mx-auto max-w-lg shadow-lg rounded overflow-hidden p-4 sm:flex dark:bg-gray-800 mt-20">
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
            <option value="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,WBNB">
              WBNB
            </option>
            <option value="0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56,BUSD">
              BUSD
            </option>
            <option value="0x55d398326f99059fF775485246999027B3197955,USDT">
              USDT
            </option>
            <option value="0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d,USDC">
              USDC
            </option>
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
          <div className="mt-6">
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Token Info</strong>
              <span className="block sm:inline">
                <div>Name: {content.name}</div>
                <div>Symbol: {content.symbol}</div>
                <div>Decimals: {content.decimals}</div>
                <div>Pair Address: {content.pairAddress}</div>
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
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Binance;
