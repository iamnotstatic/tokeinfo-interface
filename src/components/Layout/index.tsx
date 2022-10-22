import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useDarkMode from '../../hooks/useDarkMode';

import Foooter from '../Footer';
import Ethereum from '../../pages/Ethereum';
import Binance from '../../pages/Binance';

const Layout = ({ active }: { active: string }) => {
  const [colorTheme, setTheme] = useDarkMode();
  return (
    <div className="flex flex-col h-screen font-mono">
      <div className="flex flex-wrap">
        <div className="flex-auto"></div>
        <div className="flex">
          <button
            onClick={() => setTheme(colorTheme)}
            className="mr-10 mt-5 hover:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              className="h-5 w-5 text-gray-600 dark:text-gray-200"
            >
              {colorTheme === 'light' ? (
                <path
                  className="w-3 h-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ) : (
                <path
                  className="w-3 h-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      <main className="flex-grow bg-gray-100 dark:bg-gray-800">
        <Tabs className="text-sm">
          <TabList
            className="shadow-lg p-4 dark:bg-gray-800 dark:text-gray-100 text-center bg-white"
            onClick={() => {
              window.history.pushState({}, document.title, '/');
            }}
          >
            {active === 'eth' ? (
              <>
                <Tab>Ethereum</Tab>
                <Tab>Binance Smart Chain</Tab>
              </>
            ) : active === 'bsc' ? (
              <>
                <Tab>Binance Smart Chain</Tab>
                <Tab>Ethereum</Tab>
              </>
            ) : (
              <>
                <Tab>Ethereum</Tab>
                <Tab>Binance Smart Chain</Tab>
              </>
            )}
          </TabList>

          {active === 'eth' ? (
            <>
              <TabPanel className="mt-5">
                <Ethereum />
              </TabPanel>

              <TabPanel>
                <Binance />
              </TabPanel>
            </>
          ) : active === 'bsc' ? (
            <>
              <TabPanel>
                <Binance />
              </TabPanel>
              <TabPanel className="mt-5">
                <Ethereum />
              </TabPanel>
            </>
          ) : (
            <>
              <TabPanel className="mt-5">
                <Ethereum />
              </TabPanel>
              <TabPanel>
                <Binance />
              </TabPanel>
            </>
          )}
        </Tabs>
      </main>
      <ToastContainer />
      <Foooter />
    </div>
  );
};

export default Layout;
