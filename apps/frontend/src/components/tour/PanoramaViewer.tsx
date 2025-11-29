'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const arrowsOverlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState<string>(config.default.firstScene);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hotspotModal, setHotspotModal] = useState<{ text: string; description?: string } | null>(null);
  const [currentHotspots, setCurrentHotspots] = useState<HotspotConfig[]>([]);
  const [hoveredHotspotIndex, setHoveredHotspotIndex] = useState<number | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const hoverTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const originalPositionRef = useRef<Map<number, { pitch: number; yaw: number }>>(new Map());
  const initializationAttemptedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentSceneRef = useRef<string>(config.default.firstScene);
  const panoloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panoloadFiredRef = useRef(false);
  const retryCountRef = useRef(0);
  const arrowUpdateRafRef = useRef<number | null>(null);

  // Helper function to normalize panorama URLs
  const normalizePanoramaUrl = useCallback((url: string | undefined): string => {
    if (!url) {
      return '';
    }
    
    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
                    (typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':3001') : 'http://localhost:3001');
    
    // If starts with /uploads/, prepend API base URL
    if (url.startsWith('/uploads/')) {
      return `${baseUrl}${url}`;
    }
    // If relative path, prepend API base URL
    else if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    // If no leading slash, assume it's relative to uploads
    else {
      return `${baseUrl}/uploads/${url}`;
    }
  }, []);

  // Preload all panorama images for faster loading
  useEffect(() => {
    if (!config || !config.scenes) return;
    
    const preloadImages = () => {
      Object.values(config.scenes).forEach((scene) => {
        if (scene.panorama) {
          const img = new Image();
          img.src = normalizePanoramaUrl(scene.panorama);
          // Browser cache'ga yuklash uchun
          img.loading = 'eager';
        }
      });
    };
    
    // Preload images after a short delay to not block initial render
    const timeout = setTimeout(preloadImages, 100);
    return () => clearTimeout(timeout);
  }, [config, normalizePanoramaUrl]);

  // Prepare hotspots for Pannellum
  const prepareHotspots = useCallback((hotspots: HotspotConfig[], scenes: Record<string, SceneConfig>, setModal: (modal: { text: string; description?: string } | null) => void) => {
    if (!hotspots || hotspots.length === 0) {
      return [];
    }

    return hotspots.map((hotspot) => {
      let pitch = Number(hotspot.pitch);
      let yaw = Number(hotspot.yaw);
      
      // Validate coordinates
      if (isNaN(pitch) || isNaN(yaw)) {
        console.warn('Invalid hotspot coordinates:', hotspot);
        return null;
      }
      
      // Koordinatalarni to'g'rilash - Pannellum'da pitch va yaw to'g'ri ishlashi uchun
      // Pitch: -90 (past) dan +90 (yuqori) gacha
      // Yaw: -180 (chap) dan +180 (o'ng) gacha
      pitch = Math.max(-90, Math.min(90, pitch));
      yaw = Math.max(-180, Math.min(180, yaw));
      
      console.log('📍 Hotspot coordinates:', {
        original: { pitch: hotspot.pitch, yaw: hotspot.yaw },
        normalized: { pitch, yaw },
        text: hotspot.text
      });

      const prepared: any = {
        pitch: pitch,
        yaw: yaw,
        text: hotspot.text || '',
        cssClass: hotspot.cssClass || 'custom-hotspot',
        // Hotspot'ning o'zini stabil qilish uchun
        createTooltipFunc: undefined, // Bu keyinroq o'rnatiladi
      };

      if (hotspot.type === 'scene' && hotspot.sceneId) {
        // Verify scene exists
        if (!scenes[hotspot.sceneId]) {
          console.warn(`Scene not found: ${hotspot.sceneId}`);
          return null;
        }
        prepared.type = 'scene';
        prepared.sceneId = hotspot.sceneId;
        // Add transition configuration for smooth scene change
        const targetScene = scenes[hotspot.sceneId];
        if (targetScene.pitch !== undefined) {
          prepared.targetPitch = targetScene.pitch;
        }
        if (targetScene.yaw !== undefined) {
          prepared.targetYaw = targetScene.yaw;
        }
        if (targetScene.hfov !== undefined) {
          prepared.targetHfov = targetScene.hfov;
        }
      } else {
        // Info type hotspot
        prepared.type = 'info';
        prepared.text = hotspot.text || '';
        
        // Click handler - Pannellum'da clickHandlerFunc ishlatiladi
        // Closure'da hotspot ma'lumotlarini saqlash
        const hotspotText = hotspot.text || '';
        const hotspotDescription = hotspot.description || '';
        
        prepared.clickHandlerFunc = (hotspotDiv: HTMLElement, args: any) => {
          console.log('🔥 Hotspot clicked (clickHandlerFunc):', hotspotText, args);
          // Click qilinganda modal ko'rsatish
          setModal({
            text: hotspotText,
            description: hotspotDescription || undefined,
          });
          // Event'ni to'xtatish
          if (args && args.event) {
            args.event.stopPropagation();
            args.event.preventDefault();
          }
          return false; // Pannellum'ga event'ni to'xtatishni bildirish
        };
        
        // Hotspot'ning o'zini stabil qilish uchun - CSS va event handling
        prepared.createTooltipFunc = (hotspotDiv: HTMLElement, args: any) => {
          // Hotspot div'ni to'g'ri konfiguratsiya qilish - stabil qilish uchun
          hotspotDiv.style.pointerEvents = 'auto';
          hotspotDiv.style.cursor = 'pointer';
          hotspotDiv.style.userSelect = 'none';
          hotspotDiv.style.touchAction = 'manipulation';
          hotspotDiv.style.position = 'absolute';
          hotspotDiv.style.zIndex = '10';
          // Transform'ni to'liq to'xtatish - Pannellum'ning o'z transform'ini override qilish
          hotspotDiv.style.transform = 'none';
          hotspotDiv.style.willChange = 'auto';
          hotspotDiv.style.backfaceVisibility = 'hidden';
          hotspotDiv.style.perspective = '1000px';
          
          // Panorama'ni drag qilishni to'xtatish - barcha event'lar uchun
          const stopPanoramaDrag = (e: Event) => {
            e.stopPropagation();
            e.preventDefault();
          };
          
          hotspotDiv.addEventListener('mousedown', stopPanoramaDrag, true);
          hotspotDiv.addEventListener('mousemove', stopPanoramaDrag, true);
          hotspotDiv.addEventListener('touchstart', stopPanoramaDrag, true);
          hotspotDiv.addEventListener('touchmove', stopPanoramaDrag, true);
        };
      }

      return prepared;
    }).filter((h): h is any => h !== null);
  }, []);

  // Clear panoload timeout
  const clearPanoloadTimeout = useCallback(() => {
    if (panoloadTimeoutRef.current) {
      clearTimeout(panoloadTimeoutRef.current);
      panoloadTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    console.log('🎬 PanoramaViewer mounted with config:', config);
    
    // Load Pannellum CSS and JS
    const loadPannellum = async () => {
      // Check if already loaded
      if (window.pannellum && viewerRef.current) {
        setTimeout(() => {
          initializeViewer();
        }, 100);
        return;
      }

      // Load CSS
      if (!document.querySelector('link[href*="pannellum.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(cssLink);
      }

      // Load JS
      if (!window.pannellum) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Pannellum JS loaded');
          setTimeout(() => {
            initializeViewer();
          }, 100);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Pannellum JS');
          setError('Pannellum kutubxonasini yuklashda xatolik yuz berdi');
          setIsLoading(false);
        };
        document.body.appendChild(script);
      } else {
        setTimeout(() => {
          initializeViewer();
        }, 100);
      }
    };

    const initializeViewer = () => {
      // Prevent multiple initialization attempts
      if (initializationAttemptedRef.current || !viewerRef.current || !window.pannellum) {
        console.log('⚠️ Skipping initialization:', {
          attempted: initializationAttemptedRef.current,
          hasRef: !!viewerRef.current,
          hasPannellum: !!window.pannellum
        });
        return;
      }

      // Ensure container has dimensions
      const container = viewerRef.current;
      if (!container) {
        console.log('⚠️ Container ref is null');
        return;
      }

      // Force container to have dimensions
      const parentElement = container.parentElement;
      let calculatedWidth = 800;
      let calculatedHeight = 400;
      
      if (parentElement) {
        const parentWidth = parentElement.offsetWidth || parentElement.clientWidth || 0;
        const parentHeight = parentElement.offsetHeight || parentElement.clientHeight || 0;
        
        // If parent has width, use it; otherwise use aspect ratio
        calculatedWidth = parentWidth > 0 ? parentWidth : 800;
        calculatedHeight = parentHeight > 0 ? parentHeight : Math.max(400, calculatedWidth / 2);
        
        console.log('📐 Container dimensions set:', { 
          calculatedWidth, 
          calculatedHeight,
          parentWidth,
          parentHeight
        });
      } else {
        // Fallback: use default dimensions
        calculatedWidth = 800;
        calculatedHeight = 400;
        console.log('📐 Container dimensions set (fallback):', { width: 800, height: 400 });
      }
      
      // Always set explicit dimensions
      container.style.width = calculatedWidth + 'px';
      container.style.height = calculatedHeight + 'px';
      container.style.minWidth = '400px';
      container.style.minHeight = '400px';
      container.style.display = 'block';
      container.style.visibility = 'visible';
      
      const containerWidth = container.offsetWidth || container.clientWidth || calculatedWidth;
      const containerHeight = container.offsetHeight || container.clientHeight || calculatedHeight;
      
      console.log('📐 Final container dimensions:', { containerWidth, containerHeight });
      
      // Use calculated dimensions even if offsetWidth is 0 (sometimes happens with CSS)
      const finalWidth = containerWidth > 0 ? containerWidth : calculatedWidth;
      const finalHeight = containerHeight > 0 ? containerHeight : calculatedHeight;
      
      initializationAttemptedRef.current = true;
      panoloadFiredRef.current = false;
      retryCountRef.current = 0;

      try {
        // Destroy existing viewer if any
        if (viewerInstanceRef.current) {
          try {
            viewerInstanceRef.current.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
          viewerInstanceRef.current = null;
        }

        if (!config || !config.scenes || Object.keys(config.scenes).length === 0) {
          console.error('❌ No scenes in config');
          setError('Tour konfiguratsiyasi topilmadi yoki sahnalar yo\'q');
          setIsLoading(false);
          return;
        }

        const firstScene = config.scenes[config.default?.firstScene];
        if (!firstScene) {
          console.error('❌ First scene not found:', config.default?.firstScene);
          setError(`Birinchi sahna topilmadi: ${config.default?.firstScene}`);
          setIsLoading(false);
          return;
        }

        console.log('🎯 First scene:', firstScene);

        // Prepare viewer configuration
        const viewerConfig: any = {
          default: {
            firstScene: config.default.firstScene,
            sceneFadeDuration: 400, // Tezroq transition (1000ms -> 400ms)
            hfov: config.default.hfov ?? 100,
            pitch: config.default.pitch ?? 0,
            yaw: config.default.yaw ?? 0,
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
          minHfov: 50,
          maxHfov: 120,
        };

        // Add all scenes to config
        Object.values(config.scenes).forEach((scene) => {
          const hotspots = prepareHotspots(scene.hotSpots || [], config.scenes, setHotspotModal);
          let normalizedPanoramaUrl = normalizePanoramaUrl(scene.panorama);
          
          // Rasm optimallashtirish - panorama URL'ga query parameter qo'shish
          // Backend'da rasm allaqachon optimallashtirilgan (4096px), lekin frontend'da ham kichikroq olish mumkin
          if (normalizedPanoramaUrl && normalizedPanoramaUrl.includes('/uploads/')) {
            // Agar URL'da query parameter bo'lmasa, qo'shish
            if (!normalizedPanoramaUrl.includes('?')) {
              // Thumbnail uchun kichikroq rasm olish (agar backend qo'llab-quvvatlasa)
              // Hozircha original rasmni ishlatamiz, lekin keyin thumbnail qo'shish mumkin
              normalizedPanoramaUrl = normalizedPanoramaUrl;
            }
          }
          
          console.log(`📸 Scene ${scene.id}:`, {
            panorama: normalizedPanoramaUrl,
            hotspots: hotspots.length
          });
          
          if (!normalizedPanoramaUrl) {
            console.warn(`Scene ${scene.id} has no panorama URL - skipping`);
            return;
          }
          
          viewerConfig.scenes[scene.id] = {
            type: scene.type || 'equirectangular',
            panorama: normalizedPanoramaUrl,
            hfov: scene.hfov ?? config.default.hfov ?? 100,
            pitch: scene.pitch ?? config.default.pitch ?? 0,
            yaw: scene.yaw ?? config.default.yaw ?? 0,
            hotSpots: [], // Hotspot'lar o'chirilgan - hech qanday hotspot ko'rsatilmaydi
            vaov: 180,
            vOffset: 0,
            // Rasm yuklash tezligini oshirish uchun
            autoLoad: true,
            // Preload qilish
            preload: true,
          };
        });

        console.log('🎨 Viewer config prepared:', viewerConfig);

        // Initialize viewer
        const containerForViewer = viewerRef.current;
        containerForViewer.style.display = 'block';
        containerForViewer.style.visibility = 'visible';
        containerForViewer.style.opacity = '1';
        containerForViewer.style.width = finalWidth + 'px';
        containerForViewer.style.height = finalHeight + 'px';
        
        console.log('🚀 Initializing Pannellum viewer with dimensions:', { finalWidth, finalHeight });
        viewerInstanceRef.current = window.pannellum.viewer(containerForViewer, viewerConfig);
        
        setIsLoading(true);
        isLoadingRef.current = true;
        setLoadProgress(50);
        setError(null);

        // Event listeners
        const handlePanoload = () => {
          if (panoloadFiredRef.current) {
            console.log('⚠️ panoload already fired, ignoring');
            return;
          }
          panoloadFiredRef.current = true;
          clearPanoloadTimeout();
          console.log('✅ Panorama loaded (panoload event)');
          setLoadProgress(100);
          setTimeout(() => {
            setIsLoading(false);
            isLoadingRef.current = false;
            setLoadProgress(0);
            if (viewerInstanceRef.current) {
              try {
                viewerInstanceRef.current.resize();
              } catch (e) {
                console.warn('Could not resize viewer:', e);
              }
            }
          }, 100); // Tezroq ko'rsatish (300ms -> 100ms)
        };

        viewerInstanceRef.current.on('load', () => {
          console.log('✅ Viewer loaded (load event)');
          setLoadProgress(60);
          
          // Fallback: if panoload doesn't fire within 1 second, force completion (3s -> 1s)
          clearPanoloadTimeout();
          panoloadTimeoutRef.current = setTimeout(() => {
            if (!panoloadFiredRef.current && isLoadingRef.current) {
              console.log('⚠️ panoload timeout - forcing completion');
              handlePanoload();
              // Timeout'dan keyin ham hotspot'larni olish
              setTimeout(() => {
                try {
                  const currentSceneId = viewerInstanceRef.current.getScene();
                  console.log('🎯 Loading hotspots after timeout, scene:', currentSceneId);
                  const currentScene = config.scenes[currentSceneId] as SceneConfig | undefined;
                  if (currentScene && currentScene.hotSpots && currentScene.hotSpots.length > 0) {
                    console.log('✅ Found hotspots after timeout:', currentScene.hotSpots.length);
                    setCurrentHotspots(currentScene.hotSpots);
                  } else {
                    console.log('⚠️ No hotspots found after timeout');
                    setCurrentHotspots([]);
                  }
                } catch (e) {
                  console.warn('Could not load hotspots after timeout:', e);
                }
              }, 300); // Tezroq (500ms -> 300ms)
            }
          }, 1000); // Tezroq (3000ms -> 1000ms)
        });

        // panoload event - birlashtirilgan handler
        viewerInstanceRef.current.on('panoload', () => {
          handlePanoload();
          
          // Joriy scene'ning hotspot'larini olish va pastki qismda ko'rsatish
          const currentSceneId = viewerInstanceRef.current.getScene();
          const currentScene = config.scenes[currentSceneId] as SceneConfig | undefined;
          console.log('🎯 panoload - Loading hotspots for scene:', currentSceneId, currentScene);
          if (currentScene && currentScene.hotSpots && currentScene.hotSpots.length > 0) {
            console.log('✅ Found hotspots:', currentScene.hotSpots.length, currentScene.hotSpots);
            setCurrentHotspots(currentScene.hotSpots);
          } else {
            console.log('⚠️ No hotspots found for scene:', currentSceneId);
            setCurrentHotspots([]);
          }
        });
        
        // Render event - O'CHIRILDI: Arrow'lar static bo'lishi kerak, position'ni yangilash shart emas
        // Panorama aylanayotganda arrow'lar o'z joyida qolishi kerak

        viewerInstanceRef.current.on('panoloaderror', (err: any) => {
          console.error('❌ Panorama load error:', err);
          clearPanoloadTimeout();
          setError('Panorama rasmni yuklashda xatolik yuz berdi');
          setIsLoading(false);
          isLoadingRef.current = false;
        });

        // Scene change event - birlashtirilgan handler
        viewerInstanceRef.current.on('scenechange', (sceneId: string) => {
          console.log('🔄 Scene changed to:', sceneId);
          setCurrentScene(sceneId);
          currentSceneRef.current = sceneId;
          setIsLoading(true);
          isLoadingRef.current = true;
          setLoadProgress(30);
          setError(null);
          panoloadFiredRef.current = false;
          
          // Yangi scene'ning hotspot'larini olish
          const newScene = config.scenes[sceneId] as SceneConfig | undefined;
          console.log('🔄 scenechange - Loading hotspots for scene:', sceneId, newScene);
          if (newScene && newScene.hotSpots && newScene.hotSpots.length > 0) {
            console.log('✅ Found hotspots:', newScene.hotSpots.length, newScene.hotSpots);
            setCurrentHotspots(newScene.hotSpots);
          } else {
            console.log('⚠️ No hotspots found for scene:', sceneId);
            setCurrentHotspots([]);
          }
          
          // Fallback: if panoload doesn't fire, hide loading after 1 second (2s -> 1s)
          clearPanoloadTimeout();
          panoloadTimeoutRef.current = setTimeout(() => {
            if (isLoadingRef.current && currentSceneRef.current === sceneId && !panoloadFiredRef.current) {
              console.log('⚠️ panoload timeout on scenechange - forcing completion');
              setIsLoading(false);
              isLoadingRef.current = false;
              setLoadProgress(0);
            }
          }, 1000);
          
          // Scene change'dan keyin static arrow'larni yangilash
          setTimeout(() => {
            try {
              console.log('🎯 Creating arrows after scenechange, scene:', sceneId);
              createStaticArrows(sceneId, viewerConfig);
            } catch (e) {
              console.warn('Could not create static arrows after scene change:', e);
            }
          }, 800);
        });

        viewerInstanceRef.current.on('error', (err: any) => {
          console.error('❌ Viewer error:', err);
          clearPanoloadTimeout();
          setError(`Panorama yuklashda xatolik: ${err?.message || 'Noma\'lum xatolik'}`);
          setIsLoading(false);
          isLoadingRef.current = false;
        });

        // Hotspot click event - Pannellum'ning o'z event'i
        viewerInstanceRef.current.on('hotspotclick', (hotspot: any) => {
          console.log('🔥 Hotspot clicked (event):', hotspot);
          
          // Hotspot ma'lumotlarini topish va modal ochish
          try {
            const currentSceneId = viewerInstanceRef.current.getScene();
            const scene = viewerConfig.scenes[currentSceneId];
            if (scene && scene.hotSpots) {
              // Hotspot'ni topish - pitch va yaw bo'yicha
              const clickedHotspot = scene.hotSpots.find((h: any) => {
                const pitchDiff = Math.abs(h.pitch - hotspot.pitch);
                const yawDiff = Math.abs(h.yaw - hotspot.yaw);
                // 5 gradusga yaqin bo'lsa, bu hotspot ekanligini bildiradi
                return pitchDiff < 5 && yawDiff < 5;
              });
              
              if (clickedHotspot && clickedHotspot.type === 'info') {
                console.log('🔥 Found hotspot:', clickedHotspot);
                setHotspotModal({
                  text: clickedHotspot.text || '',
                  description: clickedHotspot.description || undefined,
                });
              } else {
                // Agar topilmasa, hotspot'ning o'z ma'lumotlarini ishlatish
                console.log('🔥 Using hotspot data directly:', hotspot);
                if (hotspot.text) {
                  setHotspotModal({
                    text: hotspot.text || '',
                    description: hotspot.description || undefined,
                  });
                }
              }
            }
          } catch (e) {
            console.warn('Could not handle hotspot click:', e);
          }
        });

        // Pannellum'ning o'z hotspot'laridan position olish va arrow'lar yaratish
        const createStaticArrowsFromPannellumHotspots = (sceneId: string, viewerConfig: any, pannellumHotspots: NodeListOf<Element>) => {
          console.log('🎯 createStaticArrowsFromPannellumHotspots called');
          
          if (!arrowsOverlayRef.current || !viewerRef.current) {
            console.warn('⚠️ Cannot create arrows: refs are null');
            return;
          }
          
          const originalScene = config.scenes[sceneId] as SceneConfig | undefined;
          if (!originalScene || !originalScene.hotSpots || originalScene.hotSpots.length === 0) {
            console.log('⚠️ No hotspots in scene:', sceneId);
            return;
          }
          
          // Oldingi arrow'larni tozalash
          if (arrowsOverlayRef.current) {
            arrowsOverlayRef.current.innerHTML = '';
          }
          
          const containerRect = viewerRef.current.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const containerHeight = containerRect.height;
          
          // Har bir Pannellum hotspot'ni bizning arrow'larimiz bilan moslashtirish
          pannellumHotspots.forEach((pnlmHotspot: Element, idx: number) => {
            if (!originalScene.hotSpots || idx >= originalScene.hotSpots.length) return;
            const hotspot = originalScene.hotSpots[idx];
            if (!hotspot) return;
            
            const rect = pnlmHotspot.getBoundingClientRect();
            const xPercent = ((rect.left + rect.width / 2 - containerRect.left) / containerWidth) * 100;
            const yPercent = ((rect.top + rect.height / 2 - containerRect.top) / containerHeight) * 100;
            
            console.log(`📍 Using Pannellum hotspot ${idx} position:`, { xPercent, yPercent, hotspot });
            
            // Arrow element yaratish
            const arrowEl = createArrowElement(hotspot, idx, sceneId, xPercent, yPercent);
            if (arrowsOverlayRef.current) {
              arrowsOverlayRef.current.appendChild(arrowEl);
            }
          });
        };
        
        // Arrow element yaratish funksiyasi
        const createArrowElement = (hotspot: any, index: number, sceneId: string, xPercent: number, yPercent: number) => {
          const arrowEl = document.createElement('div');
          arrowEl.className = 'static-hotspot-arrow';
          arrowEl.setAttribute('data-hotspot-index', index.toString());
          arrowEl.setAttribute('data-scene-id', sceneId);
          arrowEl.setAttribute('data-hotspot-type', hotspot.type || 'scene');
          
          // Chiroyli belgi yaratish - RASMDA KO'RSATILGANDEK
          // STATIC qilish - hech qanday transform yo'q, faqat position
          arrowEl.style.cssText = `
            position: absolute !important;
            left: ${xPercent}% !important;
            top: ${yPercent}% !important;
            transform: translate(-50%, -50%) !important;
            width: 80px !important;
            height: 80px !important;
            cursor: pointer !important;
            z-index: 10001 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: auto !important;
            transition: none !important;
            opacity: 1 !important;
            visibility: visible !important;
            will-change: auto !important;
            backface-visibility: hidden !important;
          `;
          
          // Asosiy marker - oq rangda L-shaped arrow
          const marker = document.createElement('div');
          marker.style.cssText = `
            width: 50px !important;
            height: 50px !important;
            background: white !important;
            clip-path: polygon(0 0, 100% 0, 100% 30%, 70% 30%, 70% 100%, 30% 100%, 30% 30%, 0 30%) !important;
            border-radius: 4px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            transform: rotate(${hotspot.yaw || 0}deg) !important;
            transition: none !important;
            will-change: auto !important;
          `;
          arrowEl.appendChild(marker);
          
          // Qizil circle highlight - RASMDA KO'RSATILGANDEK
          const highlightCircle = document.createElement('div');
          highlightCircle.style.cssText = `
            position: absolute !important;
            width: 80px !important;
            height: 80px !important;
            border-radius: 50% !important;
            border: 3px solid rgba(255, 0, 0, 0.7) !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            pointer-events: none !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
          `;
          arrowEl.appendChild(highlightCircle);
          
          // Hover effect - O'CHIRILDI: Arrow'lar o'ynab ketmasligi uchun
          // Faqat highlight circle'ni ko'rsatish, hech qanday transform yo'q
          arrowEl.addEventListener('mouseenter', () => {
            highlightCircle.style.opacity = '1';
            // Transform'ni o'zgartirmaslik - arrow'lar o'z joyida qolishi kerak
          });
          
          arrowEl.addEventListener('mouseleave', () => {
            highlightCircle.style.opacity = '0';
            // Transform'ni o'zgartirmaslik
          });
          
          // Click handler
          arrowEl.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            console.log('🔥 Static arrow clicked:', hotspot);
            
            if (hotspot.type === 'scene' && hotspot.sceneId) {
              try {
                viewerInstanceRef.current.loadScene(hotspot.sceneId);
                setCurrentScene(hotspot.sceneId);
                currentSceneRef.current = hotspot.sceneId;
              } catch (err) {
                console.warn('Could not load scene:', err);
              }
            } else if (hotspot.type === 'info') {
              setHotspotModal({
                text: hotspot.text || '',
                description: hotspot.description || undefined,
              });
            }
            
            return false;
          });
          
          // Arrow'ni qulflash - transform o'zgarishlarini bloklash
          const lockTransform = () => {
            const currentTransform = arrowEl.style.transform;
            if (currentTransform !== 'translate(-50%, -50%)') {
              arrowEl.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            }
          };
          
          // MutationObserver - transform o'zgarishlarini kuzatish va qayta o'rnatish
          const observer = new MutationObserver(() => {
            lockTransform();
          });
          
          observer.observe(arrowEl, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: false,
            subtree: false,
          });
          
          // Har 100ms transform'ni tekshirish va qayta o'rnatish
          const transformCheckInterval = setInterval(() => {
            lockTransform();
          }, 100);
          
          // Cleanup uchun arrow element'ga interval va observer'ni saqlash
          (arrowEl as any)._transformCheckInterval = transformCheckInterval;
          (arrowEl as any)._transformObserver = observer;
          
          // Mousedown, mousemove event'larni bloklash - panorama drag'ni to'xtatish
          arrowEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            lockTransform();
          });
          
          arrowEl.addEventListener('mousemove', (e) => {
            e.stopPropagation();
            lockTransform();
          });
          
          arrowEl.addEventListener('mouseenter', () => {
            lockTransform();
            highlightCircle.style.opacity = '1';
          });
          
          arrowEl.addEventListener('mouseleave', () => {
            lockTransform();
            highlightCircle.style.opacity = '0';
          });
          
          return arrowEl;
        };
        
        // Custom static arrows yaratish - BOSHQACHA YONDASHUV
        const createStaticArrows = (sceneId: string, viewerConfig: any) => {
          console.log('🎯 createStaticArrows called with sceneId:', sceneId);
          
          if (!arrowsOverlayRef.current) {
            console.warn('⚠️ Cannot create arrows: arrowsOverlayRef.current is null');
            return;
          }
          
          if (!viewerInstanceRef.current) {
            console.warn('⚠️ Cannot create arrows: viewerInstanceRef.current is null');
            return;
          }
          
          // Original config prop'dan hotspot'larni olish (viewerConfig'da hotSpots bo'sh)
          const originalScene = config.scenes[sceneId] as SceneConfig | undefined;
          console.log('🔍 Original scene:', originalScene);
          
          if (!originalScene) {
            console.warn('⚠️ Scene not found:', sceneId, 'Available scenes:', Object.keys(config.scenes));
            if (arrowsOverlayRef.current) {
              arrowsOverlayRef.current.innerHTML = '';
            }
            return;
          }
          
          if (!originalScene.hotSpots || originalScene.hotSpots.length === 0) {
            console.log('⚠️ No hotspots in scene:', sceneId);
            if (arrowsOverlayRef.current) {
              arrowsOverlayRef.current.innerHTML = '';
            }
            return;
          }
          
          console.log('🎯 Creating static arrows for scene:', sceneId, originalScene.hotSpots.length);
          
          // Oldingi arrow'larni tozalash
          if (arrowsOverlayRef.current) {
            arrowsOverlayRef.current.innerHTML = '';
          }
          
          const container = containerForViewer || viewerRef.current;
          if (!container) {
            console.warn('⚠️ Container not found');
            return;
          }
          
          const containerRect = container.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const containerHeight = containerRect.height;
          
          console.log('📐 Container dimensions:', { 
            width: containerWidth, 
            height: containerHeight,
            overlayElement: arrowsOverlayRef.current,
            overlayRect: arrowsOverlayRef.current?.getBoundingClientRect(),
            overlayStyle: arrowsOverlayRef.current ? window.getComputedStyle(arrowsOverlayRef.current) : null
          });
          
          // Har bir hotspot uchun arrow yaratish
          originalScene.hotSpots.forEach((hotspot: any, index: number) => {
            if (hotspot.pitch === undefined || hotspot.pitch === null || hotspot.yaw === undefined || hotspot.yaw === null) {
              console.warn('⚠️ Hotspot missing coordinates:', hotspot);
              return;
            }
            
            // Pitch va yaw bo'yicha screen position'ni hisoblash
            // Pannellum'ning coordinate system'i: pitch (-90 to 90), yaw (-180 to 180)
            const hotspotPitch = hotspot.pitch || 0;
            const hotspotYaw = hotspot.yaw || 0;
            
            console.log(`📍 Hotspot ${index}:`, { pitch: hotspotPitch, yaw: hotspotYaw, type: hotspot.type });
            
            // Screen position'ni hisoblash funksiyasi
            // Pannellum'ning equirectangular projection formulasi bilan to'g'ri hisoblash
            // Bu formula Pannellum'ning o'z formulasi bilan mos keladi
            const calculateScreenPosition = (pitch: number, yaw: number) => {
              const currentYaw = viewerInstanceRef.current?.getYaw() || 0;
              const currentPitch = viewerInstanceRef.current?.getPitch() || 0;
              const currentHfov = viewerInstanceRef.current?.getHfov() || 100;
              
              // Relative yaw va pitch hisoblash
              const relativeYaw = yaw - currentYaw;
              // Yaw'ni -180 to 180 orasiga olib kelish
              let normalizedYaw = relativeYaw;
              while (normalizedYaw > 180) normalizedYaw -= 360;
              while (normalizedYaw < -180) normalizedYaw += 360;
              
              // Pannellum'ning equirectangular projection formulasi
              // Equirectangular projection'da:
              // - Yaw: -180 to 180 -> screen'da 0% to 100%
              // - Pitch: -90 to 90 -> screen'da 100% to 0%
              
              // X: relative yaw bo'yicha
              // Equirectangular projection: x = ((yaw + 180) / 360) * width
              // Lekin biz relative yaw ishlatamiz, shuning uchun:
              // xPercent = 50% + (normalizedYaw / currentHfov) * 100%
              const xPercent = 50 + (normalizedYaw / currentHfov) * 100;
              
              // Y: pitch bo'yicha
              // Equirectangular projection: y = ((90 - pitch) / 180) * height
              // Lekin biz relative pitch ishlatamiz, shuning uchun:
              const aspectRatio = containerWidth / containerHeight;
              const vfov = currentHfov / aspectRatio;
              const relativePitch = pitch - currentPitch;
              const yPercent = 50 - (relativePitch / vfov) * 100;
              
              return { xPercent, yPercent };
            };
            
            // Screen position'ni hisoblash
            const { xPercent, yPercent } = calculateScreenPosition(hotspotPitch, hotspotYaw);
            
            // Position'ni tekshirish va cheklash (0-100% orasida bo'lishi kerak)
            const safeXPercent = Math.max(0, Math.min(100, xPercent));
            const safeYPercent = Math.max(0, Math.min(100, yPercent));
            
            console.log(`📍 Screen position (calculated):`, { 
              xPercent, 
              yPercent,
              safeXPercent,
              safeYPercent,
              hotspotPitch,
              hotspotYaw,
              currentYaw: viewerInstanceRef.current?.getYaw() || 0,
              currentPitch: viewerInstanceRef.current?.getPitch() || 0,
              containerWidth,
              containerHeight
            });
            
            // Arrow element yaratish - RASMDA KO'RSATILGANDEK POL'DA L-SHAPED MARKER
            const arrowEl = document.createElement('div');
            arrowEl.className = 'static-hotspot-arrow';
            arrowEl.setAttribute('data-hotspot-index', index.toString());
            arrowEl.setAttribute('data-scene-id', sceneId);
            arrowEl.setAttribute('data-hotspot-type', hotspot.type || 'scene');
            
            // Inline styles - CSS class bilan birga
            // Aynan belgilangan joyda ko'rsatish uchun top va left ishlatamiz
            arrowEl.style.cssText = `
              position: absolute !important;
              left: ${safeXPercent}% !important;
              top: ${safeYPercent}% !important;
              transform: translate(-50%, -50%) !important;
              width: 60px !important;
              height: 60px !important;
              cursor: pointer !important;
              z-index: 10001 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              pointer-events: auto !important;
              transition: transform 0.2s ease, opacity 0.2s ease !important;
              opacity: 1 !important;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) !important;
              visibility: visible !important;
            `;
            
            // L-shaped arrow marker yaratish - RASMDA KO'RSATILGANDEK
            const arrowMarker = document.createElement('div');
            arrowMarker.style.width = '40px';
            arrowMarker.style.height = '40px';
            arrowMarker.style.position = 'relative';
            arrowMarker.style.transform = `rotate(${hotspotYaw}deg)`;
            arrowMarker.style.transition = 'transform 0.2s ease';
            
            // L-shaped arrow yaratish - CSS clip-path bilan
            arrowMarker.style.background = 'white';
            arrowMarker.style.clipPath = 'polygon(0 0, 100% 0, 100% 30%, 70% 30%, 70% 100%, 30% 100%, 30% 30%, 0 30%)';
            arrowMarker.style.borderRadius = '4px';
            arrowMarker.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            
            arrowEl.appendChild(arrowMarker);
            
            // Hover effect - highlight circle (qizil circle) - RASMDA KO'RSATILGANDEK
            const highlightCircle = document.createElement('div');
            highlightCircle.style.position = 'absolute';
            highlightCircle.style.width = '70px';
            highlightCircle.style.height = '70px';
            highlightCircle.style.borderRadius = '50%';
            highlightCircle.style.border = '3px solid rgba(255, 0, 0, 0.6)';
            highlightCircle.style.top = '50%';
            highlightCircle.style.left = '50%';
            highlightCircle.style.transform = 'translate(-50%, -50%)';
            highlightCircle.style.pointerEvents = 'none';
            highlightCircle.style.opacity = '0';
            highlightCircle.style.transition = 'opacity 0.2s ease';
            arrowEl.appendChild(highlightCircle);
            
            // Hover effect - highlight circle ko'rsatish
            arrowEl.addEventListener('mouseenter', () => {
              arrowEl.style.setProperty('transform', 'translate(-50%, -50%) scale(1.2)', 'important');
              arrowEl.style.setProperty('opacity', '1', 'important');
              highlightCircle.style.opacity = '1';
            });
            arrowEl.addEventListener('mouseleave', () => {
              arrowEl.style.setProperty('transform', 'translate(-50%, -50%) scale(1)', 'important');
              arrowEl.style.setProperty('opacity', '1', 'important');
              highlightCircle.style.opacity = '0';
            });
            
            // Click handler
            arrowEl.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              
              console.log('🔥 Static arrow clicked:', hotspot);
              
              if (hotspot.type === 'scene' && hotspot.sceneId) {
                // Scene transition
                try {
                  viewerInstanceRef.current.loadScene(hotspot.sceneId);
                  setCurrentScene(hotspot.sceneId);
                  currentSceneRef.current = hotspot.sceneId;
                } catch (err) {
                  console.warn('Could not load scene:', err);
                }
              } else if (hotspot.type === 'info') {
                // Info modal
                setHotspotModal({
                  text: hotspot.text || '',
                  description: hotspot.description || undefined,
                });
              }
              
              return false;
            });
            
            if (arrowsOverlayRef.current) {
              arrowsOverlayRef.current.appendChild(arrowEl);
              
              // Arrow'ning ko'rinishini tekshirish
              const rect = arrowEl.getBoundingClientRect();
              const computedStyle = window.getComputedStyle(arrowEl);
              
              console.log(`✅ Arrow ${index} created and appended`, { 
                xPercent, 
                yPercent,
                pitch: hotspotPitch,
                yaw: hotspotYaw,
                type: hotspot.type,
                sceneId: hotspot.sceneId,
                element: arrowEl,
                parent: arrowsOverlayRef.current,
                parentChildren: arrowsOverlayRef.current.children.length,
                rect: {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                  visible: rect.width > 0 && rect.height > 0
                },
                computedStyle: {
                  display: computedStyle.display,
                  visibility: computedStyle.visibility,
                  opacity: computedStyle.opacity,
                  zIndex: computedStyle.zIndex,
                  position: computedStyle.position
                }
              });
              
              // Agar arrow ko'rinmasa, warning chiqarish
              if (rect.width === 0 || rect.height === 0) {
                console.warn(`⚠️ Arrow ${index} has zero dimensions!`, {
                  xPercent,
                  yPercent,
                  containerWidth,
                  containerHeight
                });
              }
            } else {
              console.error('❌ arrowsOverlayRef.current is null when trying to append arrow');
            }
          });
          
          console.log('✅ Static arrows created:', {
            count: originalScene.hotSpots.length,
            sceneId,
            overlayElement: arrowsOverlayRef.current,
            overlayChildren: arrowsOverlayRef.current?.children.length || 0,
            overlayRect: arrowsOverlayRef.current?.getBoundingClientRect()
          });
        };

        console.log('✅ Viewer initialized successfully');

      } catch (err: any) {
        console.error('❌ Viewer initialization error:', err);
        setError('Viewer\'ni ishga tushirishda xatolik yuz berdi');
        setIsLoading(false);
        initializationAttemptedRef.current = false;
      }
    };

    loadPannellum();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up PanoramaViewer');
      clearPanoloadTimeout();
      initializationAttemptedRef.current = false;
      panoloadFiredRef.current = false;
      
      // Arrow overlay'ni tozalash
      if (arrowsOverlayRef.current) {
        // Clear arrow intervals and observers
        const arrows = arrowsOverlayRef.current.querySelectorAll('.static-hotspot-arrow');
        arrows.forEach((arrowEl: any) => {
          if (arrowEl._transformCheckInterval) {
            clearInterval(arrowEl._transformCheckInterval);
          }
          if (arrowEl._transformObserver) {
            arrowEl._transformObserver.disconnect();
          }
        });
        arrowsOverlayRef.current.innerHTML = '';
      }
      
      
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        viewerInstanceRef.current = null;
      }
    };
  }, [config, normalizePanoramaUrl, prepareHotspots, clearPanoloadTimeout]);

  if (error) {
    return (
      <div className={`flex h-full min-h-[400px] items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: '16 / 9', minHeight: '400px' }}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100">
          <div className="mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
          </div>
          <p className="text-lg text-gray-600">
            {locale === 'ru' ? 'Панорама загружается...' : 'Panorama yuklanmoqda...'}
          </p>
          {loadProgress > 0 && (
            <div className="mt-4 w-64">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Viewer container */}
      <div className="relative h-full w-full">
        <div
          ref={viewerRef}
          id="pannellum-viewer"
          className="h-full w-full"
          style={{
            display: isLoading ? 'none' : 'block',
            visibility: isLoading ? 'hidden' : 'visible',
            opacity: isLoading ? 0 : 1,
          }}
        />
        
        {/* Static arrows overlay - O'CHIRILGAN */}
        
        {/* Hotspot Preview Overlay - IXCHAM VA KICHIK */}
        {hoveredHotspotIndex !== null && currentHotspots[hoveredHotspotIndex] && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Preview overlay - kichik va ixcham */}
            <div
              className="absolute rounded-lg overflow-hidden shadow-xl"
              style={{
                width: '280px',
                height: '180px',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Preview panorama - asosiy panorama'ning o'sha qismi */}
              <div
                style={{
                  width: '100%',
                  height: '120px',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                }}
              >
                {/* Panorama'ning o'sha qismini ko'rsatish - scene'ning rasmini ko'rsatish */}
                {previewReady && hoveredHotspotIndex !== null && viewerInstanceRef.current && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {(() => {
                      const hotspot = currentHotspots[hoveredHotspotIndex];
                      let panoramaUrl = '';
                      
                      // Agar scene type bo'lsa, o'sha scene'ning rasmini ko'rsatish
                      if (hotspot.type === 'scene' && hotspot.sceneId) {
                        const targetScene = config.scenes[hotspot.sceneId] as SceneConfig | undefined;
                        if (targetScene && targetScene.panorama) {
                          panoramaUrl = normalizePanoramaUrl(targetScene.panorama);
                        }
                      } else {
                        // Agar info type bo'lsa, joriy scene'ning rasmini ko'rsatish
                        const currentSceneId = viewerInstanceRef.current?.getScene();
                        const currentScene = config.scenes[currentSceneId] as SceneConfig | undefined;
                        if (currentScene && currentScene.panorama) {
                          panoramaUrl = normalizePanoramaUrl(currentScene.panorama);
                        }
                      }
                      
                      return (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: panoramaUrl ? `url(${panoramaUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            opacity: 0.9,
                          }}
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
              {/* Preview text */}
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  padding: '8px',
                  color: '#333',
                  flex: 1,
                }}
              >
                <div className="text-sm font-semibold mb-0.5 text-center">
                  {currentHotspots[hoveredHotspotIndex].text}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  {currentHotspots[hoveredHotspotIndex].type === 'scene' 
                    ? `${currentHotspots[hoveredHotspotIndex].text}ga o'tish`
                    : 'Ma\'lumot ko\'rish'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hotspot Navigation Buttons - Pastki qismda */}
      {(() => {
        console.log('🔍 Button render check - isLoading:', isLoading, 'currentHotspots:', currentHotspots.length, currentHotspots);
        return null;
      })()}
      {!isLoading && currentHotspots.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-2 px-4">
          {currentHotspots.map((hotspot, index) => {
            const handleHotspotClick = () => {
              if (!viewerInstanceRef.current) return;
              
              // Hover preview'ni to'xtatish va tozalash
              const timeout = hoverTimeoutRef.current.get(index);
              if (timeout) {
                clearTimeout(timeout);
                hoverTimeoutRef.current.delete(index);
              }
              
              // Preview overlay'ni yashirish
              setHoveredHotspotIndex(null);
              setPreviewReady(false);
              
              // Original position'ni tozalash (scene o'zgarganda kerak emas)
              if (hotspot.type === 'scene') {
                originalPositionRef.current.delete(index);
              }
              
              if (hotspot.type === 'scene' && hotspot.sceneId) {
                // Scene'ga o'tish
                try {
                  viewerInstanceRef.current.loadScene(hotspot.sceneId);
                  setCurrentScene(hotspot.sceneId);
                  currentSceneRef.current = hotspot.sceneId;
                } catch (err) {
                  console.warn('Could not load scene:', err);
                }
              } else if (hotspot.type === 'info') {
                // Info modal ko'rsatish
                setHotspotModal({
                  text: hotspot.text || '',
                  description: hotspot.description || undefined,
                });
              } else {
                // Faqat panorama'ni o'sha joyga aylantirish
                const targetPitch = hotspot.pitch || 0;
                const targetYaw = hotspot.yaw || 0;
                const currentHfov = viewerInstanceRef.current.getHfov() || 100;
                
                viewerInstanceRef.current.lookAt(targetPitch, targetYaw, currentHfov, 1000); // 1 soniya ichida smooth transition
              }
            };
            
            const handleMouseEnter = () => {
              if (!viewerInstanceRef.current) return;
              
              // Original position'ni saqlash
              const originalPitch = viewerInstanceRef.current.getPitch();
              const originalYaw = viewerInstanceRef.current.getYaw();
              originalPositionRef.current.set(index, { pitch: originalPitch, yaw: originalYaw });
              
              // Preview overlay'ni yashirish - avval panorama aylanadi
              setPreviewReady(false);
              setHoveredHotspotIndex(null);
              
              // Panorama'ni avval aylantirish
              const targetPitch = hotspot.pitch || 0;
              const targetYaw = hotspot.yaw || 0;
              const currentHfov = viewerInstanceRef.current.getHfov() || 100;
              
              // Panorama'ni o'sha joyga aylantirish (preview)
              viewerInstanceRef.current.lookAt(targetPitch, targetYaw, currentHfov, 500); // 0.5 soniya ichida smooth transition
              
              // Panorama aylangandan keyin preview'ni ko'rsatish
              const timeout = setTimeout(() => {
                setHoveredHotspotIndex(index);
                // Preview'ni ko'rsatish uchun biroz kutish - panorama to'liq aylangandan keyin
                setTimeout(() => {
                  setPreviewReady(true);
                }, 100);
              }, 600); // 600ms delay - panorama aylangandan keyin preview ko'rsatiladi
              
              hoverTimeoutRef.current.set(index, timeout);
            };
            
            const handleMouseLeave = () => {
              if (!viewerInstanceRef.current) return;
              
              // Preview overlay'ni yashirish
              setHoveredHotspotIndex(null);
              setPreviewReady(false);
              
              // Hover timeout'ni to'xtatish
              const timeout = hoverTimeoutRef.current.get(index);
              if (timeout) {
                clearTimeout(timeout);
                hoverTimeoutRef.current.delete(index);
              }
              
              // Original position'ga qaytarish - faqat agar scene o'zgarmagan bo'lsa
              // Scene type bo'lsa, original position'ga qaytarmaslik (chunki scene o'zgardi)
              if (hotspot.type !== 'scene') {
                const originalPos = originalPositionRef.current.get(index);
                if (originalPos) {
                  const currentHfov = viewerInstanceRef.current.getHfov() || 100;
                  viewerInstanceRef.current.lookAt(originalPos.pitch, originalPos.yaw, currentHfov, 500); // 0.5 soniya ichida smooth transition
                  originalPositionRef.current.delete(index);
                }
              } else {
                // Scene type bo'lsa, original position'ni tozalash
                originalPositionRef.current.delete(index);
              }
            };
            
            return (
              <button
                key={index}
                onClick={handleHotspotClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-brand-primary/90 hover:shadow-xl active:scale-95"
                style={{
                  border: 'none',
                }}
              >
                {hotspot.text || (hotspot.type === 'scene' ? `Scene ${index + 1}` : `Hotspot ${index + 1}`)}
              </button>
            );
          })}
        </div>
      )}

      {/* Hotspot Modal */}
      {hotspotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setHotspotModal(null)}
        >
          <div
            className="relative max-w-2xl rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHotspotModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="mb-4 text-2xl font-bold text-foreground">
              {hotspotModal.text}
            </h3>
            {hotspotModal.description && (
              <p className="text-muted-foreground whitespace-pre-line">
                {hotspotModal.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
