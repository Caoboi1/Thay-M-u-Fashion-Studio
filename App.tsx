
import React, { useState, useEffect } from 'react';
import { Step1_Staging } from './components/Step1_Staging';
import Step2_Controls from './components/Step2_Controls';
import Step3_Gallery from './components/Step3_Gallery';
import StoryboardModal from './components/StoryboardModal';
import RetryPromptModal from './components/RetryPromptModal';
import { AppState, GeneratedMedia, SavedPreset, PromptHistoryEntry, SavedAsset, BeautyConfig } from './types';
import { 
  generateFashionImage, 
  generateFashionVideo, 
  extractClothing, 
  analyzeImageForVideoPrompts, 
  createFaceAvatar, 
  analyzeModelImage,
  analyzeProductImage 
} from './services/geminiService';
import JSZip from 'jszip';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    peopleCount: 1,
    modelImage: null, modelPreviewUrl: null, modelDescription: '', isAnalyzingModel: false,
    modelImage2: null, modelPreviewUrl2: null, modelDescription2: '', isAnalyzingModel2: false,
    
    productImageFront: null, productPreviewUrlFront: null, productDescriptionFront: '', isAnalyzingProductFront: false,
    productImageBack: null, productPreviewUrlBack: null, productDescriptionBack: '', isAnalyzingProductBack: false,
    
    newModelImage: null, newModelPreviewUrl: null, poseImage: null, poseImagePreviewUrl: null,
    backgroundImages: [], backgroundImagePreviewUrls: [],
    prompt: '', backgroundPrompt: '', posePrompt: '', selectedPosePrompts: [], 
    aspectRatio: '9:16', seed: 42, variationCount: 1, 
    generationMode: 'image', videoFlowConfig: { motion: 'pan_right', strength: 5 },
    beautyConfig: { gender: 'Nam', hairStyle: 'Tóc ngắn Side Part', hairColor: 'Đen', accessories: [] },
    isGenerating: false, isSeparating: false, isGeneratingBackgroundVideo: false,
    generatedLibrary: [], activeTab: 'image', showStoryboardModal: false,
    videoPrompts: {}, suggestedPrompts: {}, previewMediaId: null,
    savedPresets: [], savedAssets: [], analyzingMediaIds: [], promptHistory: []
  });

  const [isZipping, setIsZipping] = useState(false);
  const [refineMediaId, setRefineMediaId] = useState<string | null>(null);

  const handleAnalyzeModel = async (modelNum: 1 | 2, fileOverride?: File) => {
      const fileToAnalyze = fileOverride || (modelNum === 1 ? state.modelImage : state.modelImage2);
      if (!fileToAnalyze) return;
      const analysisKey = modelNum === 1 ? 'isAnalyzingModel' : 'isAnalyzingModel2';
      const descKey = modelNum === 1 ? 'modelDescription' : 'modelDescription2';
      setState(p => ({ ...p, [analysisKey]: true }));
      try {
          const desc = await analyzeModelImage(fileToAnalyze);
          setState(p => ({ ...p, [descKey]: desc }));
      } finally { setState(p => ({ ...p, [analysisKey]: false })); }
  };

  const handleAnalyzeProduct = async (side: 'front' | 'back', fileOverride?: File) => {
      const fileToAnalyze = fileOverride || (side === 'front' ? state.productImageFront : state.productImageBack);
      if (!fileToAnalyze) return;
      const analysisKey = side === 'front' ? 'isAnalyzingProductFront' : 'isAnalyzingProductBack';
      const descKey = side === 'front' ? 'productDescriptionFront' : 'productDescriptionBack';
      setState(p => ({ ...p, [analysisKey]: true }));
      try {
          const desc = await analyzeProductImage(fileToAnalyze as File);
          setState(p => ({ ...p, [descKey]: desc }));
      } finally { setState(p => ({ ...p, [analysisKey]: false })); }
  };

  const handleGenerateImage = async () => {
    if (!state.prompt && !state.modelImage && !state.newModelImage) return;
    setState(prev => ({ ...prev, isGenerating: true, activeTab: 'image' }));
    const count = state.variationCount;
    const placeholders: GeneratedMedia[] = Array.from({ length: count }).map((_, i) => ({
        id: `img-${Date.now()}-${i}`, type: 'image', url: '', prompt: state.prompt,
        createdAt: Date.now(), selected: false, status: 'generating'
    }));
    setState(prev => ({ ...prev, generatedLibrary: [...placeholders, ...prev.generatedLibrary] }));

    const tasks = placeholders.map(async (item, idx) => {
        await new Promise(r => setTimeout(r, idx * 500));
        try {
            const url = await generateFashionImage(
                state.prompt, state.backgroundPrompt, 
                state.selectedPosePrompts[idx % state.selectedPosePrompts.length] || state.posePrompt,
                state.newModelImage || state.modelImage,
                state.modelDescription,
                state.modelImage2,
                state.modelDescription2,
                state.peopleCount,
                state.productImageFront,
                state.productDescriptionFront,
                state.productImageBack,
                state.productDescriptionBack,
                state.poseImage,
                state.backgroundImages[idx % state.backgroundImages.length] || null,
                state.aspectRatio, state.seed + idx,
                state.beautyConfig
            );
            setState(prev => ({
                ...prev,
                generatedLibrary: prev.generatedLibrary.map(g => g.id === item.id ? { ...g, url, status: 'completed' } : g)
            }));
        } catch (e) {
            setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === item.id ? { ...g, status: 'failed' } : g) }));
        }
    });
    Promise.allSettled(tasks).finally(() => setState(prev => ({ ...prev, isGenerating: false })));
  };

  // Fix: Added missing handleGenerateVideo function
  const handleGenerateVideo = async () => {
    if (!state.prompt && !state.modelImage && !state.newModelImage) return;
    setState(prev => ({ ...prev, isGenerating: true, activeTab: 'video' }));
    
    const tempId = `vid-${Date.now()}`;
    const placeholder: GeneratedMedia = {
        id: tempId, type: 'video', url: '', prompt: state.prompt,
        createdAt: Date.now(), selected: false, status: 'generating'
    };
    setState(prev => ({ ...prev, generatedLibrary: [placeholder, ...prev.generatedLibrary] }));

    try {
        const finalPrompt = `${state.prompt}. Camera movement: ${state.videoFlowConfig.motion}.`;
        const url = await generateFashionVideo(
            finalPrompt, 
            state.newModelImage || state.modelImage, 
            state.aspectRatio === '1:1' ? '9:16' : state.aspectRatio
        );
        setState(prev => ({
            ...prev,
            generatedLibrary: prev.generatedLibrary.map(g => g.id === tempId ? { ...g, url, status: 'completed' } : g)
        }));
    } catch (e) {
        setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === tempId ? { ...g, status: 'failed' } : g) }));
    } finally {
        setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleRetryMedia = async (id: string, customPrompt?: string) => {
    const item = state.generatedLibrary.find(i => i.id === id);
    if (!item) return;
    setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === id ? { ...g, status: 'generating' } : g) }));
    try {
      if (item.type === 'image') {
        const url = await generateFashionImage(
          customPrompt || item.prompt,
          state.backgroundPrompt, 
          state.posePrompt,
          state.newModelImage || state.modelImage,
          state.modelDescription,
          state.modelImage2,
          state.modelDescription2,
          state.peopleCount,
          state.productImageFront,
          state.productDescriptionFront,
          state.productImageBack,
          state.productDescriptionBack,
          state.poseImage,
          state.backgroundImages[0] || null,
          state.aspectRatio, 
          state.seed + Math.floor(Math.random() * 1000), 
          state.beautyConfig
        );
        setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === id ? { ...g, url, status: 'completed', prompt: customPrompt || g.prompt } : g) }));
      } else {
        const finalPrompt = customPrompt ? `${customPrompt}. Camera movement: ${state.videoFlowConfig.motion}.` : `${item.prompt}. Camera movement: ${state.videoFlowConfig.motion}.`;
        const url = await generateFashionVideo(finalPrompt, state.newModelImage || state.modelImage, state.aspectRatio === '1:1' ? '9:16' : state.aspectRatio);
        setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === id ? { ...g, url, status: 'completed', prompt: customPrompt || g.prompt } : g) }));
      }
    } catch (e) {
      setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === id ? { ...g, status: 'failed' } : g) }));
    } finally { setRefineMediaId(null); }
  };

  const handleDownloadSelected = async () => {
    const selected = state.generatedLibrary.filter(i => i.selected && i.status === 'completed');
    if (selected.length === 0) return;
    setIsZipping(true);
    try {
        const zip = new JSZip();
        for (const item of selected) {
            const res = await fetch(item.url);
            const blob = await res.blob();
            zip.file(`fashion-${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content as any);
        a.download = `fashion-studio-export-${Date.now()}.zip`;
        a.click();
    } catch (error) { console.error(error); } finally { setIsZipping(false); }
  };

  const handleStoryboardGeneration = async (prompts: Record<string, string>) => {
    const selectedImages = state.generatedLibrary.filter(i => i.selected && i.type === 'image' && i.status === 'completed');
    if (selectedImages.length === 0) return;
    setState(prev => ({ ...prev, isGenerating: true, showStoryboardModal: false, activeTab: 'video' }));
    const tasks = selectedImages.map(async (item) => {
      const promptText = prompts[item.id] || `${state.prompt}. Cinematic movement.`;
      const tempId = `vid-sb-${Date.now()}-${item.id}`;
      const placeholder: GeneratedMedia = { id: tempId, type: 'video', url: '', prompt: promptText, createdAt: Date.now(), selected: false, status: 'generating' };
      setState(prev => ({ ...prev, generatedLibrary: [placeholder, ...prev.generatedLibrary] }));
      try {
        const url = await generateFashionVideo(promptText, item.url, state.aspectRatio === '1:1' ? '9:16' : state.aspectRatio);
        setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === tempId ? { ...g, url, status: 'completed' } : g) }));
      } catch (e) {
        setState(prev => ({ ...prev, generatedLibrary: prev.generatedLibrary.map(g => g.id === tempId ? { ...g, status: 'failed' } : g) }));
      }
    });
    Promise.allSettled(tasks).finally(() => setState(prev => ({ ...prev, isGenerating: false })));
  };

  const refiningItem = state.generatedLibrary.find(i => i.id === refineMediaId);

  return (
    <div className="flex h-screen w-screen bg-[#0b0c15] text-white overflow-hidden font-sans">
      <Step1_Staging 
        peopleCount={state.peopleCount}
        setPeopleCount={n => setState(p => ({ ...p, peopleCount: n }))}
        modelPreview={state.modelPreviewUrl}
        modelDescription={state.modelDescription}
        isAnalyzingModel={state.isAnalyzingModel}
        onModelUpload={f => {
            const url = URL.createObjectURL(f as any);
            setState(p => ({ ...p, modelImage: f, modelPreviewUrl: url, modelDescription: '' }));
            handleAnalyzeModel(1, f);
        }}
        onRemoveModel={() => setState(p => ({ ...p, modelImage: null, modelPreviewUrl: null, modelDescription: '' }))}
        onAnalyzeModel={() => handleAnalyzeModel(1)}
        setModelDescription={s => setState(p => ({ ...p, modelDescription: s }))}

        modelPreview2={state.modelPreviewUrl2}
        modelDescription2={state.modelDescription2}
        isAnalyzingModel2={state.isAnalyzingModel2}
        onModelUpload2={f => {
            const url = URL.createObjectURL(f as any);
            setState(p => ({ ...p, modelImage2: f, modelPreviewUrl2: url, modelDescription2: '' }));
            handleAnalyzeModel(2, f);
        }}
        onRemoveModel2={() => setState(p => ({ ...p, modelImage2: null, modelPreviewUrl2: null, modelDescription2: '' }))}
        onAnalyzeModel2={() => handleAnalyzeModel(2)}
        setModelDescription2={s => setState(p => ({ ...p, modelDescription2: s }))}
        
        productPreviewFront={state.productPreviewUrlFront}
        productDescriptionFront={state.productDescriptionFront}
        isAnalyzingProductFront={state.isAnalyzingProductFront}
        onProductUploadFront={f => {
          setState(p => ({ ...p, productImageFront: f, productPreviewUrlFront: URL.createObjectURL(f as any), productDescriptionFront: '' }));
          handleAnalyzeProduct('front', f);
        }}
        setProductDescriptionFront={s => setState(p => ({ ...p, productDescriptionFront: s }))}
        onAnalyzeProductFront={() => handleAnalyzeProduct('front')}

        productPreviewBack={state.productPreviewUrlBack}
        productDescriptionBack={state.productDescriptionBack}
        isAnalyzingProductBack={state.isAnalyzingProductBack}
        onProductUploadBack={f => {
          setState(p => ({ ...p, productImageBack: f, productPreviewUrlBack: URL.createObjectURL(f as any), productDescriptionBack: '' }));
          handleAnalyzeProduct('back', f);
        }}
        setProductDescriptionBack={s => setState(p => ({ ...p, productDescriptionBack: s }))}
        onAnalyzeProductBack={() => handleAnalyzeProduct('back')}

        onRemoveProductFront={() => setState(p => ({ ...p, productImageFront: null, productPreviewUrlFront: null, productDescriptionFront: '' }))}
        onRemoveProductBack={() => setState(p => ({ ...p, productImageBack: null, productPreviewUrlBack: null, productDescriptionBack: '' }))}

        onSeparateOutfit={async () => {
            if (!state.modelImage) return;
            setState(p => ({ ...p, isSeparating: true }));
            try {
                const url = await extractClothing(state.modelImage);
                setState(p => ({ ...p, productImageFront: url, productPreviewUrlFront: url, productDescriptionFront: 'Tách từ mẫu' }));
            } finally { setState(p => ({ ...p, isSeparating: false })); }
        }}
        isSeparating={state.isSeparating}
        
        newModelPreview={state.newModelPreviewUrl}
        posePreview={state.poseImagePreviewUrl}
        onNewModelUpload={f => setState(p => ({ ...p, newModelImage: f, newModelPreviewUrl: URL.createObjectURL(f as any) }))}
        onPoseUpload={f => setState(p => ({ ...p, poseImage: f, poseImagePreviewUrl: URL.createObjectURL(f as any) }))}
        onRemoveNewModel={() => setState(p => ({ ...p, newModelImage: null, newModelPreviewUrl: null }))}
        onRemovePose={() => setState(p => ({ ...p, poseImage: null, poseImagePreviewUrl: null }))}
        
        backgroundImagePreviews={state.backgroundImagePreviewUrls}
        onBackgroundImageUpload={files => {
            const fs = Array.from(files);
            const urls = fs.map(f => URL.createObjectURL(f as any));
            setState(p => ({ ...p, backgroundImages: [...p.backgroundImages, ...fs], backgroundImagePreviewUrls: [...p.backgroundImagePreviewUrls, ...urls] }));
        }}
        onRemoveBackgroundImage={i => setState(p => ({ ...p, backgroundImages: p.backgroundImages.filter((_, idx) => idx !== i), backgroundImagePreviewUrls: p.backgroundImagePreviewUrls.filter((_, idx) => idx !== i) }))}
        
        posePrompt={state.posePrompt} setPosePrompt={s => setState(p => ({ ...p, posePrompt: s }))}
        selectedPosePrompts={state.selectedPosePrompts}
        onAddPosePrompt={s => setState(p => ({ ...p, selectedPosePrompts: [...p.selectedPosePrompts, s] }))}
        onAddAllPoses={poses => setState(p => ({ ...p, selectedPosePrompts: poses }))}
        onRemovePosePrompt={i => setState(p => ({ ...p, selectedPosePrompts: p.selectedPosePrompts.filter((_, idx) => idx !== i) }))}
        onClearPosePrompts={() => setState(p => ({ ...p, selectedPosePrompts: [] }))}
        
        prompt={state.prompt} setPrompt={s => setState(p => ({ ...p, prompt: s }))}
        bgPrompt={state.backgroundPrompt} setBgPrompt={s => setState(p => ({ ...p, backgroundPrompt: s }))}
        beautyConfig={state.beautyConfig} setBeautyConfig={bc => setState(p => ({ ...p, beautyConfig: bc }))}
        
        savedPresets={state.savedPresets}
        onSavePreset={n => setState(p => ({ ...p, savedPresets: [...p.savedPresets, { id: Date.now().toString(), name: n, prompt: state.prompt, bgPrompt: state.backgroundPrompt, posePrompt: state.posePrompt, aspectRatio: state.aspectRatio, seed: state.seed }] }))}
        onLoadPreset={id => {
            const p = state.savedPresets.find(x => x.id === id);
            if (p) setState(prev => ({ ...prev, prompt: p.prompt, backgroundPrompt: p.bgPrompt, posePrompt: p.posePrompt, aspectRatio: p.aspectRatio, seed: p.seed }));
        }}
        onDeletePreset={id => setState(p => ({ ...p, savedPresets: p.savedPresets.filter(x => x.id !== id) }))}
        promptHistory={state.promptHistory}
        onApplyHistory={e => setState(p => ({ ...p, prompt: e.prompt }))}
        onClearHistory={() => setState(p => ({ ...p, promptHistory: [] }))}
        
        savedAssets={state.savedAssets}
        onSaveAsset={async (type: 'model' | 'pose', input: File | string | null) => {
            if (!input) return;
            const url = typeof input === 'string' ? input : URL.createObjectURL(input as any);
            let thumb = undefined;
            if (type === 'model' && input instanceof File) thumb = await createFaceAvatar(input) || undefined;
            const asset: SavedAsset = { id: Date.now().toString(), type, url, thumbnail: thumb, createdAt: Date.now() };
            setState(p => {
                const next = [asset, ...p.savedAssets];
                localStorage.setItem('fashion_assets', JSON.stringify(next));
                return { ...p, savedAssets: next };
            });
        }}
        onDeleteAsset={id => setState(p => {
            const next = p.savedAssets.filter(a => a.id !== id);
            localStorage.setItem('fashion_assets', JSON.stringify(next));
            return { ...p, savedAssets: next };
        })}
        onSelectAsset={a => {
            if (a.type === 'model') setState(p => ({ ...p, newModelImage: a.url, newModelPreviewUrl: a.url }));
            else setState(p => ({ ...p, poseImage: a.url, poseImagePreviewUrl: a.url }));
        }}
      />
      <Step2_Controls 
        aspectRatio={state.aspectRatio} setAspectRatio={ar => setState(p => ({ ...p, aspectRatio: ar }))}
        generationMode={state.generationMode} setGenerationMode={m => setState(p => ({ ...p, generationMode: m }))}
        videoFlowConfig={state.videoFlowConfig} setVideoFlowConfig={c => setState(p => ({ ...p, videoFlowConfig: c }))}
        onGenerateImage={handleGenerateImage} onGenerateVideo={handleGenerateVideo}
        isGenerating={state.isGenerating} onGenerateBackgroundVideo={() => {}} isGeneratingBackgroundVideo={false}
        seed={state.seed} setSeed={s => setState(p => ({ ...p, seed: s }))}
        variationCount={state.variationCount} setVariationCount={n => setState(p => ({ ...p, variationCount: n }))}
        totalBatchCount={state.variationCount}
      />
      <Step3_Gallery 
        library={state.generatedLibrary}
        onDelete={ids => setState(p => ({ ...p, generatedLibrary: p.generatedLibrary.filter(i => !ids.includes(i.id)) }))}
        onSelect={id => setState(p => ({ ...p, generatedLibrary: p.generatedLibrary.map(i => i.id === id ? { ...i, selected: !i.selected } : i) }))}
        activeTab={state.activeTab} setActiveTab={t => setState(p => ({ ...p, activeTab: t }))}
        onOpenStoryboard={() => setState(p => ({ ...p, showStoryboardModal: true }))}
        onPreview={id => setState(p => ({ ...p, previewMediaId: id }))}
        onDownload={item => {
            const a = document.createElement('a');
            a.href = item.url;
            a.download = `fashion-${item.id}.${item.type === 'video' ? 'mp4' : 'png'}`;
            a.click();
        }}
        onSelectAll={t => setState(p => ({ ...p, generatedLibrary: p.generatedLibrary.map(i => i.type === t ? { ...i, selected: true } : i) }))}
        onDownloadSelected={handleDownloadSelected}
        onGrokMotion={async item => {
            setState(p => ({ ...p, analyzingMediaIds: [...p.analyzingMediaIds, item.id] }));
            const suggestions = await analyzeImageForVideoPrompts(item.url);
            setState(p => ({ ...p, suggestedPrompts: { ...p.suggestedPrompts, [item.id]: suggestions }, analyzingMediaIds: p.analyzingMediaIds.filter(id => id !== item.id) }));
        }}
        previewMediaId={state.previewMediaId} analyzingMediaIds={state.analyzingMediaIds}
        onRetry={handleRetryMedia}
        onRefine={id => setRefineMediaId(id)}
        isZipping={isZipping}
      />
      <StoryboardModal
        isOpen={state.showStoryboardModal} onClose={() => setState(p => ({ ...p, showStoryboardModal: false }))}
        selectedImages={state.generatedLibrary.filter(i => i.selected && i.type === 'image' && i.status === 'completed')}
        onGenerate={handleStoryboardGeneration} isGenerating={state.isGenerating}
        initialPrompts={state.videoPrompts} suggestedPrompts={state.suggestedPrompts}
      />
      <RetryPromptModal
        isOpen={!!refineMediaId}
        onClose={() => setRefineMediaId(null)}
        initialPrompt={refiningItem?.prompt || ""}
        onConfirm={(newPrompt) => refineMediaId && handleRetryMedia(refineMediaId, newPrompt)}
        isGenerating={state.generatedLibrary.find(i => i.id === refineMediaId)?.status === 'generating'}
      />
    </div>
  );
};

export default App;
