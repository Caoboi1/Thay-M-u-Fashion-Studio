
import React, { useState } from 'react';
import { GeneratedMedia } from '../types';
import { suggestPrompt } from '../services/geminiService';

interface StoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: GeneratedMedia[];
  onGenerate: (prompts: Record<string, string>) => void;
  isGenerating: boolean;
  initialPrompts?: Record<string, string>;
  suggestedPrompts?: Record<string, string[]>;
}

const StoryboardModal: React.FC<StoryboardModalProps> = ({
  isOpen,
  onClose,
  selectedImages,
  onGenerate,
  isGenerating,
  initialPrompts = {},
  suggestedPrompts = {}
}) => {
  const [prompts, setPrompts] = useState<Record<string, string>>(initialPrompts);

  // Sync with initial prompts when modal opens
  React.useEffect(() => {
      setPrompts(prev => ({...initialPrompts, ...prev}));
  }, [initialPrompts, isOpen]);

  if (!isOpen) return null;

  const handlePromptChange = (id: string, text: string) => {
    setPrompts(prev => ({ ...prev, [id]: text }));
  };

  const handleSuggest = async (id: string) => {
      const current = prompts[id] || "Cinematic fashion shot with smooth camera movement.";
      const suggestion = await suggestPrompt(current, 'main'); // Use main context for general video prompt
      handlePromptChange(id, suggestion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-[#0b0c15] border border-gray-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-[#11121d] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fas fa-clapperboard text-cyan-400"></i> Director's Cut: Tạo Video Storyboard
            </h2>
            <p className="text-xs text-gray-400 mt-1">Xem lại các cảnh và prompt. Các prompt này sẽ được dùng để tạo video cho từng cảnh tương ứng.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 text-white transition">
              <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0e0f18]">
            {selectedImages.map((item, index) => {
                const suggestions = suggestedPrompts[item.id] || [];
                return (
                <div key={item.id} className="flex gap-4 p-4 bg-[#151620] rounded-xl border border-gray-800">
                    <div className="relative w-32 aspect-[9/16] shrink-0 rounded-lg overflow-hidden border border-gray-700">
                         <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 rounded">{index + 1}</span>
                         <img src={item.url} className="w-full h-full object-cover" alt={`Scene ${index + 1}`} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between mb-2">
                             <label className="text-xs font-bold text-gray-400 uppercase">Prompt cho Cảnh {index + 1}</label>
                             <div className="flex gap-2">
                                <button className="text-gray-500 hover:text-white transition"><i className="fas fa-trash"></i></button>
                             </div>
                        </div>
                        
                        {/* Prompt Input */}
                        <textarea 
                            value={prompts[item.id] || ""}
                            onChange={(e) => handlePromptChange(item.id, e.target.value)}
                            placeholder="Mô tả chuyển động, cảm xúc, góc máy... (VD: Người mẫu chuyển động nhẹ nhàng, quay cận cảnh biểu cảm khuôn mặt, cinematic style)"
                            className="flex-1 w-full bg-[#0b0c15] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:border-cyan-500 focus:outline-none resize-none mb-2"
                        />

                        {/* Suggestions Dropdown if available */}
                        {suggestions.length > 0 && (
                            <div className="mb-2">
                                <label className="text-[10px] text-purple-400 font-bold mb-1 block">
                                    <i className="fas fa-bolt mr-1"></i> Grok Suggestions (Chọn để áp dụng):
                                </label>
                                <select 
                                    className="w-full bg-[#1a1b26] border border-purple-500/30 rounded text-[10px] text-gray-300 p-1.5 focus:border-purple-500 outline-none cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.value) handlePromptChange(item.id, e.target.value);
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>-- Chọn kịch bản chuyển động --</option>
                                    {suggestions.map((s, i) => (
                                        <option key={i} value={s}>{i + 1}. {s.substring(0, 80)}...</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button 
                                onClick={() => handleSuggest(item.id)}
                                className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                            >
                                <i className="fas fa-sparkles"></i> AI Refine Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )})}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#11121d] flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700">
                Hủy
            </button>
             <button 
                onClick={() => onGenerate(prompts)}
                disabled={isGenerating}
                className="px-6 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
                {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-film"></i>}
                Tạo {selectedImages.length} Video
            </button>
        </div>

      </div>
    </div>
  );
};

export default StoryboardModal;
