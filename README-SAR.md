# 🌍 SAR Earth Visualizer - Through the Radar Looking Glass

An interactive 3D web application for visualizing global environmental data derived from Synthetic Aperture Radar (SAR) observations. Built for the 2025 NASA Space Apps Challenge.

## 🎯 Overview

This application provides an immersive visualization of SAR-derived environmental metrics across 500+ major cities worldwide, featuring:

- **Advanced 3D Mesh Visualizations** - Dynamic geometric shapes representing data intensity with real-time animations
- **Hexagonal Aggregation** - Regional data clustering with color-coded hex bins
- **Expanding Ripple Rings** - Influence zones showing data propagation and impact areas
- **Hybrid Mode** - Combined visualization layers for comprehensive data analysis

## 🚀 Features

### Visualization Modes

#### 🔷 3D Mesh Mode
- **Soil Moisture**: Cone-shaped meshes with gradient from yellow (dry) to dark blue (saturated)
- **Flood Inundation**: Hexagonal prisms with pulsing animations for high-risk zones (>0.7)
- **Vegetation Density**: Organic octahedral shapes scaling with canopy density

#### ⬡ Hexagonal Bin Mode
- Regional aggregation of city data
- Color-coded hexagonal cells showing average metric values
- 3D altitude scaling based on data intensity

#### ◎ Ripple Rings Mode
- Expanding circular waves emanating from data points
- Ring speed and radius scale with metric values
- Visual representation of environmental influence zones

#### ✨ Hybrid Mode (Default)
- Combines all visualization layers
- Most comprehensive data representation
- Optimal for identifying patterns and correlations

### Data Metrics

1. **Soil Moisture (0.0 - 1.0)**
   - Measures water content in soil
   - Critical for agriculture and drought monitoring
   - High values indicate increased backscatter from dielectric properties

2. **Flood Inundation Index (0.0 - 1.0)**
   - Predicts flood likelihood
   - Essential for disaster response and urban planning
   - High values tied to low backscatter from water surfaces

3. **Vegetation Density (0.0 - 1.0)**
   - Quantifies vegetation cover
   - Tracks deforestation and crop health
   - HV polarization detects dense canopies

### Interactive Controls

- **Year Filter** (2019-2023): Toggle buttons for quick year selection
- **Metric Selector**: Switch between Soil Moisture, Flood Inundation, and Vegetation Density
- **Visualization Style**: 4 modes - 3D Mesh, Hexagonal, Ripple Rings, and Hybrid
- **High-Risk Zone Filter**: Threshold toggle to highlight critical areas (>0.7)
- **City Search**: Real-time search with autocomplete suggestions
- **CSV Export**: Download filtered data for external analysis

### Data Exploration

- **Interactive Globe**: Rotate, zoom, and pan with smooth controls
- **Auto-rotation**: Gentle automatic rotation for ambient display
- **Hover Tooltips**: Detailed information on hover with metric values and explanations
- **Click Modals**: Time-series charts showing 5-year trends for selected cities

## 🛠️ Technology Stack

- **React 19** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Three.js** - 3D rendering engine
- **react-globe.gl** - Globe visualization library
- **D3.js** - Data processing and color scales
- **Recharts** - Time-series charting
- **PapaParse** - CSV data parsing
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/the-GreyShadow/sar-earth-visualizer.git

# Navigate to directory
cd sar-earth-visualizer

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🎨 Visualization Details

### Mesh Geometries

Each metric uses a distinct 3D geometry to aid visual recognition:

- **Soil Moisture**: Inverted cone geometry representing water penetration into soil layers
- **Flood Inundation**: Hexagonal cylinders with pulsing animation for high-risk areas
- **Vegetation Density**: Scaled octahedrons creating organic, blob-like shapes mimicking plant growth

### Material Properties

- **Emissive Lighting**: Self-illumination scaled by metric value (0-50% intensity)
- **Transparency**: Opacity increases with data intensity (70-100%)
- **Specular Highlights**: Glossy reflections for depth perception
- **Color Gradients**: Scientific color scales from D3.js (YlGnBu, YlOrRd, Greens)

### Animation Effects

