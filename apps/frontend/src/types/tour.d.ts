/**
 * 3D Virtual Tour Configuration Types
 */
export interface HotspotConfig {
    pitch: number;
    yaw: number;
    type: 'scene' | 'info';
    text: string;
    sceneId?: string;
    description?: string;
    cssClass?: string;
}
export interface SceneConfig {
    id: string;
    panorama: string;
    type?: 'equirectangular' | 'cubemap';
    hfov?: number;
    pitch?: number;
    yaw?: number;
    hotSpots?: HotspotConfig[];
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
    order?: number;
}
export interface TourConfig {
    default: {
        firstScene: string;
        hfov?: number;
        pitch?: number;
        yaw?: number;
    };
    scenes: Record<string, SceneConfig>;
    autoRotate?: number;
    autoLoad?: boolean;
    showControls?: boolean;
    showFullscreenCtrl?: boolean;
    showZoomCtrl?: boolean;
    keyboardZoom?: boolean;
    mouseZoom?: boolean;
    compass?: boolean;
    northOffset?: number;
}
//# sourceMappingURL=tour.d.ts.map