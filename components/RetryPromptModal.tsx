
import React, { useState, useEffect } from 'react';

interface RetryPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  onConfirm: (newPrompt: string) => void;
  isGenerating: boolean;
}

const RetryPromptModal: React.FC<RetryPromptModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  onConfirm,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (isOpen) setPrompt(initialPrompt);
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#11121d] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1b26]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="fas fa-edit text-cyan-400"></i> Tùy chỉnh & Tạo lại
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <p className="text-[10px] text-gray-400 italic">Chỉnh sửa mô tả bên dưới để AI cải thiện hình ảnh này (Ví dụ: thêm "mắt nhìn thẳng", "nụ cười rạng rỡ hơn", "ánh sáng vàng ấm"...)</p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-sm text-gray-200 focus:border-cyan-500 outline-none resize-none"
            placeholder="Nhập mô tả mới..."
          />
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-gray-800 text-white text-xs font-bold hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              onClick={() => onConfirm(prompt)}
              disabled={isGenerating || !prompt.trim()}
              className="flex-2 px-8 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold hover:shadow-[0_0_15px_rgba(8,145,178,0.4)] transition disabled:opacity-50"
            >
              {isGenerating ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync mr-2"></i>}
              TẠO LẠI NGAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetryPromptModal;
