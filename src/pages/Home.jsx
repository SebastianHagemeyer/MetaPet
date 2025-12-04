import petzLogo from '/src/assets/metapetzlogodark.svg'

export default function Home() {
  return (
    <div className="hpage">
      <h1>Welcome to MetaPetz</h1>

      <div className="brand">
        <a href="https://metapetz.com" target="_blank">
          <img src={petzLogo} className="logo" alt="MetaPetz logo" />
        </a>
      </div>

      <p className="read-the-docs">
        Curate and interact with your own pet in AR.
      </p>
    </div>
  )
}
