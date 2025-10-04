# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## Issue: Blank Screen / No Globe Visible

### Symptoms
- Page loads but shows only background
- No 3D globe renders
- Console may show errors

### Solutions

1. **Check Dependencies**
```bash
npm install
```

2. **Verify Dev Server is Running**
```bash
npm run dev
# Should show: Local: http://localhost:3000/
```

3. **Clear Browser Cache**
- Chrome: Ctrl+Shift+Delete → Clear cached images
- Or use incognito mode

4. **Check WebGL Support**
- Visit: https://get.webgl.org/
- If not supported, update browser or graphics drivers

5. **Verify Module Imports**
```typescript
// Check that all imports resolve (no red underlines)
import Globe from 'react-globe.gl';
import * as THREE from 'three';
```

---

## Issue: Performance / Low FPS

### Symptoms
- Globe rotation is choppy
- High CPU usage
- Browser tab freezes

### Solutions

1. **Switch to Simpler Mode**
```typescript
// In sidebar, select "3D Mesh" instead of "Hybrid"
visualizationMode = 'mesh'
```

2. **Disable Auto-Rotation**
```typescript
// In GlobeComponent.tsx, comment out:
// globeEl.current.controls().autoRotate = true;
```

3. **Reduce Data Points**
```typescript
// In App.tsx, limit filtered data:
const filteredData = useMemo(() => {
  return allData.slice(0, 100); // Show only 100 cities
}, [allData]);
```

4. **Close Other Browser Tabs**
- Three.js uses GPU acceleration
- Free up system resources

5. **Update Graphics Drivers**
- Ensure latest GPU drivers installed

---

## Issue: No Data / Cities Not Showing

### Symptoms
- Globe visible but no markers
- "Loading SAR Data..." stays indefinitely
- Empty charts when clicking

### Solutions

1. **Check Data File**
```bash
# Verify data.ts exists and has content
ls services/data.ts
```

2. **Inspect Console for Parsing Errors**
```javascript
// F12 → Console tab
// Look for PapaParse errors
```

3. **Verify Data Format**
```csv
// data.ts should export:
export const sarCsvData = `City,Latitude,Longitude,date,...`
```

4. **Check useSarData Hook**
```typescript
// In useSarData.ts, add debugging:
useEffect(() => {
  Papa.parse(sarCsvData, {
    complete: (results) => {
      console.log('Parsed data:', results.data.length, 'rows');
      setAllData(results.data);
    }
  });
}, []);
```

---

## Issue: Click Not Working / No Modal

### Symptoms
- Can't click cities to view charts
- Hover tooltips work but clicks don't

### Solutions

1. **Verify Click Handler**
```typescript
// In App.tsx:
const handlePointClick = useCallback((point: SarData) => {
  console.log('Clicked:', point.City); // Debug log
  setSelectedCity(citiesData[point.City] || null);
}, [citiesData]);
```

2. **Check Recharts Import**
```bash
# Ensure recharts installed:
npm install recharts
```

3. **Inspect Modal Render**
```typescript
// In CityModal.tsx, verify cityData prop:
if (!cityData) {
  console.log('No city data provided');
  return null;
}
```

---

## Issue: Visualization Mode Not Switching

### Symptoms
- Clicking mode buttons doesn't change view
- All modes look the same

### Solutions

1. **Check Conditional Rendering**
```typescript
// In GlobeComponent.tsx, verify spread operator syntax:
{...((visualizationMode === 'mesh') && { customLayerData })}
```

2. **Inspect State Updates**
```typescript
// In App.tsx, add logging:
const [visualizationMode, setVisualizationMode] = useState('hybrid');
console.log('Current mode:', visualizationMode);
```

3. **Force Re-render**
```typescript
// Add key prop to Globe:
<Globe key={visualizationMode} ... />
```

---

## Issue: Colors Not Showing Correctly

### Symptoms
- All cities same color
- Gradients not working
- Legend doesn't match

### Solutions

1. **Verify D3 Imports**
```bash
npm install d3-scale d3-scale-chromatic
```

2. **Check Color Scale Function**
```typescript
// In constants.ts:
import { scaleSequential } from 'd3-scale';
import { interpolateYlGnBu } from 'd3-scale-chromatic';

colorScale: scaleSequential(interpolateYlGnBu).domain([0, 1])
```

