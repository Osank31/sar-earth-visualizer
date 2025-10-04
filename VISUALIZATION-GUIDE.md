# 🎨 Visualization Mode Guide

## Overview

The SAR Earth Visualizer offers four distinct visualization modes, each providing unique insights into environmental data patterns.

---

## 🔷 3D Mesh Mode

**Best for:** Individual city analysis and detailed metric inspection

### Visual Characteristics

#### Soil Moisture
- **Geometry**: Cone (8 sides, inverted tip)
- **Size**: 0.3 - 1.8 units (scales with moisture level)
- **Height**: 0.5 - 3.5 units
- **Color**: Yellow → Light Blue → Dark Blue
- **Represents**: Water penetration depth into soil

#### Flood Inundation
- **Geometry**: Hexagonal Cylinder (6 sides)
- **Size**: 0.3 - 1.8 units
- **Height**: 0.5 - 3.5 units
- **Color**: Light Blue → Orange → Deep Red
- **Animation**: Pulsing scale (15% variation) for values >0.7
- **Represents**: Flood risk zones with attention-grabbing animation

#### Vegetation Density
- **Geometry**: Octahedron (8 faces, 2 subdivision levels)
- **Size**: 0.3 - 1.8 units (width)
- **Height**: Stretched to 0.5 - 3.5 units
- **Color**: Light Green → Medium Green → Dark Forest Green
- **Represents**: Organic vegetation canopy structure

### Material Properties
```javascript
- Opacity: 70% + (30% × value)
- Emissive Intensity: 0% - 50% (scaled by value)
- Specular: White highlights
- Shininess: 100
```

### When to Use
- Examining specific cities in detail
- Comparing individual data points
- Understanding metric-specific patterns
- Presentation and storytelling

---

## ⬡ Hexagonal Bin Mode

**Best for:** Regional analysis and pattern identification

### Visual Characteristics

- **Geometry**: Hexagonal tessellation of Earth's surface
- **Resolution**: 4 (configurable)
- **Aggregation**: Average of all cities within each hex
- **Height**: 0 - 0.15 units (based on average metric value)
- **Top Color**: Full saturation from metric color scale
- **Side Color**: 60% darker than top (depth effect)

### Data Processing
```javascript
Each hexagon contains:
- Average metric value
- Count of cities
- Geographic center point
- Altitude scaled by average
```

### Advantages
- **Reveals Regional Patterns**: Clusters of high/low values
- **Reduces Visual Clutter**: Aggregates dense city data
- **Continuous Coverage**: Fills gaps between cities
- **Easy Comparison**: Adjacent hexagons show gradients

### When to Use
- Identifying continental or regional trends
- Finding geographic clusters
- Presenting aggregate statistics
- Working with dense datasets

---

## ◎ Ripple Rings Mode

**Best for:** Influence zones and temporal dynamics

### Visual Characteristics

- **Shape**: Expanding circular rings
- **Trigger**: Only cities with values >0.5
- **Max Radius**: 2 - 8 units (scales with metric value)
- **Propagation Speed**: 1 - 3 units/second
- **Repeat Period**: 800 - 1200ms (faster for higher values)
- **Color**: Semi-transparent metric color (40% opacity)
- **Altitude**: 0.01 units (just above surface)

### Animation Formula
```javascript
Max Radius = 2 + (value × 6)
Speed = 1 + (value × 2)
Repeat = 1200 - (value × 400) ms
```

### Interpretation
- **Large, Fast Rings**: High metric values, significant impact
- **Small, Slow Rings**: Lower values, localized effect
- **Ring Overlap**: Multiple influence zones interacting
- **Ring Density**: Data concentration in region

### When to Use
- Visualizing environmental "impact zones"
- Understanding data propagation
- Creating dynamic, attention-grabbing displays
- Simulating temporal spread (floods, vegetation growth)

---

## ✨ Hybrid Mode (Recommended)

**Best for:** Comprehensive analysis combining all insights

### Layer Composition

```
┌─────────────────────────────┐
│   Ripple Rings (Base)       │ ← Influence zones
├─────────────────────────────┤
│   Hexagonal Bins (Middle)   │ ← Regional aggregation
├─────────────────────────────┤
│   3D Meshes (Top)           │ ← Individual cities
└─────────────────────────────┘
```

### Visual Hierarchy

1. **Rings** (Bottom Layer)
   - Faint, transparent
   - Provide context and movement
   - Show environmental spread

2. **Hexagons** (Middle Layer)
   - Regional color-coding
   - Smooth elevation changes
   - Connect individual points

3. **Meshes** (Top Layer)
   - Stand out above other layers
   - Interactive click targets
   - Detailed tooltips

### Advantages of Hybrid Mode

✅ **Multi-scale Analysis**: Zoom out for regions, zoom in for cities
✅ **Pattern Recognition**: Rings show spread, hexes show clusters, meshes show specifics
✅ **Visual Richness**: Most engaging and informative view
✅ **Balanced Performance**: Optimized rendering of all layers

### Performance Note
Hybrid mode renders ~3x more objects but uses smart culling:
- Rings only for values >0.5
- Hexagons merge nearby points
- Meshes use instanced rendering

---

## 🎮 Mode Switching

### Quick Comparison Table

| Mode     | Best For              | Visual Focus       | Performance | Interactivity |
|----------|-----------------------|--------------------|-------------|---------------|
| Mesh     | Individual cities     | Vertical structures| ⚡⚡⚡       | ⭐⭐⭐⭐⭐    |
| Hexbin   | Regional patterns     | Surface coverage   | ⚡⚡⚡⚡     | ⭐⭐⭐        |
| Rings    | Influence zones       | Dynamic motion     | ⚡⚡         | ⭐⭐          |
| Hybrid   | Comprehensive view    | Layered depth      | ⚡⚡⚡       | ⭐⭐⭐⭐      |

### Transition Effects

Switching modes triggers smooth 1000ms transitions:
- Fade in/out of layers
- Geometry morphing
- Color interpolation
- Position adjustments

---

## 💡 Pro Tips

### For Presentations
1. Start with **Hybrid** for full impact
2. Switch to **Mesh** to highlight specific cities
3. Use **Rings** for dramatic effect on high-risk zones
4. End with **Hexbin** for big-picture summary

### For Analysis
1. **Hexbin** first - identify broad patterns
2. **Hybrid** second - explore interesting regions
3. **Mesh** third - examine specific anomalies
4. **Rings** occasionally - verify influence overlap

### Performance Optimization
- Use **Mesh** on mobile devices
- Use **Hexbin** for slow connections
- **Hybrid** for desktop presentations
- Disable auto-rotation during analysis

---

## 🎯 Metric-Specific Recommendations

### Soil Moisture
- **Primary**: Hexbin (shows agricultural regions)
- **Secondary**: Mesh (soil depth visualization)
- Rings less useful (moisture doesn't "spread")

### Flood Inundation
- **Primary**: Hybrid (combines risk + spread)
- **Secondary**: Rings (shows flood propagation)
- Mesh pulsing draws attention to danger zones

### Vegetation Density
- **Primary**: Mesh (organic shapes match vegetation)
- **Secondary**: Hexbin (shows forest regions)
- Rings moderate (deforestation spread)

---

**Experiment with all modes to find what works best for your analysis!**
