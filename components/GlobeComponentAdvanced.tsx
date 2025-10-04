import React, { useRef, useEffect, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { Metric, type SarData } from '../types';
import { getMetrics } from '../constants';

interface GlobePoint extends SarData {
  size: number;
  color: string;
}

interface GlobeComponentProps {
  pointsData: GlobePoint[];
  onPointClick: (point: SarData) => void;
  selectedMetric: Metric;
  visualizationMode?: 'mesh' | 'hexbin' | 'rings' | 'hybrid';
}

const GlobeComponentAdvanced: React.FC<GlobeComponentProps> = ({ 
  pointsData, 
  onPointClick, 
  selectedMetric,
  visualizationMode = 'hybrid'
}) => {
  const globeEl = useRef<any>(null);
  const METRICS = getMetrics();
  const [globeReady, setGlobeReady] = useState(false);
  const canvasTextureRef = useRef<HTMLCanvasElement | null>(null);
  const dynamicTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const overlayMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const overlayMeshRef = useRef<THREE.Mesh | null>(null);
  const initializationAttempted = useRef(false);
  
  // Opacity and effect controls
  const [depthOpacity, setDepthOpacity] = useState(0.6);
  const [displacementStrength, setDisplacementStrength] = useState(2.0);
  const [pulseSpeed, setPulseSpeed] = useState(2.0);
  const [showControls, setShowControls] = useState(true);
  const [depthOverlayEnabled, setDepthOverlayEnabled] = useState(false); // Start with OFF for stability

  // Create dynamic canvas texture for data baking
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    canvasTextureRef.current = canvas;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    dynamicTextureRef.current = texture;
    
    return () => {
      texture.dispose();
    };
  }, []);

  // Bake data into texture (optimized to prevent hanging)
  useEffect(() => {
    if (!canvasTextureRef.current || pointsData.length === 0) return;
    
    // Use requestAnimationFrame to avoid blocking the main thread
    const updateTexture = () => {
      const canvas = canvasTextureRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear with fully transparent (data will be overlaid on globe texture)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const metricConfig = METRICS[selectedMetric];
      
      // Draw each data point as a radial gradient
      pointsData.forEach(point => {
        const value = point[selectedMetric] as number;
      
      // Convert lat/lng to canvas coordinates
      const x = ((point.Longitude + 180) / 360) * canvas.width;
      const y = ((90 - point.Latitude) / 180) * canvas.height;
      
      // Influence radius based on value
      const radius = 20 + value * 80;
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const color = new THREE.Color(metricConfig.colorScale(value));
      
      gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${value})`);
      gradient.addColorStop(0.5, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${value * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });

      // Add blur effect for smooth blending
      ctx.filter = 'blur(4px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      if (dynamicTextureRef.current) {
        dynamicTextureRef.current.needsUpdate = true;
      }
    };
    
    // Use setTimeout to avoid blocking
    const timeoutId = setTimeout(updateTexture, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pointsData, selectedMetric, METRICS]);

  // Update shader uniforms when controls change
  useEffect(() => {
    if (overlayMaterialRef.current) {
      overlayMaterialRef.current.uniforms.opacity.value = depthOverlayEnabled ? depthOpacity : 0;
      overlayMaterialRef.current.uniforms.displacementScale.value = displacementStrength;
      overlayMaterialRef.current.uniforms.pulseSpeed.value = pulseSpeed;
    }
    if (overlayMeshRef.current) {
      overlayMeshRef.current.visible = depthOverlayEnabled;
    }
  }, [depthOpacity, displacementStrength, pulseSpeed, depthOverlayEnabled]);

  // Shader animation loop (separate from globe controls)
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      if (overlayMaterialRef.current) {
        overlayMaterialRef.current.uniforms.time.value += 0.01;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    if (globeReady) {
      animate();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [globeReady]);

  useEffect(() => {
    if (globeEl.current && !initializationAttempted.current) {
      initializationAttempted.current = true;
      
      try {
        const controls = globeEl.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.3;
          controls.enableZoom = true;
        }
        globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2000);
      } catch (error) {
        console.error('Globe initialization error:', error);
      }
    }
  }, []);

  // Separate effect for overlay creation
  useEffect(() => {
    if (!globeEl.current || !dynamicTextureRef.current || !depthOverlayEnabled) return;
    
    // Wait for globe to be fully ready
    const addOverlay = () => {
      if (!globeEl.current) return;
      
      try {
        const globe = globeEl.current;
        const scene = globe.scene();
        if (!scene) return;
        
        let overlayAdded = false;
        
        // Find the globe mesh
        scene.traverse((object: any) => {
          if (overlayAdded) return; // Only add once
          
          if (object.type === 'Mesh' && object.geometry.type === 'SphereGeometry') {
            // Check if overlay already exists
            if (object.userData.depthOverlayAdded) {
              overlayAdded = true;
              return;
            }
            
            // Keep original material intact!
            // Add a transparent overlay sphere with depth mapping
            
            if (dynamicTextureRef.current) {
              try {
              const overlayGeometry = new THREE.SphereGeometry(101, 64, 64); // Slightly larger than globe (100)
              
              const overlayMaterial = new THREE.ShaderMaterial({
                uniforms: {
                  dataTexture: { value: dynamicTextureRef.current },
                  time: { value: 0 },
                  opacity: { value: depthOpacity },
                  displacementScale: { value: displacementStrength },
                  pulseSpeed: { value: pulseSpeed }
                },
                transparent: true,
                depthWrite: false,
                depthTest: true,
                side: THREE.FrontSide,
                vertexShader: `
                  varying vec2 vUv;
                  varying vec3 vNormal;
                  
                  uniform sampler2D dataTexture;
                  uniform float displacementScale;
                  
                  void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    
                    // Sample data texture for displacement
                    vec4 dataColor = texture2D(dataTexture, uv);
                    float displacement = dataColor.a * displacementScale;
                    
                    vec3 newPosition = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                  }
                `,
                fragmentShader: `
                  uniform sampler2D dataTexture;
                  uniform float time;
                  uniform float opacity;
                  uniform float pulseSpeed;
                  
                  varying vec2 vUv;
                  varying vec3 vNormal;
                  
                  void main() {
                    // Data overlay texture
                    vec4 dataColor = texture2D(dataTexture, vUv);
                    
                    // Only show where data exists
                    if (dataColor.a < 0.1) {
                      discard; // Transparent where no data
                    }
                    
                    // Add pulsing to high values
                    float pulse = sin(time * pulseSpeed) * 0.15 + 0.85;
                    vec3 color = dataColor.rgb * pulse;
                    
                    // Rim glow for depth perception
                    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
                    rim = pow(rim, 2.0);
                    color += dataColor.rgb * rim * 0.3;
                    
                    gl_FragColor = vec4(color, dataColor.a * opacity);
                  }
                `
              });
              
              const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
              overlayMesh.visible = depthOverlayEnabled;
              object.add(overlayMesh);
              object.userData.depthOverlayAdded = true;
              overlayAdded = true;
              
              // Store references for dynamic updates
              overlayMaterialRef.current = overlayMaterial;
              overlayMeshRef.current = overlayMesh;
              
              console.log('Depth overlay added successfully');
              setGlobeReady(true);
              } catch (overlayError) {
                console.error('Error creating overlay:', overlayError);
              }
            }
          }
        });
      } catch (error) {
        console.error('Scene traversal error:', error);
      }
    };
    
    // Delay to ensure globe is fully initialized
    const timeoutId = setTimeout(addOverlay, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [depthOpacity, displacementStrength, pulseSpeed, depthOverlayEnabled]);

  // Create custom 3D object with depth
  const getCustomObject = (d: any) => {
    const value = d[selectedMetric] as number;
    const baseSize = 0.4 + value * 2.0;
    const height = 0.8 + value * 4;
    
    let geometry;
    const color = new THREE.Color(d.color);
    
    switch (selectedMetric) {
      case Metric.SoilMoisture:
        geometry = new THREE.ConeGeometry(baseSize, height, 8, 3);
        break;
      case Metric.FloodInundation:
        geometry = new THREE.CylinderGeometry(baseSize, baseSize * 0.9, height, 6, 3);
        break;
      case Metric.VegetationDensity:
        const octGeometry = new THREE.OctahedronGeometry(baseSize, 3);
        octGeometry.scale(1, height / baseSize, 1);
        geometry = octGeometry;
        break;
      default:
        geometry = new THREE.CylinderGeometry(baseSize, baseSize, height, 6);
    }

    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: value * 0.8,
      transparent: true,
      opacity: 0.75 + value * 0.25,
      shininess: 120,
      specular: new THREE.Color(0xffffff),
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    // Add inner glow
    const glowGeometry = geometry.clone();
    glowGeometry.scale(1.1, 1.05, 1.1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: value * 0.3,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glowMesh);
    
    if (value > 0.7 && selectedMetric === Metric.FloodInundation) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
      mesh.scale.set(scale, 1, scale);
    }

    return mesh;
  };

  const customLayerData = useMemo(() => {
    return pointsData.map(point => ({
      ...point,
      altitude: 0.02 + (point[selectedMetric] as number) * 0.12,
    }));
  }, [pointsData, selectedMetric]);

  const ringsData = useMemo(() => {
    return pointsData
      .filter(p => (p[selectedMetric] as number) > 0.5)
      .map(point => ({
        ...point,
        maxR: 3 + (point[selectedMetric] as number) * 8,
        propagationSpeed: 1.5 + (point[selectedMetric] as number) * 2.5,
        repeatPeriod: 1000 - (point[selectedMetric] as number) * 300,
      }));
  }, [pointsData, selectedMetric]);

  const hexBinData = useMemo(() => {
    return pointsData.map(point => ({
      ...point,
      weight: point[selectedMetric] as number,
    }));
  }, [pointsData, selectedMetric]);

  const customThreeObjectUpdate = (obj: any, d: any) => {
    const value = d[selectedMetric] as number;
    if (value > 0.7 && selectedMetric === Metric.FloodInundation) {
      const time = Date.now() * 0.003;
      const scale = 1 + Math.sin(time) * 0.2;
      obj.scale.set(scale, 1, scale);
      obj.rotation.y += 0.01;
    }
    Object.assign(obj.position, globeEl.current?.getCoords(d.Latitude, d.Longitude, d.altitude));
  };

  const customLayerLabel = (d: any) => `
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-2xl border-2 border-blue-500/50 backdrop-blur-md">
      <div class="font-bold text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
        ${(d as SarData).City}
      </div>
      <div class="text-sm mb-2 flex items-center gap-2">
        <span class="text-gray-400">${METRICS[selectedMetric].name}:</span> 
        <span class="text-yellow-300 font-bold text-lg">${((d as SarData)[selectedMetric] as number).toFixed(3)}</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div class="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style="width: ${((d as SarData)[selectedMetric] as number) * 100}%"></div>
      </div>
      <div class="text-xs text-gray-300 italic mt-2 max-w-xs">
        ${METRICS[selectedMetric].tooltip}
      </div>
    </div>
  `;

  const showMesh = visualizationMode === 'mesh' || visualizationMode === 'hybrid';
  const showRings = visualizationMode === 'rings' || visualizationMode === 'hybrid';
  const showHexbin = visualizationMode === 'hexbin' || visualizationMode === 'hybrid';

  if (pointsData.length === 0) {
    return (
      <div className="w-full h-full globe-container flex items-center justify-center">
        <div className="text-white text-xl">Loading environmental data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full globe-container relative">
      <Globe
        ref={globeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="rgba(100, 180, 255, 0.4)"
        atmosphereAltitude={0.2}
        
        customLayerData={showMesh ? customLayerData : []}
        customThreeObject={showMesh ? getCustomObject : undefined}
        customThreeObjectUpdate={showMesh ? customThreeObjectUpdate : undefined}
        onCustomLayerClick={showMesh ? onPointClick : undefined}
        customLayerLabel={showMesh ? customLayerLabel : undefined}
        
        ringsData={showRings ? ringsData : []}
        ringLat={showRings ? 'Latitude' : undefined}
        ringLng={showRings ? 'Longitude' : undefined}
        ringColor={showRings ? ((d: any) => {
          const color = new THREE.Color(d.color);
          return `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0.5)`;
        }) : undefined}
        ringMaxRadius={showRings ? 'maxR' : undefined}
        ringPropagationSpeed={showRings ? 'propagationSpeed' : undefined}
        ringRepeatPeriod={showRings ? 'repeatPeriod' : undefined}
        ringAltitude={showRings ? 0.01 : undefined}
        
        hexBinPointsData={showHexbin ? hexBinData : []}
        hexBinPointLat={showHexbin ? 'Latitude' : undefined}
        hexBinPointLng={showHexbin ? 'Longitude' : undefined}
        hexBinPointWeight={showHexbin ? 'weight' : undefined}
        hexBinResolution={showHexbin ? 3 : undefined}
        hexAltitude={showHexbin ? ((d: any) => d.sumWeight / d.points.length * 0.25) : undefined}
        hexTopColor={showHexbin ? ((d: any) => {
          const avgValue = d.sumWeight / d.points.length;
          return METRICS[selectedMetric].colorScale(avgValue);
        }) : undefined}
        hexSideColor={showHexbin ? ((d: any) => {
          const avgValue = d.sumWeight / d.points.length;
          const color = new THREE.Color(METRICS[selectedMetric].colorScale(avgValue));
          color.multiplyScalar(0.5);
          return `#${color.getHexString()}`;
        }) : undefined}
        hexBinMerge={showHexbin ? true : undefined}
        hexTransitionDuration={showHexbin ? 1000 : undefined}
      />
      
      {globeReady && (
        <div className="absolute top-4 right-4 bg-green-500/20 border border-green-400/50 text-green-300 px-3 py-1 rounded-full text-xs backdrop-blur-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          ✨ Advanced Shaders Active
        </div>
      )}
      
      {/* Depth Map Controls - Moved to LEFT side */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-50">
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-blue-600/80 hover:bg-blue-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-md border border-blue-400/50 shadow-lg transition-all duration-200 text-sm font-semibold"
        >
          {showControls ? '🎛️ Hide Controls' : '🎛️ Show Controls'}
        </button>
        
        {showControls && (
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-2xl min-w-[280px]">
            <div className="text-white font-bold text-sm mb-3 flex items-center gap-2 border-b border-gray-700 pb-2">
              <span className="text-blue-400">🌊</span>
              Depth Map Controls
            </div>
            
            {/* Enable/Disable Depth Overlay */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              <button
                onClick={() => setDepthOverlayEnabled(!depthOverlayEnabled)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  depthOverlayEnabled
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-300'
                }`}
              >
                {depthOverlayEnabled ? '✅ Depth Overlay ON' : '⭕ Depth Overlay OFF'}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {depthOverlayEnabled ? 'Showing 3D depth map' : 'Basic globe only'}
              </p>
            </div>
            
            {/* Opacity Slider */}
            <div className={`mb-4 ${!depthOverlayEnabled && 'opacity-50 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 text-xs font-semibold">Overlay Opacity</label>
                <span className="text-blue-400 text-xs font-mono bg-blue-950/50 px-2 py-1 rounded">
                  {(depthOpacity * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={depthOpacity}
                onChange={(e) => setDepthOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Invisible</span>
                <span>Opaque</span>
              </div>
            </div>
            
            {/* Displacement Strength Slider */}
            <div className={`mb-4 ${!depthOverlayEnabled && 'opacity-50 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 text-xs font-semibold">Depth Strength</label>
                <span className="text-green-400 text-xs font-mono bg-green-950/50 px-2 py-1 rounded">
                  {displacementStrength.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={displacementStrength}
                onChange={(e) => setDisplacementStrength(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Flat</span>
                <span>Extreme</span>
              </div>
            </div>
            
            {/* Pulse Speed Slider */}
            <div className={`mb-4 ${!depthOverlayEnabled && 'opacity-50 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 text-xs font-semibold">Pulse Speed</label>
                <span className="text-purple-400 text-xs font-mono bg-purple-950/50 px-2 py-1 rounded">
                  {pulseSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={pulseSpeed}
                onChange={(e) => setPulseSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Static</span>
                <span>Fast</span>
              </div>
            </div>
            
            {/* Reset Button */}
            <button
              onClick={() => {
                setDepthOpacity(0.6);
                setDisplacementStrength(2.0);
                setPulseSpeed(2.0);
              }}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border border-gray-500/50"
            >
              🔄 Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeComponentAdvanced;
