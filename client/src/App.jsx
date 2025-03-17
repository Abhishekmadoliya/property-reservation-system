import React, { useState } from 'react';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
function App() {
 return (
  <div >
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        {/* <Route path="/search" element={<SearchResults />} />
        <Route path="/favorites" element={<Favorites />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </main>
  </div>
 )

}

export default App;