// src/pages/Help.jsx

export default function Help() {
  return (
    <div className="page">
      <h1>How to Use MetaPetz</h1>

      <section className="help-section">
        <h4>Getting Started</h4>
        <p>
          Welcome to MetaPetz! To begin, adopt a pet on this website and customise its appearance.
          Once you're happy with your pet, you'll receive a unique Pet ID (a short code like "AE653").
        </p>
        <p>
          Open MetaPetz on your Meta Quest, enter your Pet ID, and your pet will appear in your space.
          Once linked to your Quest, that pet is yours - no one else can claim it.
        </p>
      </section>

      <section className="help-section">
        <h4>Your Pet ID</h4>
        <p>
          Your Pet ID is the key to your pet. Keep it safe! You can find it on your pet's view page
          or in the share modal. Use the "Copy Code" button to easily copy it.
        </p>
        <p>
          Once you enter your Pet ID on your Quest for the first time, your pet becomes permanently
          linked to your device. This means your pet's progress, level, and accessories are secure
          and tied to you.
        </p>
      </section>

      <section className="help-section">
        <h4>Environment Modes</h4>
        <p>
          <strong>Outside Mode:</strong> Creates a 5x5 meter virtual room. Use +/- buttons to adjust floor height.
        </p>
        <p>
          <strong>Room Scan Mode:</strong> Uses your real room layout. Your pet navigates around real furniture
          and can jump onto elevated surfaces like tables and couches.
        </p>
      </section>

      <section className="help-section">
        <h4>Getting Your Pet's Attention</h4>
        <p>Before giving commands, you need your pet's attention. A green plumbob appears above their head when attentive.</p>
        <ul className="help-list">
          <li><strong>Clap:</strong> Bring hands together and move them back and forth</li>
          <li><strong>Controller:</strong> Press right trigger 4 times when pet is idle</li>
          <li><strong>Pet 3 times:</strong> Move your hand near your pet repeatedly</li>
          <li><strong>Throw a bone:</strong> Guaranteed to get your pet's attention!</li>
        </ul>
        <p>Attention lasts 5 seconds. You can give up to 2 move commands per attention session.</p>
      </section>

      <section className="help-section">
        <h4>Commands</h4>
        <ul className="help-list">
          <li><strong>Point to move:</strong> Point and pinch, or point with controller and press trigger (pet must be attentive)</li>
          <li><strong>Sit:</strong> Raise your right hand while keeping left hand down (pet must be attentive)</li>
        </ul>
      </section>

      <section className="help-section">
        <h4>Playing Fetch</h4>
        <ul className="help-list">
          <li>Press "Spawn Bone" button - bone appears in your hand</li>
          <li>Pinch/grab the bone</li>
          <li>Release while moving hand to throw</li>
          <li>Your pet will fetch the bone and return it to you</li>
        </ul>
        <p>Each successful fetch earns +5% XP!</p>
      </section>

      <section className="help-section">
        <h4>Petting</h4>
        <p>
          Move your hand within 20cm of your pet and move it around. Hearts will spawn with each pet.
          Each petting action earns +1% XP. Petting 3 times while idle will also get your pet's attention.
        </p>
      </section>

      <section className="help-section">
        <h4>XP and Levelling</h4>
        <p>Earn XP through interaction to level up your pet:</p>
        <ul className="help-list">
          <li><strong>Attention:</strong> +1% every 2 seconds while pet faces you</li>
          <li><strong>Petting:</strong> +1% per pet</li>
          <li><strong>Sit command:</strong> +2% bonus when obeyed</li>
          <li><strong>Fetch:</strong> +5% when bone is returned</li>
        </ul>
        <p>When XP reaches 100%, your pet levels up and XP resets.</p>
      </section>

      <section className="help-section">
        <h4>Accessories</h4>
        <p>
          Customise your pet with accessories like party hats, spinning hats, and wizard hats.
          Each accessory has primary and secondary colours you can change.
          Set accessories on this website - they sync automatically to your Quest.
        </p>
      </section>
    </div>
  )
}
