import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import './App.css';

import Layout from './components/Layout';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout active="eth" />} />
        <Route path="/bsc" element={<Layout active={'bsc'} />} />
        <Route path="/eth" element={<Layout active={'eth'} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
