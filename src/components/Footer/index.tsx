import React from 'react';
import github from '../../assets/images/github.png';

const Foooter = () => {
  return (
    <footer className="bg-gray-800 px-5 py-4 shadow-lg dark:bg-gray-800 mt-5">
      <p className="text-center text-xs text-white">
        To report inaccurate results, any bugs, or to request for features, join
        us at{' '}
        <a
          href="https://t.me/tokeinfo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 dark:text-gray-400"
        >
          https://t.me/tokeinfo
        </a>
      </p>
      <br />
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex text-center justify-between">
        <div>
          <a
            href={`https://github.com/iamnotstatic/tokeinfo-contracts`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={github} alt="github" className="w-8" />
          </a>
        </div>
        <div className="text-white">
          Made for the Web3 Community by{' '}
          <a
            href="https://twitter.com/iamnotstatic"
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-blue-400 dark:text-gray-400">
              iamnotstatic
            </span>
          </a>
        </div>
        <div>
          <a
            href={`https://github.com/iamnotstatic/tokeinfo-interface`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={github} alt="github" className="w-8" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Foooter;
