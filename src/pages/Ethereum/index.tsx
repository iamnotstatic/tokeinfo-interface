import React, { useState } from 'react';

const Ethereum = () => {
  const [address, setAddress] = useState('0x...');
  const [loading, setLoading] = useState(false);
  return (
    <div className="bg-gray-100 mx-auto max-w-lg shadow-lg rounded overflow-hidden p-4 sm:flex dark:bg-gray-800 mt-20">
      <form className="w-full p-5">
        <div className="mt-4">
          <input
            className="shadow appearance-none border rounded w-full py-5 px-4 text-gray-700 text-lg leading-tight focus:outline-none focus:shadow-outline"
            id="address"
            type="text"
            value={address}
            placeholder="0x..."
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="mt-6">
          <button
            className={`bg-blue-300 w-full py-4 px-8 rounded-lg text-gray-50 ${
              loading === true ? 'disabled:opacity-50 cursor-not-allowed' : null
            }`}
          >
            {loading ? 'Getting Pair...' : 'Get Pair'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Ethereum;
