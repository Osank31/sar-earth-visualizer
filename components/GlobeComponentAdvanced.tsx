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
    <div style="background: linear-gradient(180deg,#0b1220,#111827); color: #fff; padding: 1rem; border-radius: 1rem; box-shadow: 0 20px 60px rgba(2,6,23,0.7); border: 2px solid rgba(59,130,246,0.2); backdrop-filter: blur(6px); max-width: 22rem;">
      <div style="font-weight: 700; font-size: 1.25rem; margin-bottom: 0.5rem; background: linear-gradient(90deg,#60a5fa,#22d3ee); -webkit-background-clip: text; background-clip: text; color: transparent;">
        ${(d as SarData).City}
      </div>
      <div style="font-size: 0.875rem; margin-bottom: 0.5rem; display:flex; align-items:center; gap:0.5rem;">
        <span style="color: #9ca3af">${METRICS[selectedMetric].name}:</span>
        <span style="color: #fbbf24; font-weight: 700; font-size: 1.125rem">${((d as SarData)[selectedMetric] as number).toFixed(3)}</span>
      </div>
      <div style="width:100%; background: #374151; border-radius: 9999px; height: 0.5rem; margin-bottom: 0.5rem; overflow: hidden;">
        <div style="background: linear-gradient(90deg,#3b82f6,#06b6d4); height:100%; border-radius:9999px; width: ${((d as SarData)[selectedMetric] as number) * 100}%"></div>
      </div>
      <div style="font-size: 0.75rem; color:#cbd5e1; font-style: italic; margin-top:0.5rem; max-width:18rem">
        ${METRICS[selectedMetric].tooltip}
      </div>
    </div>
`;

  const showMesh = visualizationMode === 'mesh' || visualizationMode === 'hybrid';
  const showRings = visualizationMode === 'rings' || visualizationMode === 'hybrid';
  const showHexbin = visualizationMode === 'hexbin' || visualizationMode === 'hybrid';

  if (pointsData.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <div style={{ color: '#fff', fontSize: '1.25rem' }}>Loading environmental data...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
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
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(34,197,94,0.2)',
            border: '1px solid rgba(74,222,128,0.5)',
            color: '#86efac',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              backgroundColor: '#4ade80',
              borderRadius: '9999px'
            }}
          />
          ✨ Advanced Shaders Active
        </div>
      )}
      
      {/* Depth Map Controls - Moved to LEFT side */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 50
        }}
      >
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            backgroundColor: 'rgba(37,99,235,0.8)',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(96,165,250,0.5)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {showControls ? '🎛️ Hide Controls' : '🎛️ Show Controls'}
        </button>
        
        {showControls && (
          <div
            style={{
              backgroundColor: 'rgba(17,24,39,0.9)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(55,65,81,0.5)',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              minWidth: '280px'
            }}
          >
            <div
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: '1px solid #374151',
                paddingBottom: '0.5rem'
              }}
            >
              <span style={{ color: '#60a5fa' }}>🌊</span>
              Depth Map Controls
            </div>
            
            {/* Enable/Disable Depth Overlay */}
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #374151' }}>
              <button
                onClick={() => setDepthOverlayEnabled(!depthOverlayEnabled)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: depthOverlayEnabled ? '#fff' : '#d1d5db',
                  background: depthOverlayEnabled
                    ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                    : 'linear-gradient(90deg,#374151,#4b5563)'
                }}
              >
                {depthOverlayEnabled ? '✅ Depth Overlay ON' : '⭕ Depth Overlay OFF'}
              </button>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'center' }}>
                {depthOverlayEnabled ? 'Showing 3D depth map' : 'Basic globe only'}
              </p>
            </div>
            
            {/* Opacity Slider */}
            <div style={{ marginBottom: '1rem', opacity: depthOverlayEnabled ? 1 : 0.5, pointerEvents: depthOverlayEnabled ? 'auto' as const : 'none' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: '#d1d5db', fontSize: '0.75rem', fontWeight: 600 }}>Overlay Opacity</label>
                <span style={{ color: '#60a5fa', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', backgroundColor: 'rgba(23,37,84,0.5)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
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
                style={{ width: '100%', height: '0.5rem', backgroundColor: '#374151', borderRadius: '0.5rem', appearance: 'none' as any, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                <span>Invisible</span>
                <span>Opaque</span>
              </div>
            </div>
            
            {/* Displacement Strength Slider */}
            <div style={{ marginBottom: '1rem', opacity: depthOverlayEnabled ? 1 : 0.5, pointerEvents: depthOverlayEnabled ? 'auto' as const : 'none' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: '#d1d5db', fontSize: '0.75rem', fontWeight: 600 }}>Depth Strength</label>
                <span style={{ color: '#4ade80', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', backgroundColor: 'rgba(5,46,22,0.5)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
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
                style={{ width: '100%', height: '0.5rem', backgroundColor: '#374151', borderRadius: '0.5rem', appearance: 'none' as any, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                <span>Flat</span>
                <span>Extreme</span>
              </div>
            </div>
            
            {/* Pulse Speed Slider */}
            <div style={{ marginBottom: '1rem', opacity: depthOverlayEnabled ? 1 : 0.5, pointerEvents: depthOverlayEnabled ? 'auto' as const : 'none' as const }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: '#d1d5db', fontSize: '0.75rem', fontWeight: 600 }}>Pulse Speed</label>
                <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', backgroundColor: 'rgba(46,16,101,0.5)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
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
                style={{ width: '100%', height: '0.5rem', backgroundColor: '#374151', borderRadius: '0.5rem', appearance: 'none' as any, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
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
              style={{
                width: '100%',
                background: 'linear-gradient(90deg,#374151,#4b5563)',
                color: '#fff',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid rgba(107,114,128,0.5)'
              }}
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
