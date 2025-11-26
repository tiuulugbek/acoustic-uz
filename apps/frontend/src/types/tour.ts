/**
 * 3D Virtual Tour Configuration Types
 */

export interface HotspotConfig {
  pitch: number; // Vertical position (-90 to 90)
  yaw: number; // Horizontal position (-180 to 180)
  type: 'scene' | 'info';
  text: string; // Tooltip text
  sceneId?: string; // Required if type === 'scene'
  description?: string; // Required if type === 'info'
  cssClass?: string; // Optional custom CSS class
}

export interface SceneConfig {
  id: string; // Unique scene identifier
  panorama: string; // Path to panorama image
  type?: 'equirectangular' | 'cubemap'; // Default: 'equirectangular'
  hfov?: number; // Initial horizontal field of view (default: 100)
  pitch?: number; // Initial vertical rotation (default: 0)
  yaw?: number; // Initial horizontal rotation (default: 0)
  hotSpots?: HotspotConfig[];
  // Metadata for future admin panel
  title?: {
    uz?: string;
    ru?: string;
  };
  subtitle?: {
    uz?: string;
    ru?: string;
  };
  description?: {
    uz?: string;
    ru?: string;
  };
  order?: number; // Display order
}

export interface TourConfig {
  default: {
    firstScene: string; // ID of the first scene to load
    hfov?: number; // Default horizontal field of view
    pitch?: number; // Default pitch
    yaw?: number; // Default yaw
  };
  scenes: Record<string, SceneConfig>; // Scene ID -> Scene Config
  // Global settings
  autoRotate?: number; // Auto-rotation speed (degrees per second), 0 to disable
  autoLoad?: boolean; // Auto-load first scene on page load
  showControls?: boolean; // Show zoom/fullscreen controls
  showFullscreenCtrl?: boolean; // Show fullscreen button
  showZoomCtrl?: boolean; // Show zoom controls
  keyboardZoom?: boolean; // Enable keyboard zoom
  mouseZoom?: boolean; // Enable mouse wheel zoom
  compass?: boolean; // Show compass
  northOffset?: number; // North offset in degrees
}