3. **Inspect Metric Values**
```typescript
// In App.tsx, verify data range:
console.log('Min:', Math.min(...filteredData.map(d => d.Soil_Moisture)));
console.log('Max:', Math.max(...filteredData.map(d => d.Soil_Moisture)));
```

---

## Issue: TypeScript Errors

### Symptoms
- Red squiggly lines in VSCode
- Build fails with type errors
- "Cannot find module" errors

### Solutions

1. **Install Type Definitions**
```bash
npm install --save-dev @types/react @types/react-dom @types/three @types/d3
```

2. **Check tsconfig.json**
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  }
}
```

3. **Add Type Assertions**
```typescript
// For any type issues:
const value = (d[selectedMetric] as number);
const sarData = (d as SarData);
```

---

## Issue: Build Fails

### Symptoms
- `npm run build` errors
- Production bundle doesn't work
- Deploy fails

### Solutions

1. **Clean Install**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

2. **Check for Unused Imports**
```bash
# VSCode: Organize Imports
# Shift+Alt+O (Windows)
# Shift+Option+O (Mac)
```

3. **Verify Environment**
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

4. **Check Build Output**
```bash
npm run build
# Look for specific error messages
```

---

## Issue: Mobile Not Working

### Symptoms
- Works on desktop but not mobile
- Touch controls don't respond
- Layout broken on small screens

### Solutions

1. **Test Responsive Layout**
```bash
# Chrome DevTools: F12 → Toggle Device Toolbar
# Test various screen sizes
```

2. **Verify Touch Events**
```typescript
// Globe.gl should handle touch automatically
// If not, add touch-action CSS:
.globe-container {
  touch-action: pan-x pan-y;
}
```

3. **Reduce Complexity**
```typescript
// On mobile, default to simpler mode:
const isMobile = window.innerWidth < 768;
const [visualizationMode, setVisualizationMode] = useState(
  isMobile ? 'mesh' : 'hybrid'
);
```

---

## Issue: High Memory Usage

### Symptoms
- Browser tab uses >500MB RAM
- System slows down
- "Out of memory" errors

### Solutions

1. **Limit Data Points**
```typescript
// Sample data instead of using all:
const sampledData = filteredData.filter((_, i) => i % 2 === 0);
```

2. **Dispose Three.js Objects**
```typescript
// Add cleanup in useEffect:
return () => {
  globeEl.current?.scene()?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
};
```

3. **Disable Unused Modes**
```typescript
// Comment out modes you don't need:
// hexBinPointsData={hexBinData}  // Disable hexbin
```

---

## Debug Checklist

Use this checklist to systematically debug issues:

- [ ] Check browser console for errors (F12)
- [ ] Verify all npm packages installed (`npm install`)
- [ ] Check dev server is running (`npm run dev`)
- [ ] Test in different browser (Chrome, Firefox, Safari)
- [ ] Clear browser cache
- [ ] Verify WebGL support (https://get.webgl.org/)
- [ ] Check network tab for failed resource loads
- [ ] Inspect React DevTools for component state
- [ ] Add console.log statements to trace data flow
- [ ] Try incognito/private mode (rules out extensions)

---

## Getting Help

If you're still stuck:

1. **Check GitHub Issues**
   - https://github.com/the-GreyShadow/sar-earth-visualizer/issues

2. **Review Documentation**
   - README-SAR.md
   - VISUALIZATION-GUIDE.md
   - ENHANCEMENT-SUMMARY.md

3. **Inspect Browser Console**
   - Copy full error message
   - Note: browser version, OS, steps to reproduce

4. **Minimal Reproduction**
   ```bash
   # Fresh clone and test:
   git clone <repo>
   cd sar-earth-visualizer
   npm install
   npm run dev
   ```

---

## Performance Benchmarks

### Expected Performance

| Device Type       | FPS  | Load Time | Memory  |
|-------------------|------|-----------|---------|
| High-end Desktop  | 60   | <1s       | 150MB   |
| Mid-range Laptop  | 45   | 1-2s      | 200MB   |
| Mobile (Recent)   | 30   | 2-3s      | 250MB   |
| Mobile (Older)    | 15   | 3-5s      | 300MB   |

### If Below Expected
1. Reduce visualization mode complexity
2. Limit data points shown
3. Disable auto-rotation
4. Close other apps/tabs
5. Update graphics drivers

---

**Still having issues? File a bug report with:**
- Browser and version
- Operating system
- Steps to reproduce
- Console error messages
- Screenshots if applicable
