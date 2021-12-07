import React from 'react';
import github from '../../assets/images/github.png';

const Foooter = () => {
  return (
    <footer className="bg-gray-800 px-5 py-4 shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex text-center justify-between">
        <div>
          <a
            href={`https://github.com/iamnotstatic/pair-getter-contracts`}
            target="_blank"
            rel="noreferrer"
          >
            <img src={github} alt="github" className="w-8" />
          </a>
        </div>
        <div className="text-white">
          Made with ❤️ by{' '}
          <a href="https://twitter.com/iamnotstatic" target="_blank" rel="noreferrer">
            <span className="text-blue-400 dark:text-gray-400">
              iamnotstatic
            </span>
          </a>
        </div>
        <div>
          <a
            href={`https://github.com/iamnotstatic/pair-getter-interface`}
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