- **Pulsing High-Risk Zones**: Flood areas with values >0.7 pulse at 3-second intervals
- **Expanding Rings**: Propagation speed scales with metric value (1-3 units/second)
- **Smooth Transitions**: 1000ms transitions when switching metrics or modes
- **Auto-rotation**: 0.2 degrees/second globe rotation

### Performance Optimizations

- Efficient mesh instancing for 500+ cities
- Conditional layer rendering based on visualization mode
- React.memo and useMemo for prevented unnecessary re-renders
- Three.js object pooling and geometry reuse

## 📊 Data Schema

```csv
City,Latitude,Longitude,date,Soil_Moisture,Flood_Inundation_Index,Vegetation_Density
Tokyo,35.6897,139.6922,2019-07-15,0.68,0.12,0.42
Delhi,28.7041,77.1025,2019-07-15,0.82,0.48,0.60
Shanghai,31.2304,121.4737,2019-07-15,0.78,0.38,0.55
...
```

**Dataset Specifications:**
- **500 cities** worldwide
- **5 years** of daily data (2019-2023)
- **~913,125 total records**
- All metric values normalized to 0.0-1.0 range

## 🌐 SAR Technology Background

Synthetic Aperture Radar (SAR) uses radar pulses to reveal Earth's surface properties:

- **All-Weather Imaging**: Penetrates clouds and operates day/night
- **Surface Roughness**: Detects texture and structural changes
- **Moisture Detection**: Sensitive to water content via dielectric properties
- **Polarization Modes**: HH, VV, HV, VH for different surface characteristics

**Simulated from NASA/ESA Instruments:**
- NASA NISAR (NASA-ISRO SAR)
- ESA Sentinel-1 A/B
- JAXA ALOS-2

## 🎮 Usage Guide

### Basic Navigation
1. **Rotate Globe**: Click and drag
2. **Zoom**: Mouse wheel or pinch gesture
3. **Pan**: Right-click and drag (desktop)

### Exploring Data
1. Select a year (2019-2023) from the sidebar
2. Choose a metric (Soil Moisture, Flood Inundation, or Vegetation Density)
3. Pick a visualization style (Mesh, Hexbin, Rings, or Hybrid)
4. Hover over cities for instant data tooltips
5. Click cities to view 5-year trend charts
6. Enable "High Risk Zones" to filter critical areas

### Exporting Data
1. Apply desired filters (year, metric, high-risk, search)
2. Click "Download Filtered Data" button
3. Receive CSV file with filtered dataset

## 🔧 Project Structure

```
sar-earth-visualizer/
├── components/
│   ├── GlobeComponent.tsx    # Main 3D globe with mesh visualizations
│   ├── Sidebar.tsx            # Control panel with filters
│   ├── CityModal.tsx          # Time-series chart modal
│   └── Legend.tsx             # Color scale legend
├── hooks/
│   └── useSarData.ts          # Data loading and processing
├── services/
│   └── data.ts                # CSV data (500 cities, 5 years)
├── constants.ts               # Metrics configuration
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # Main application component
└── index.tsx                  # React entry point
```

## 🎯 Future Enhancements

- [ ] Compare Dates mode with side-by-side globes
- [ ] Animation timeline for temporal progression
- [ ] Heatmap interpolation layer between cities
- [ ] Regional continent filtering
- [ ] Mobile-optimized touch controls
- [ ] WebGL2 shader effects for atmospheric glow
- [ ] Real SAR data integration via NASA API
- [ ] AR/VR mode for immersive exploration

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **NASA Space Apps Challenge 2025** - Inspiration and challenge framework
- **ESA Sentinel-1 Mission** - SAR technology reference
- **NASA NISAR Project** - Environmental monitoring insights
- **Three.js & Globe.gl communities** - Excellent 3D visualization tools

## 📞 Contact

Project by: [the-GreyShadow](https://github.com/the-GreyShadow)

Repository: [sar-earth-visualizer](https://github.com/the-GreyShadow/sar-earth-visualizer)

---

**Built with ❤️ for Earth observation and environmental monitoring**

*"Through the Radar Looking Glass: Revealing Earth Processes with SAR"*
