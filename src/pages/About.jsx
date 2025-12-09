import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function About() {
    return (
        <div className="page">
            <h1>About MetaPetz</h1>

            <div className="video-container">
                <iframe
                    src="https://www.youtube.com/embed/9qWBir79Ih4"
                    title="MetaPetz Promotional Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            <p>
                MetaPetz is a mixed-reality pet experience built exclusively for
                Meta Quest. It lets you adopt, customise, and interact with a virtual
                companion that appears directly in your real-world space through
                passthrough and spatial interaction.
            </p>

            <p>
                MetaPetz is being developed as part of the&nbsp;
                <a href="https://developers.meta.com/horizon/blog/meta-horizon-start-developer-competition-2025/"
                    target="_blank" rel="noopener noreferrer">
                    Meta Horizon Start Developer Competition 2025
                </a>,
                showcasing how playful mixed-reality interactions can be built using Quest's
                newest spatial features and development tools.
            </p>

            <p>
                Each pet is created through your own choices and customisation options,
                giving you control over its appearance, colour, and style. MetaPetz aims
                to make virtual pets feel tangible inside your environment using Quest's
                depth, surface detection, and hand-tracking capabilities. For example, clapping will get your pet's attention. When you raise your right hand and have your left hand below your head, your pet will sit. You can also summon a bone toy and pinch to hold it, then throw it by releasing the pinch while moving your hand quickly.
            </p>

            <p>
                The experience focuses on simple interactions, environmental presence,
                and playful behaviour.

                MetaPetz is designed around one goal: providing a fun, immersive, and
                personalised companion inside mixed reality on Meta Quest.
            </p>

            <Link to="/help" className="confused-button">
                Confused?
            </Link>

            <h2>More</h2>

            <div className="more-section">
                <div className="more-item">
                    <h3>A* Pathfinding</h3>
                    <p>Custom A* pathfinding algorithm allows pets to navigate around real-world obstacles in AR.</p>
                    <img src="/gifs/pathfinding.gif" alt="A* Pathfinding demo" />
                </div>

                <div className="more-item">
                    <h3>3D Navigation Map</h3>
                    <p>Real-time 3D navigation mesh built from room scanning, enabling intelligent pet movement.</p>
                    <img src="/gifs/navigation-map.gif" alt="3D Navigation Map demo" />
                </div>

                <div className="more-item">
                    <h3>Accessory System</h3>
                    <p>Unlock and equip accessories as your pet levels up. Customize colors and sizes.</p>
                    <img src="/gifs/accessories.gif" alt="Accessories demo" />
                </div>
            </div>

            <Footer />
        </div>
    )
}
