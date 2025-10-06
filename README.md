# 🌍 SAR Earth Visualizer

<div align="center">

**An interactive 3D web application for visualizing global environmental data derived from Synthetic Aperture Radar (SAR) observations**

[![Built with React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.180.0-000000?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)

[Features](#-features) • [Demo](#-live-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📖 About

**SAR Earth Visualizer** is an advanced data visualization platform that transforms satellite radar observations into stunning, interactive 3D visualizations. Built for the **2025 NASA Space Apps Challenge**, this application provides real-time insights into environmental metrics across **500+ major cities worldwide**.

### Why SAR Data?

Synthetic Aperture Radar (SAR) technology provides unique advantages:
- ☁️ **All-Weather Monitoring** - Penetrates clouds and operates day or night
- 🌊 **Surface Analysis** - Detects water content, vegetation, and terrain changes
- 📡 **High Resolution** - Captures detailed environmental patterns
- 🔄 **Consistent Coverage** - Regular satellite passes ensure temporal analysis

---

## ✨ Features

### 🎨 Four Visualization Modes

#### 🔷 3D Mesh Mode
- Dynamic geometric shapes representing data intensity
- Metric-specific geometries (cones, hexagons, octahedrons)
- Real-time animations for high-risk zones
- Material properties with emissive lighting

#### ⬡ Hexagonal Bin Mode
- Regional data aggregation into hexagonal cells
- Color-coded patterns showing continental trends
- 3D altitude scaling based on metric intensity
- Reduces visual clutter for dense datasets

#### ◎ Ripple Rings Mode
- Expanding circular waves from data points
- Ring speed scaled to metric values
- Visualizes environmental influence zones
- Temporal dynamics representation

#### ✨ Hybrid Mode (Recommended)
- Combines all three visualization layers
- Most comprehensive data representation
- Optimal for pattern identification and analysis

### 📊 Environmental Metrics

| Metric | Range | Description | Application |
|--------|-------|-------------|-------------|
| **Soil Moisture** | 0.0 - 1.0 | Water content in soil | Agriculture, drought monitoring |
| **Flood Inundation** | 0.0 - 1.0 | Flood likelihood index | Disaster response, urban planning |
| **Vegetation Density** | 0.0 - 1.0 | Canopy density measure | Forestry, climate analysis |

### 🎬 Advanced Capabilities

- **🎞️ Time-lapse Animation** - Replay environmental changes over 5 years (2019-2023)
- **🔍 Smart Filtering** - Focus on high-risk zones (threshold >0.7)
- **🔎 City Search** - Instant lookup across 500+ cities
- **📈 Interactive Charts** - Detailed temporal trend analysis per city
- **🎯 Responsive Controls** - Intuitive sidebar with real-time updates
- **🌐 Globe Interaction** - Rotate, zoom, and click for city details

---

## 🚀 Live Demo

**[View Live Application →](https://sar-earth-visualizer.vercel.app)** *(if deployed)*

### Screenshots

<details>
<summary>Click to view screenshots</summary>

**Hybrid Mode - Global Overview**
![Hybrid Mode](./screenshots/hybrid-mode.png)

**City Detail Modal**
![City Modal](./screenshots/city-modal.png)

**Time-lapse Animation**
![Animation](./screenshots/animation.gif)

</details>

---

## 🛠️ Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- Modern web browser with WebGL support

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Osank31/sar-earth-visualizer.git
   cd sar-earth-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

The production build will be available in the `dist/` directory.

---

## 🎮 Usage

### Basic Controls

- **🖱️ Mouse Drag** - Rotate the globe
- **🖱️ Scroll** - Zoom in/out
- **🖱️ Click City** - View detailed metrics and charts
- **📅 Date Slider** - Travel through time (2019-2023)
- **📊 Metric Selector** - Switch between environmental metrics
- **🎨 Mode Switcher** - Change visualization styles

### Advanced Features

#### Time-lapse Animation
1. Select start and end dates
2. Adjust animation speed (100ms - 2000ms per frame)
3. Click "Play Animation" to watch environmental changes

#### High-Risk Filtering
Toggle "Show Only High Risk (>0.7)" to focus on critical areas

#### City Search
Type city name in search box for instant filtering

---

## 🏗️ Technology Stack

### Core Framework
- **React 19.2.0** - UI component library
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Lightning-fast build tool

### 3D Visualization
- **Three.js 0.180.0** - WebGL 3D rendering
- **react-globe.gl 2.36.0** - Globe component
- **globe.gl 2.44.0** - Globe core library

### Data Processing & Visualization
- **D3.js 7.9.0** - Data manipulation and scales
- **Recharts 3.2.1** - Chart components
- **PapaParse 5.5.3** - CSV parsing

---

## 📁 Project Structure

```
sar-earth-visualizer/
├── components/
│   ├── GlobeComponentAdvanced.tsx  # Main 3D globe with all modes
│   ├── Sidebar.tsx                 # Control panel
│   ├── CityModal.tsx               # City detail popup
│   └── Legend.tsx                  # Color scale legend
├── hooks/
│   └── useSarData.ts               # Data loading and caching
├── services/
│   └── data.ts                     # Data processing utilities
├── public/
│   └── sar_environmental_data_500_cities_5_years.csv
├── constants.ts                    # Configuration constants
├── types.ts                        # TypeScript definitions
├── App.tsx                         # Main application component
└── vite.config.ts                  # Build configuration
```

---

## 📚 Documentation

Comprehensive guides are available for developers:

- **[VISUALIZATION-GUIDE.md](./VISUALIZATION-GUIDE.md)** - Detailed explanation of each visualization mode
- **[SHADER-REFERENCE.md](./SHADER-REFERENCE.md)** - Custom shader implementations
- **[ADVANCED-FEATURES.md](./ADVANCED-FEATURES.md)** - Animation system and advanced controls
- **[PERFORMANCE-FIXES.md](./PERFORMANCE-FIXES.md)** - Optimization techniques
- **[DATASET-MIGRATION.md](./DATASET-MIGRATION.md)** - Data structure and processing
- **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)** - Deployment instructions

---

## 🔧 Configuration

### Customizing Metrics

Edit `constants.ts` to modify visualization parameters:

```typescript
export const HIGH_RISK_THRESHOLD = 0.7;
export const INITIAL_SELECTED_DATE = '2023-12-31';

export const getMetrics = () => ({
  soilMoisture: {
    name: 'Soil Moisture',
    colorScale: d3.interpolateYlGnBu,
    // ... more config
  }
});
```

### Adjusting Visualization

Modify mesh properties in `GlobeComponentAdvanced.tsx`:

```typescript
const meshGeometries = {
  soilMoisture: new THREE.ConeGeometry(1, 2, 8),
  floodInundation: new THREE.CylinderGeometry(1, 1, 2, 6),
  vegetationDensity: new THREE.OctahedronGeometry(1, 2)
};
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting
- Add comments for complex logic
- Update documentation for new features
- Test across different browsers

---

## 🐛 Troubleshooting

### Globe Not Rendering
- Ensure WebGL is enabled in your browser
- Check browser console for errors
- Try clearing browser cache

### Performance Issues
- Reduce hexbin resolution in settings
- Disable animations for slower devices
- Use mesh mode instead of hybrid mode

### Data Not Loading
- Verify CSV file is in `public/` directory
- Check browser network tab for 404 errors
- Ensure file permissions are correct

For more issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA Space Apps Challenge 2025** - Inspiration and competition framework
- **SAR Satellite Missions** - Sentinel-1, RADARSAT, ALOS for data sources
- **Three.js Community** - 3D rendering expertise
- **React Globe.gl** - Globe component foundation
- **D3.js Team** - Data visualization utilities

---

## 📞 Contact

**Osank31** - [@Osank31](https://github.com/Osank31)

**Project Link:** [https://github.com/Osank31/sar-earth-visualizer](https://github.com/Osank31/sar-earth-visualizer)

---

<div align="center">

**Built with ❤️ for NASA Space Apps Challenge 2025**

⭐ Star this repo if you find it helpful!

</div>
