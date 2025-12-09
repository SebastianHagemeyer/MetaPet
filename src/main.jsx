import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from '/src/App.jsx'
import Home from '/src/pages/Home.jsx'
import About from '/src/pages/About.jsx'
import Adopt from '/src/pages/Adopt.jsx'
import Petz from '/src/pages/Petz.jsx'
import PetView from '/src/pages/PetView.jsx'
import Help from '/src/pages/Help.jsx'
import '/src/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* App is the layout */}
        <Route path="/" element={<App />}>

          
          {/* Index route = "/" */}
          <Route index element={<Home />} />
          {/* Other pages */}
          {/*<Route path="home" element={<Navigate to="/" replace />} /> */} 
          <Route path="about" element={<About />} />
          <Route path="adopt" element={<Adopt />} />
          <Route path="petz" element={<Petz />} />
          <Route path="help" element={<Help />} />

          <Route path="view/:id" element={<PetView />} />

          {/* 404 fallback */}
          <Route path="*" element={<h1>404 – Page not found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
