'use client';

import { useEffect, useRef, useState } from 'react';
import type { TourConfig, SceneConfig, HotspotConfig } from '@/types/tour';

declare global {
  interface Window {
    pannellum: any;
  }
}

interface PanoramaViewerProps {
  config: TourConfig;
  locale?: 'uz' | 'ru';
  className?: string;
}

export default function PanoramaViewer({ config, locale = 'uz', className = '' }: PanoramaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState<string>(config.default.firstScene);

  useEffect(() => {
    // Load Pannellum CSS and JS
    const loadPannellum = async () => {
      // Check if already loaded
      if (window.pannellum) {
        initializeViewer();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.async = true;
      script.onload = () => {
        initializeViewer();
      };
      script.onerror = () => {
        setError('Pannellum kutubxonasini yuklashda xatolik yuz berdi');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initializeViewer = () => {
      if (!viewerRef.current || !window.pannellum) return;

      try {
        const firstScene = config.scenes[config.default.firstScene];
        if (!firstScene) {
          setError(`Birinchi sahna topilmadi: ${config.default.firstScene}`);
          setIsLoading(false);
          return;
        }

        // Prepare viewer configuration with all scenes (Pannellum format)
        const viewerConfig: any = {
          default: {
            firstScene: config.default.firstScene,
            sceneFadeDuration: 1000,
          },
          scenes: {},
          autoRotate: config.autoRotate || 0,
          autoLoad: config.autoLoad !== false,
          showControls: config.showControls !== false,
          showFullscreenCtrl: config.showFullscreenCtrl !== false,
          showZoomCtrl: config.showZoomCtrl !== false,
          keyboardZoom: config.keyboardZoom !== false,
          mouseZoom: config.mouseZoom !== false,
          compass: config.compass || false,
          northOffset: config.northOffset || 0,
        };

        // Add all scenes to config
        Object.values(config.scenes).forEach((scene) => {
          viewerConfig.scenes[scene.id] = {
            type: scene.type || 'equirectangular',
            panorama: scene.panorama,
            hfov: scene.hfov ?? config.default.hfov ?? 100,
            pitch: scene.pitch ?? config.default.pitch ?? 0,
            yaw: scene.yaw ?? config.default.yaw ?? 0,
            hotSpots: prepareHotspots(scene.hotSpots || [], config.scenes),
          };
        });

        // Initialize viewer
        viewerInstanceRef.current = window.pannellum.viewer(viewerRef.current, viewerConfig);

        // Add event listeners
        viewerInstanceRef.current.on('load', () => {
          setIsLoading(false);
          setError(null);
        });

        viewerInstanceRef.current.on('error', (err: any) => {
          setError('Panorama rasmni yuklashda xatolik yuz berdi');
          setIsLoading(false);
        });

        viewerInstanceRef.current.on('scenechange', (sceneId: string) => {
          setCurrentScene(sceneId);
        });
      } catch (err) {
        console.error('Viewer initialization error:', err);
        setError('Viewer\'ni ishga tushirishda xatolik yuz berdi');
        setIsLoading(false);
      }
    };

    loadPannellum();

    // Cleanup
    return () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (err) {
          console.error('Viewer cleanup error:', err);
        }
      }
    };
  }, []);

  // Prepare hotspots for Pannellum format
  const prepareHotspots = (hotspots: HotspotConfig[], scenes: Record<string, SceneConfig>) => {
    return hotspots.map((hotspot) => {
      const prepared: any = {
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        text: hotspot.text,
        cssClass: hotspot.cssClass || 'custom-hotspot',
      };

      if (hotspot.type === 'scene' && hotspot.sceneId) {
        // Verify scene exists
        if (!scenes[hotspot.sceneId]) {
          console.warn(`Scene not found: ${hotspot.sceneId}`);
          return null;
        }
        prepared.type = 'scene';
        prepared.sceneId = hotspot.sceneId;
        // Add transition configuration
        const targetScene = scenes[hotspot.sceneId];
        prepared.targetPitch = targetScene.pitch ?? 0;
        prepared.targetYaw = targetScene.yaw ?? 0;
        prepared.targetHfov = targetScene.hfov ?? 100;
      } else if (hotspot.type === 'info') {
        prepared.type = 'info';
        prepared.createTooltipFunc = (hotspotDiv: HTMLElement) => {
          const tooltip = document.createElement('div');
          tooltip.className = 'pannellum-tooltip';
          tooltip.innerHTML = `
            <div class="tooltip-content">
              <h3>${hotspot.text}</h3>
              ${hotspot.description ? `<p>${hotspot.description}</p>` : ''}
            </div>
          `;
          hotspotDiv.appendChild(tooltip);
        };
        prepared.clickHandlerFunc = () => {
          // Show info modal or alert
          if (hotspot.description) {
            alert(`${hotspot.text}\n\n${hotspot.description}`);
          } else {
            alert(hotspot.text);
          }
        };
      }

      return prepared;
    }).filter(Boolean);
  };

  // Load scene programmatically
  const loadScene = (sceneId: string) => {
    if (!viewerInstanceRef.current) return;

    const scene = config.scenes[sceneId];
    if (!scene) {
      console.error(`Scene not found: ${sceneId}`);
      return;
    }

    try {
      setIsLoading(true);
      // Use Pannellum's loadScene method
      viewerInstanceRef.current.loadScene(
        sceneId,
        scene.panorama,
        scene.type || 'equirectangular',
        scene.hfov ?? config.default.hfov ?? 100,
        scene.pitch ?? 0,
        scene.yaw ?? 0
      );
      setCurrentScene(sceneId);
    } catch (err) {
      console.error('Error loading scene:', err);
      setError('Sahna yuklashda xatolik yuz berdi');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`flex h-full min-h-[400px] items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-accent"
          >
            Qayta yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-2"></div>
            <p className="text-sm text-gray-600">Yuklanmoqda...</p>
          </div>
        </div>
      )}

      {/* Viewer container */}
      <div
        ref={viewerRef}
        className="w-full"
        style={{ minHeight: '400px', height: '100vh' }}
      />

      {/* Scene navigation (optional) */}
      {Object.keys(config.scenes).length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 rounded-lg p-2 shadow-lg">
          <div className="flex gap-2">
            {Object.values(config.scenes)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => loadScene(scene.id)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentScene === scene.id
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {scene.title?.[locale] || scene.id}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

