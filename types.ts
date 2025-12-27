
export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  prompt: string;
  createdAt: number;
  selected: boolean;
  status?: 'generating' | 'completed' | 'failed';
}

export interface SavedPreset {
  id: string;
  name: string;
  prompt: string;
  bgPrompt: string;
  posePrompt: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  seed: number;
}

export interface SavedAsset {
  id: string;
  type: 'model' | 'pose';
  url: string;
  thumbnail?: string;
  createdAt: number;
}

export interface PromptHistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  bgPrompt?: string;
  posePrompt?: string;
  type: 'image' | 'video';
}

export type CameraMotion = 'none' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'orbit';

export interface BeautyConfig {
  gender: 'Nam' | 'Nữ';
  hairStyle: string;
  hairColor: string;
  accessories: string[];
}

export interface AppState {
  peopleCount: 1 | 2;
  
  // Model 1
  modelImage: File | null;
  modelPreviewUrl: string | null;
  modelDescription: string;
  isAnalyzingModel: boolean;

  // Model 2
  modelImage2: File | null;
  modelPreviewUrl2: string | null;
  modelDescription2: string;
  isAnalyzingModel2: boolean;
  
  // Product
  productImageFront: File | string | null;
  productPreviewUrlFront: string | null;
  productDescriptionFront: string;
  isAnalyzingProductFront: boolean;

  productImageBack: File | string | null;
  productPreviewUrlBack: string | null;
  productDescriptionBack: string;
  isAnalyzingProductBack: boolean;

  newModelImage: File | string | null;
  newModelPreviewUrl: string | null;
  poseImage: File | string | null;
  poseImagePreviewUrl: string | null;

  prompt: string;
  backgroundPrompt: string;
  posePrompt: string;
  selectedPosePrompts: string[];
  
  backgroundImages: File[];
  backgroundImagePreviewUrls: string[];

  aspectRatio: '9:16' | '16:9' | '1:1';
  seed: number;
  variationCount: number;
  
  generationMode: 'image' | 'video';
  videoFlowConfig: {
    motion: CameraMotion;
    strength: number;
  };
  
  beautyConfig: BeautyConfig;

  isGenerating: boolean;
  isSeparating: boolean;
  isGeneratingBackgroundVideo: boolean;
  generatedLibrary: GeneratedMedia[];
  activeTab: 'image' | 'video';
  
  showStoryboardModal: boolean;
  videoPrompts: Record<string, string>;
  suggestedPrompts: Record<string, string[]>;
  
  previewMediaId: string | null;
  savedPresets: SavedPreset[];
  savedAssets: SavedAsset[];
  analyzingMediaIds: string[];
  promptHistory: PromptHistoryEntry[];
}
