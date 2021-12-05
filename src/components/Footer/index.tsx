import React from 'react';
import ethereum from '../../assets/images/ethereum-eth-logo.svg';
import uniswap from '../../assets/images/uniswap-uni-logo.svg';

const Foooter = () => {
  return (
    <footer className="bg-blue-300 px-5 py-4 shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex text-center justify-between">
        <div>
          <a
            href={`${process.env.REACT_APP_UNISWAP}?outputCurrency=${process.env.REACT_APP_STAKEY_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={uniswap} alt="etherscan" className="w-7" />
          </a>
        </div>
        <div>
          <a
            href={`${process.env.REACT_APP_EXPLORER_URL}address/${process.env.REACT_APP_FARM_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={ethereum} alt="etherscan" className="w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Foooter;
