
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedMedia } from '../types';

interface Step3Props {
  library: GeneratedMedia[];
  onDelete: (ids: string[]) => void;
  onSelect: (id: string) => void;
  activeTab: 'image' | 'video';
  setActiveTab: (t: 'image' | 'video') => void;
  onOpenStoryboard: () => void;
  onPreview: (id: string | null) => void;
  onDownload: (item: GeneratedMedia) => void;
  onSelectAll: (type: 'image' | 'video') => void;
  onDownloadSelected: () => void;
  onGrokMotion: (item: GeneratedMedia) => void;
  previewMediaId: string | null;
  analyzingMediaIds: string[];
  onRetry: (id: string) => void;
  onRefine: (id: string) => void; // Thêm prop mới
  isZipping?: boolean;
}

const Step3_Gallery: React.FC<Step3Props> = ({
  library, onDelete, onSelect, activeTab, setActiveTab, onOpenStoryboard,
  onPreview, onDownload, onSelectAll, onDownloadSelected, onGrokMotion,
  previewMediaId, analyzingMediaIds, onRetry, onRefine, isZipping = false
}) => {
  const filteredLibrary = library.filter(item => item.type === activeTab);
  const sortedLibrary = [...filteredLibrary].sort((a, b) => b.createdAt - a.createdAt);
  const selectedCount = library.filter(i => i.selected).length;

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (previewMediaId) { setScale(1); setPos({ x: 0, y: 0 }); }
  }, [previewMediaId]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) return; 
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(1, prev + delta), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const previewItem = library.find(i => i.id === previewMediaId);

  return (
    <div className="flex flex-col h-full bg-[#0b0c15] flex-1 min-w-[320px] relative border-l border-gray-800">
      <div className="p-4 border-b border-gray-800 bg-[#0d0e1a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-layer-group text-xs"></i>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">Thư viện Kết quả</h2>
          </div>
          <div className="flex bg-[#1a1b26] p-1 rounded-lg border border-gray-700/50">
            <button onClick={() => setActiveTab('image')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition ${activeTab === 'image' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>ẢNH</button>
            <button onClick={() => setActiveTab('video')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition ${activeTab === 'video' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>VIDEO</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onSelectAll(activeTab)} className="flex-1 py-1.5 bg-[#1a1b26] border border-gray-700 rounded text-[9px] font-bold text-gray-400 hover:text-white transition">CHỌN HẾT</button>
            <button onClick={onDownloadSelected} disabled={selectedCount === 0 || isZipping} className={`flex-1 py-1.5 rounded text-[9px] font-bold transition flex items-center justify-center gap-2 ${selectedCount > 0 ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600' : 'bg-gray-800 text-gray-600'}`}>
                {isZipping ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-download"></i>} ZIP ({selectedCount})
            </button>
            <button onClick={() => onDelete(library.filter(i => i.selected).map(i => i.id))} disabled={selectedCount === 0} className={`flex-1 py-1.5 rounded text-[9px] font-bold transition bg-red-600/20 text-red-500 border border-red-600 disabled:opacity-30`}>XÓA</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sortedLibrary.map((item) => (
                <div key={item.id} className={`relative group rounded-xl overflow-hidden aspect-[9/16] bg-black border-2 transition-all cursor-pointer ${item.selected ? 'border-cyan-500 ring-4 ring-cyan-500/20' : 'border-gray-800 hover:border-gray-600'}`} onClick={() => item.status === 'completed' && onPreview(item.id)}>
                    {item.status === 'generating' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0e1a]">
                            <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                            <span className="text-[8px] font-black text-cyan-400 uppercase mt-2 animate-pulse">Dệt...</span>
                        </div>
                    ) : item.status === 'failed' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a0d0d] p-4 text-center">
                            <i className="fas fa-bolt-lightning text-red-500 mb-2"></i>
                            <button onClick={(e) => { e.stopPropagation(); onRetry(item.id); }} className="px-2 py-1 bg-red-600 text-white text-[8px] font-bold rounded">THỬ LẠI</button>
                        </div>
                    ) : (
                        <>
                            {item.type === 'image' ? <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <video src={item.url} className="w-full h-full object-cover" muted loop onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />}
                            
                            {/* Overlay controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div onClick={(e) => { e.stopPropagation(); onSelect(item.id); }} className={`w-5 h-5 rounded-full border flex items-center justify-center z-20 ${item.selected ? 'bg-cyan-500 border-cyan-500' : 'bg-black/20 border-white/40'}`}>
                                    {item.selected && <i className="fas fa-check text-[8px] text-white"></i>}
                                </div>
                                <div className="flex flex-col gap-1.5 items-end">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onRefine(item.id); }}
                                      className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
                                      title="Tùy chỉnh & Tạo lại"
                                    >
                                      <i className="fas fa-sync-alt text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
      </div>

      <div className="h-28 bg-[#0d0e1a] border-t border-gray-800 p-3 flex items-center gap-4 z-40 sticky bottom-0">
          <div className="flex-1 flex gap-2 overflow-x-auto h-full items-center custom-scrollbar">
              {library.filter(i => i.selected && i.type === 'image' && i.status === 'completed').map((item, idx) => (
                  <div key={item.id} className="relative h-20 w-14 shrink-0 rounded-lg border border-cyan-500/50 bg-black overflow-hidden">
                       <img src={item.url} className="w-full h-full object-cover" />
                       <div className="absolute top-0 left-0 bg-cyan-600 text-white text-[8px] px-1 font-bold">{idx + 1}</div>
                  </div>
              ))}
          </div>
          <button disabled={selectedCount === 0} onClick={onOpenStoryboard} className={`px-6 h-12 rounded-xl font-bold text-xs uppercase transition-all ${selectedCount > 0 ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:scale-105' : 'bg-gray-800 text-gray-600'}`}>TẠO PHIM</button>
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl" 
             onWheel={handleWheel}
             onMouseUp={() => setIsDragging(false)}
             onMouseLeave={() => setIsDragging(false)}
             onClick={() => onPreview(null)}>
            <div className="absolute top-4 right-4 z-[110] flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRefine(previewItem.id); }}
                  className="px-4 py-2 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-cyan-500 transition shadow-xl"
                >
                   <i className="fas fa-sync-alt"></i> TÙY CHỈNH & TẠO LẠI
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition border border-white/20"><i className="fas fa-times"></i></button>
            </div>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move" 
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onClick={e => e.stopPropagation()}>
                <div style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}>
                    {previewItem.type === 'image' ? <img src={previewItem.url} className="max-h-[85vh] max-w-[90vw] rounded shadow-2xl pointer-events-none" /> : <video src={previewItem.url} controls autoPlay className="max-h-[85vh] max-w-[90vw] rounded shadow-2xl" />}
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur p-2 rounded-full border border-white/10">
                    <button onClick={() => setScale(s => Math.max(1, s - 0.5))} className="w-8 h-8 rounded-full bg-white/10 text-white"><i className="fas fa-minus"></i></button>
                    <span className="text-white text-xs font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(5, s + 0.5))} className="w-8 h-8 rounded-full bg-white/10 text-white"><i className="fas fa-plus"></i></button>
                    <button onClick={() => onDownload(previewItem)} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full ml-2">TẢI VỀ</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Step3_Gallery;
