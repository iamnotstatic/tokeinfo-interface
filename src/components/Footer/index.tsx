import React from 'react';

const Foooter = () => {
  return (
    <footer className="bg-white px-5 py-4 shadow-2xl dark:bg-gray-800 dark:text-white mt-5 text-center">
      <p className="text-xs text-block">
        To report inaccurate results, any bugs, or to request for features, join
        us at{' '}
        <a
          href="https://t.me/tokeinfo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400"
        >
          https://t.me/tokeinfo
        </a>
      </p>
      <br />
      <div className="text-sm">
        Made for the Web3 Community by{' '}
        <a
          href="https://twitter.com/iamnotstatic"
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-blue-400">iamnotstatic</span>
        </a>
        , see{' '}
        <a
          href="https://github.com/iamnotstatic/tokeinfo-interface"
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-blue-400">GitHub.</span>
        </a>
      </div>
    </footer>
  );
};

export default Foooter;
