# MetaPetz

MetaPetz is a mixed-reality pet experience built for Meta Quest. This web application serves as the companion portal where users can adopt, customize, and manage their virtual pets before interacting with them in AR.

## Features

### Home Page
- Welcome landing page with MetaPetz branding
- Introduction to the AR pet experience

### Adopt Page
- Create and customize your own MetaPet
- **3D Pet Preview**: Interactive 3D model viewer with orbit controls
- **Color Customization**:
  - Coat color picker
  - Eye color picker
  - Snout color picker
  - Randomize colors button for quick variations
- **Name & Description**: Randomizable pet name and description
- **Animations**: Pet performs idle animations (sit, wag, walk) while you customize
- **Eye Tracking**: Pet's eyes follow your mouse cursor
- Save pet to Firebase database with unique short ID

### Pet View Page
- View individual pet details with full 3D model
- **Share Modal**:
  - QR code for easy sharing to VR headsets
  - Displays unique pet ID
  - Copy link button for quick sharing
  - Scannable from any device
- **Collapsible Accessories Panel**:
  - Select from unlockable accessories (Party Hat, Wizard Hat, Spinner Hat)
  - Accessories unlock based on pet level
  - Size slider to adjust accessory scale
  - Dual color pickers for accessory customization (ass1, ass2 materials)
  - Randomize accessory colors button
  - Save accessory configuration
- **Animated Accessories**: Spinner Hat propeller rotates continuously
- **Level & XP Display**: Progress bar showing pet's current level and experience
- **Eye Tracking**: Pet's eyes follow your mouse cursor
- Light/dark theme support

### Petz Gallery
- Browse all created pets in a responsive grid layout
- **Sorting**: Sort by newest or oldest first
- **Pagination**: Responsive pagination (3 pets on mobile, 6 on desktop)
- **Pet Cards**: Each card shows:
  - 3D thumbnail preview with colors and accessories
  - Pet name and description
  - View button to see full pet details
  - Share button to copy pet URL to clipboard

### About Page
- Information about MetaPetz and the Meta Horizon Start Developer Competition 2025
- Details about AR interactions (hand tracking, gestures)

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Three Fiber** - 3D rendering with Three.js
- **React Three Drei** - Useful helpers for R3F (OrbitControls, Stage, useGLTF, useAnimations)
- **React Router DOM** - Client-side routing
- **Firebase** - Database for storing pet data
- **Three.js** - 3D graphics library

## Project Structure

```
├── src/
│   ├── api/
│   │   └── petsDb.js          # Firebase database functions
│   ├── assets/                 # Logos and icons
│   ├── components/
│   │   ├── CanvasCapture.jsx   # Captures 3D canvas for thumbnails
│   │   ├── PetModel.jsx        # Shared 3D pet model with accessories
│   │   ├── PetPreview.jsx      # Pet card component for gallery
│   │   └── PetThumbnailCanvas.jsx  # Thumbnail renderer
│   ├── data/
│   │   └── petpresets.js       # Pet names and descriptions
│   ├── lib/
│   │   └── firebase.js         # Firebase configuration
│   ├── pages/
│   │   ├── About.jsx           # About page
│   │   ├── Adopt.jsx           # Pet creation page
│   │   ├── Home.jsx            # Landing page
│   │   ├── Petz.jsx            # Pet gallery page
│   │   └── PetView.jsx         # Individual pet view
│   ├── App.jsx                 # Main app with navigation
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles with theme support
│   └── main.jsx                # Entry point
└── public/
    └── models/                 # 3D models (.glb files)
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 3D Models

The app uses GLB format 3D models located in `public/models/`:
- `thebest.glb` - Main pet model with animations
- `partyhattex.glb` - Party hat accessory
- `wizhattex.glb` - Wizard hat accessory
- `spinhattex.glb` - Spinner hat accessory (with rotating propeller)

### Accessory Material Names
Accessories support two customizable color materials:
- `ass1` - Primary accessory color
- `ass2` - Secondary accessory color

## Theme Support

The app supports both light and dark themes via CSS media queries (`prefers-color-scheme`). Colors adapt automatically based on system preferences.

## License

Part of the Meta Horizon Start Developer Competition 2025.
