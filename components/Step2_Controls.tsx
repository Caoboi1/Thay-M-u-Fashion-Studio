import React from 'react';
import { CameraMotion } from '../types';

interface Step2Props {
  aspectRatio: '9:16' | '16:9' | '1:1';
  setAspectRatio: (ar: '9:16' | '16:9' | '1:1') => void;
  
  generationMode: 'image' | 'video';
  setGenerationMode: (m: 'image' | 'video') => void;
  
  videoFlowConfig: { motion: CameraMotion; strength: number };
  setVideoFlowConfig: (config: { motion: CameraMotion; strength: number }) => void;

  onGenerateImage: () => void;
  onGenerateVideo: () => void; 
  isGenerating: boolean;

  onGenerateBackgroundVideo: () => void;
  isGeneratingBackgroundVideo: boolean;

  seed: number;
  setSeed: (n: number) => void;
  variationCount: number;
  setVariationCount: (n: number) => void;
  
  // New prop to show total count on button
  totalBatchCount: number;
}

const Step2_Controls: React.FC<Step2Props> = ({
  aspectRatio, setAspectRatio,
  generationMode, setGenerationMode,
  videoFlowConfig, setVideoFlowConfig,
  onGenerateImage,
  onGenerateVideo,
  isGenerating,
  onGenerateBackgroundVideo,
  isGeneratingBackgroundVideo,
  seed, setSeed,
  variationCount, setVariationCount,
  totalBatchCount
}) => {

  const handleMotionChange = (motion: CameraMotion) => {
      setVideoFlowConfig({ ...videoFlowConfig, motion });
  };

  const handleStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setVideoFlowConfig({ ...videoFlowConfig, strength: parseInt(e.target.value) });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c15] border-r border-gray-800 p-4 w-[300px] shrink-0">
      {/* Header */}
      <div className="mb-4 relative">
        <div className="absolute -right-2 -top-2 text-6xl font-black text-[#1a1b26] -z-10 select-none">2</div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30">
            <div className="text-[10px] text-cyan-300 font-bold mb-1 tracking-wider">BƯỚC 2</div>
            <h2 className="text-base font-bold text-white uppercase">Bảng điều khiển</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        
        {/* Mode Selector */}
        <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Chế độ Tạo</label>
            <div className="flex bg-[#1a1b26] p-1 rounded-md border border-gray-700">
                <button 
                    onClick={() => setGenerationMode('image')}
                    className={`flex-1 py-2 text-xs rounded flex items-center justify-center transition ${generationMode === 'image' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                >
                    <i className="fas fa-camera mr-2"></i> Photo Studio
                </button>
                <button 
                    onClick={() => setGenerationMode('video')}
                    className={`flex-1 py-2 text-xs rounded flex items-center justify-center transition ${generationMode === 'video' ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                >
                    <i className="fas fa-video mr-2"></i> Veo Flow
                </button>
            </div>
        </div>

        {/* Aspect Ratio */}
        <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Tỉ lệ khung hình</label>
            <div className="flex bg-[#1a1b26] p-1 rounded-md">
                {(['9:16', '16:9', '1:1'] as const).map((ar) => (
                    <button
                        key={ar}
                        onClick={() => setAspectRatio(ar)}
                        disabled={generationMode === 'video' && ar === '1:1'} 
                        className={`flex-1 py-1.5 text-xs rounded transition-all ${aspectRatio === ar ? 'bg-cyan-700 text-white shadow' : 'text-gray-500 hover:text-white'} ${generationMode === 'video' && ar === '1:1' ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        {ar === '9:16' && <i className="fas fa-mobile-alt mr-2"></i>}
                        {ar === '16:9' && <i className="fas fa-desktop mr-2"></i>}
                        {ar === '1:1' && <i className="fas fa-square mr-2"></i>}
                        {ar}
                    </button>
                ))}
            </div>
        </div>

        {/* Video Flow Controls */}
        {generationMode === 'video' && (
            <div className="bg-[#151620] p-3 rounded-lg border border-pink-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-wind text-pink-400"></i>
                    <span className="text-xs font-bold text-white uppercase">Video Flow (Chuyển động)</span>
                 </div>

                 <div className="grid grid-cols-3 gap-2 mb-4">
                     {[
                         { id: 'pan_left', icon: 'fas fa-arrow-left', label: 'Pan Trái' },
                         { id: 'pan_right', icon: 'fas fa-arrow-right', label: 'Pan Phải' },
                         { id: 'tilt_up', icon: 'fas fa-arrow-up', label: 'Tilt Lên' },
                         { id: 'tilt_down', icon: 'fas fa-arrow-down', label: 'Tilt Xuống' },
                         { id: 'zoom_in', icon: 'fas fa-search-plus', label: 'Zoom In' },
                         { id: 'zoom_out', icon: 'fas fa-search-minus', label: 'Zoom Out' },
                         { id: 'orbit', icon: 'fas fa-sync', label: 'Xoay' },
                         { id: 'none', icon: 'fas fa-stop', label: 'Tĩnh' },
                     ].map((opt) => (
                         <button
                            key={opt.id}
                            onClick={() => handleMotionChange(opt.id as CameraMotion)}
                            className={`flex flex-col items-center justify-center p-2 rounded border transition ${videoFlowConfig.motion === opt.id ? 'bg-pink-600 border-pink-400 text-white' : 'bg-[#1a1b26] border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}
                         >
                             <i className={`${opt.icon} text-xs mb-1`}></i>
                             <span className="text-[8px] uppercase font-bold">{opt.label}</span>
                         </button>
                     ))}
                 </div>

                 <div className="mb-1">
                     <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                         <span>Cường độ chuyển động</span>
                         <span className="text-white font-bold">{videoFlowConfig.strength}</span>
                     </div>
                     <input 
                        type="range" 
                        min="1" max="10" 
                        value={videoFlowConfig.strength}
                        onChange={handleStrengthChange}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                     />
                 </div>
            </div>
        )}

        {/* Seed & Variations */}
        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 mb-1 block">Seed</label>
                <div className="flex">
                    <input 
                        type="number" 
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value))}
                        className="w-full bg-[#151620] border border-gray-700 rounded-l p-1.5 text-xs text-gray-300 focus:outline-none"
                    />
                    <button 
                        onClick={() => setSeed(Math.floor(Math.random() * 100000))}
                        className="bg-[#2a2b36] border border-l-0 border-gray-700 rounded-r px-2 text-gray-400 hover:text-white"
                    >
                        <i className="fas fa-random text-xs"></i>
                    </button>
                </div>
            </div>
            {generationMode === 'image' && (
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 mb-1 block uppercase">Biến thể (Max 30)</label>
                    <div className="flex items-center bg-[#151620] border border-gray-700 rounded p-0.5">
                        <button 
                            onClick={() => setVariationCount(Math.max(1, variationCount - 1))}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-700 rounded transition"
                        >-</button>
                        <span className="flex-1 text-center text-xs text-white font-bold">{variationCount}</span>
                        <button 
                            onClick={() => setVariationCount(Math.min(30, variationCount + 1))}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-700 rounded transition"
                        >+</button>
                    </div>
                </div>
            )}
        </div>

      </div>

      {/* Main Generate Button */}
      <div className="pt-4 mt-2">
        <button 
            disabled={isGenerating}
            onClick={generationMode === 'image' ? onGenerateImage : onGenerateVideo}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all group overflow-hidden relative
            ${isGenerating 
                ? 'bg-gray-700 cursor-wait' 
                : generationMode === 'image' 
                    ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]' 
                    : 'bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]'}`}
        >
             {isGenerating ? (
                 <><i className="fas fa-spinner fa-spin mr-2"></i> ĐANG XỬ LÝ...</>
             ) : (
                 <div className="flex items-center gap-2">
                    {generationMode === 'image' ? (
                        <>
                            <i className="fas fa-sparkles"></i>
                            <span>TẠO {totalBatchCount > 1 ? `${totalBatchCount} ẢNH` : 'ẢNH'}</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-film"></i>
                            <span>TẠO VIDEO (FLOW)</span>
                        </>
                    )}
                    {totalBatchCount > 1 && !isGenerating && generationMode === 'image' && (
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Batch</span>
                    )}
                 </div>
             )}
             
             {!isGenerating && <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>}
        </button>
      </div>
    </div>
  );
};

export default Step2_Controls;