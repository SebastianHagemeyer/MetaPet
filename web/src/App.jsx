import { useState } from 'react'
import petzLogo from './assets/metapetzlogodark.svg'
import './App.css'

function App() {


  return (
    <>
      <div>
        <a href="https://metapetz.com" target="_blank">
          <img src={petzLogo} className="logo" alt="Vite logo" />
        </a>
        
      </div>
      <h1>MetaPetz</h1>
      <div className="card">
        <p>
          Welcome to MetaPetz
        </p>
      </div>
      <p className="read-the-docs">
          Curate and interact with your own pet in AR.
      </p>
    </>
  )
}

export default App
