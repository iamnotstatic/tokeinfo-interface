import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Foooter from '../Footer';
import Ethereum from '../../pages/Ethereum';
import Binance from '../../pages/Binance';

const Layout = () => {
  return (
    <div className="flex flex-col h-screen font-mono">
      <main className="flex-grow">
        <Tabs className="mt-8 text-sm">
          <TabList className="shadow-lg p-4 dark:bg-gray-800 dark:text-gray-100 text-center">
            <Tab>Ethereum</Tab>
            <Tab>Binance Smart Chain</Tab>
          </TabList>

          <TabPanel className="mt-5">
            <Ethereum />
          </TabPanel>
          <TabPanel>
            <Binance />
          </TabPanel>
        </Tabs>
      </main>
      <ToastContainer />
      <Foooter />
    </div>
  );
};

export default Layout;
