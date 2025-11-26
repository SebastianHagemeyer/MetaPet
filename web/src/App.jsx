import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="app-root">
      <header className="top-nav">
        <div className="brand">
          <Link to="/">MetaPetz</Link>
        </div>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/adopt">Adopt</Link>
        </nav>
      </header>

      <main className="page-container">
        {/* This is where the “current page” renders */}
        <Outlet />
      </main>
    </div>
  )
}

export default App