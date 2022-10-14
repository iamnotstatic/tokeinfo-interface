import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import './App.css';

import Layout from './components/Layout';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/bsc" element={<Layout />} />
        <Route path="/eth" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
