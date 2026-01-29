import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Construction from "./pages/Construction";
import Renovation from "./pages/Renovation";
import Contact from "./pages/Contact";

import AdminLayout from "./admin/AdminLayout";
import AdminContact from "./admin/AdminContact";

import AdminVideo from "./admin/AdminVideo";

import "./styles/App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* WEBSITE ROUTES (WITH HEADER & FOOTER) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/construction" element={<Construction />} />
          <Route path="/renovation" element={<Renovation />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ADMIN ROUTES (NO HEADER & FOOTER) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="contact" element={<AdminContact />} />
          <Route path="video" element={<AdminVideo />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
