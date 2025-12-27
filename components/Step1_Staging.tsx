
import React, { useRef, useState } from 'react';
import { SavedPreset, PromptHistoryEntry, SavedAsset, BeautyConfig } from '../types';

interface Step1Props {
  peopleCount: 1 | 2;
  setPeopleCount: (n: 1 | 2) => void;

  // Model 1
  modelPreview: string | null;
  modelDescription: string;
  isAnalyzingModel: boolean;
  onModelUpload: (file: File) => void;
  onRemoveModel: () => void;
  onAnalyzeModel: () => void;
  setModelDescription: (s: string) => void;

  // Model 2
  modelPreview2: string | null;
  modelDescription2: string;
  isAnalyzingModel2: boolean;
  onModelUpload2: (file: File) => void;
  onRemoveModel2: () => void;
  onAnalyzeModel2: () => void;
  setModelDescription2: (s: string) => void;

  // Product Front
  productPreviewFront: string | null;
  productDescriptionFront: string;
  isAnalyzingProductFront: boolean;
  onProductUploadFront: (file: File) => void;
  setProductDescriptionFront: (s: string) => void;
  onAnalyzeProductFront: () => void;

  // Product Back
  productPreviewBack: string | null;
  productDescriptionBack: string;
  isAnalyzingProductBack: boolean;
  onProductUploadBack: (file: File) => void;
  setProductDescriptionBack: (s: string) => void;
  onAnalyzeProductBack: () => void;

  onRemoveProductFront: () => void;
  onRemoveProductBack: () => void;

  onSeparateOutfit: () => void;
  isSeparating: boolean;

  newModelPreview: string | null;
  posePreview: string | null;
  onNewModelUpload: (file: File) => void;
  onPoseUpload: (file: File) => void;
  onRemoveNewModel: () => void;
  onRemovePose: () => void;
  
  backgroundImagePreviews: string[];
  onBackgroundImageUpload: (files: FileList) => void;
  onRemoveBackgroundImage: (index: number) => void;

  posePrompt: string;
  setPosePrompt: (s: string) => void;
  selectedPosePrompts: string[];
  onAddPosePrompt: (s: string) => void;
  onAddAllPoses: (poses: string[]) => void;
  onRemovePosePrompt: (index: number) => void;
  onClearPosePrompts: () => void;

  prompt: string;
  setPrompt: (s: string) => void;
  bgPrompt: string;
  setBgPrompt: (s: string) => void;

  beautyConfig: BeautyConfig;
  setBeautyConfig: (config: BeautyConfig) => void;

  savedPresets: SavedPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;

  promptHistory: PromptHistoryEntry[];
  onApplyHistory: (entry: PromptHistoryEntry) => void;
  onClearHistory: () => void;

  savedAssets: SavedAsset[];
  onSaveAsset: (type: 'model' | 'pose', fileOrUrl: File | string | null) => void;
  onDeleteAsset: (id: string) => void;
  onSelectAsset: (asset: SavedAsset) => void;
}

export const STANDING_POSES = [
    "Dáng Editorial (Tôn vinh cấu trúc): Chân đứng rộng, góc mặt nghiêng 45 độ, tay đặt hờ lên cổ áo để lộ chi tiết vải.",
    "Dáng Commercial (Thân thiện, rõ ràng): Đứng thẳng, một tay đút túi quần, nụ cười nhẹ, tập trung khoe form dáng toàn thân.",
    "Dáng Haute Couture (Nghệ thuật): Một chân khuỵu nhẹ, tay đưa cao tạo khối cho trang phục, tạo cảm giác sang trọng.",
    "Dáng Streetwear (Năng động): Dáng đứng phóng khoáng, một chân trụ, tay cầm phụ kiện, mắt nhìn thẳng tự tin.",
    "Dáng Catwalk Turn (Xoay người): Dáng quay lưng nhưng đầu ngoảnh lại, khoe trọn vẹn chi tiết mặt sau của sản phẩm.",
    "Dáng Minimalist (Tinh giản): Đứng nghiêng 3/4, hai tay chắp sau lưng, tập trung vào các đường cắt may tinh tế.",
    "Dáng Action Sport (Thể thao): Tư thế đang chuẩn bị chạy hoặc khởi động, tôn vinh độ co giãn và tính năng của vải.",
    "Dáng High-Fashion Sitting (Ngồi nghệ thuật): Ngồi vắt chân trên bục gỗ, tay thả lỏng, tạo chiều sâu cho bộ đồ.",
    "Dáng Soft Feminine (Dịu dàng): Tay chạm nhẹ vào tóc, một chân bước tới nhẹ nhàng, tạo sự thướt tha cho trang phục mỏng.",
    "Dáng Sharp Masculine (Góc cạnh): Vai mở rộng, cằm hơi hếch, tay chỉnh đồng hồ, làm nổi bật sự chỉn chu và quyền lực.",
    "Dáng Back-Focus Glance (Khoe mặt sau): Đứng quay lưng hoàn toàn, đầu ngoảnh nhẹ qua vai nhìn vào ống kính, khoe trọn chi tiết lưng áo.",
    "Dáng Walking Away (Bước đi xa): Dáng đi hướng vào bối cảnh, vai hơi nghiêng, tập trung vào cấu trúc phía sau của quần/váy.",
    "Dáng Over-the-Shoulder (Góc nhìn vai): Thân người quay 3/4 về phía sau, một tay đưa lên chạm cằm, khoe đường cắt vai và lưng.",
    "Dáng Hands on Hips Back (Nhấn eo sau): Quay lưng, hai tay đặt lên hông, làm nổi bật form dáng và các nếp gấp phía sau trang phục.",
    "Dáng Silhouette Profile (Dáng nghiêng): Đứng nghiêng hoàn toàn, tay buông thõng, khoe trọn độ dày và chi tiết cạnh bên của bộ đồ.",
    "Dáng Avant-Garde Twist (Xoắn người): Cơ thể xoắn nhẹ, tay đan chéo tạo những nếp gấp vải nghệ thuật, khoe tính chất của chất liệu.",
    "Dáng Red Carpet Glam (Sang trọng): Đứng thẳng, một chân bước nhẹ sang bên, tay cầm túi clutch, khoe vẻ lộng lẫy tổng thể.",
    "Dáng Urban Lean (Tựa tường): Tựa lưng vào một mặt phẳng ảo, chân vắt chéo, tạo cảm giác thoải mái nhưng cực kỳ fashion.",
    "Dáng Retro Vintage (Cổ điển): Tay đưa lên ngang ngực, góc mặt nhìn lên, tạo không khí của những thập niên 80-90.",
    "Dáng Techwear Shield (Hiện đại): Tư thế thủ, vai hơi gù nhẹ, tay chi trước ngực, làm nổi bật các chi tiết khóa kéo và túi hộp."
];

export const BACKGROUND_PRESETS = [
    "Công viên nắng, ánh sáng tự nhiên rực rỡ, bãi cỏ xanh mướt, cinematic outdoor lighting.",
    "Phố hiện đại, đường phố đô thị nhộn nhịp, tòa nhà cao tầng, street style photography.",
    "Bãi biển, cát trắng mịn, biển xanh trong vắt, nắng vàng, tropical holiday vibe.",
    "Quán Cafe, không gian vintage cozy, ánh đèn vàng ấm cúng, retro lifestyle.",
    "Sân vườn, kiến trúc biệt thự cao cấp, nhiều hoa cỏ trang trí, elegant garden setting.",
    "Sân diễn, ánh đèn sân khấu tập trung, runway atmosphere, fashion show style.",
    "Thư viện, kệ sách gỗ cổ điển, ánh sáng dịu nhẹ, academic aesthetic.",
    "Phòng sang trọng, nội thất cao cấp hiện đại, ánh sáng studio, luxury interior.",
    "Cánh đồng hoa, thảo nguyên mênh mông rực rỡ, bohemian breeze vibe.",
    "Tường gạch, phong cách urban industrial, gritty street photography style.",
    "Thành phố Neon, phong cách cyberpunk rực rỡ, ánh đèn màu sắc rực rỡ ban đêm.",
    "Bê tông, phong cách tối giản minimalist, kiến trúc brutalist hiện đại."
];

export const MALE_HAIR_STYLES = ["Tóc ngắn Side Part", "Tóc vuốt dựng", "Tóc Layer nam", "Đầu đinh", "Tóc Undercut", "Không tóc"];
export const FEMALE_HAIR_STYLES = ["Tóc dài thẳng", "Tóc xoăn sóng", "Tóc ngắn Bob", "Tóc búi cao", "Tóc tết", "Không tóc"];

export const HAIR_COLORS = ["Đen", "Nâu", "Vàng", "Khói", "Bạch kim"];
export const ACCESSORIES_LIST = [
  { name: "Kính mắt", icon: "glasses" },
  { name: "Mũ", icon: "hat-cowboy" },
  { name: "Balo", icon: "backpack" },
  { name: "Đồng hồ", icon: "clock" },
  { name: "Khuyên tai", icon: "gem" },
  { name: "Dây chuyền", icon: "link" },
  { name: "Túi xách", icon: "shopping-bag" },
  { name: "Cà vạt", icon: "user-tie" },
  { name: "Thắt lưng", icon: "band-aid" }
];

export const Step1_Staging: React.FC<Step1Props> = ({
  peopleCount, setPeopleCount,
  modelPreview, modelDescription, isAnalyzingModel, onModelUpload, onRemoveModel, onAnalyzeModel, setModelDescription,
  modelPreview2, modelDescription2, isAnalyzingModel2, onModelUpload2, onRemoveModel2, onAnalyzeModel2, setModelDescription2,
  productPreviewFront, productDescriptionFront, isAnalyzingProductFront, onProductUploadFront, setProductDescriptionFront, onAnalyzeProductFront,
  productPreviewBack, productDescriptionBack, isAnalyzingProductBack, onProductUploadBack, setProductDescriptionBack, onAnalyzeProductBack,
  onRemoveProductFront, onRemoveProductBack,
  onSeparateOutfit, isSeparating,
  newModelPreview, posePreview, onNewModelUpload, onPoseUpload, onRemoveNewModel, onRemovePose,
  backgroundImagePreviews, onBackgroundImageUpload, onRemoveBackgroundImage,
  posePrompt, setPosePrompt, selectedPosePrompts, onAddPosePrompt, onAddAllPoses, onRemovePosePrompt, onClearPosePrompts,
  prompt, setPrompt, bgPrompt, setBgPrompt,
  beautyConfig, setBeautyConfig,
  savedPresets, onSavePreset, onLoadPreset, onDeletePreset,
  promptHistory, onApplyHistory, onClearHistory,
  savedAssets, onSaveAsset, onDeleteAsset, onSelectAsset
}) => {
  const modelInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef2 = useRef<HTMLInputElement>(null);
  const productFrontRef = useRef<HTMLInputElement>(null);
  const productBackRef = useRef<HTMLInputElement>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, areaId: string) => { 
    e.preventDefault(); 
    setDragOverArea(areaId); 
  };
  
  const handleDragLeave = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setDragOverArea(null); 
  };

  const handleDrop = (e: React.DragEvent, type: 'model' | 'model2' | 'front' | 'back' | 'bg') => {
    e.preventDefault();
    setDragOverArea(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (type === 'model') onModelUpload(files[0]);
      else if (type === 'model2') onModelUpload2(files[0]);
      else if (type === 'front') onProductUploadFront(files[0]);
      else if (type === 'back') onProductUploadBack(files[0]);
      else if (type === 'bg') onBackgroundImageUpload(files);
    }
  };

  const currentHairList = beautyConfig.gender === 'Nam' ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES;

  const toggleAccessory = (acc: string) => {
    const next = beautyConfig.accessories.includes(acc) 
      ? beautyConfig.accessories.filter(a => a !== acc) 
      : [...beautyConfig.accessories, acc];
    setBeautyConfig({ ...beautyConfig, accessories: next });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c15] border-r border-gray-800 w-[380px] shrink-0 overflow-y-auto custom-scrollbar">
      <div className="p-4 bg-[#11121d] border-b border-gray-800 sticky top-0 z-10">
        <div className="text-[10px] text-purple-400 font-bold mb-1 tracking-widest uppercase">Thiết lập kịch bản</div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dàn dựng & Tủ đồ</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* 1. NGƯỜI MẪU GỐC */}
        <div className="bg-[#11121d] p-4 rounded-xl border border-gray-800 space-y-3">
          <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
            <i className="fas fa-user text-blue-400"></i> 1. Người mẫu
          </label>
          <div className="flex bg-[#1a1b26] p-1 rounded-md border border-gray-700 mb-2">
            <button onClick={() => setPeopleCount(1)} className={`flex-1 py-1.5 text-[10px] rounded font-bold transition ${peopleCount === 1 ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>1 Người</button>
            <button onClick={() => setPeopleCount(2)} className={`flex-1 py-1.5 text-[10px] rounded font-bold transition ${peopleCount === 2 ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>2 Người</button>
          </div>
          <div className="flex gap-3">
            <div 
              className={`relative w-24 aspect-[3/4] shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${dragOverArea === 'model' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 bg-[#0b0c15] hover:border-gray-600'}`} 
              onClick={() => modelInputRef.current?.click()}
              onDragOver={(e) => handleDragOver(e, 'model')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'model')}
            >
              {modelPreview ? <img src={modelPreview} className="w-full h-full object-cover rounded-lg" /> : <i className="fas fa-plus text-gray-600"></i>}
              <input type="file" ref={modelInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && onModelUpload(e.target.files[0])} accept="image/*" />
            </div>
            <textarea value={modelDescription} onChange={(e) => setModelDescription(e.target.value)} placeholder="Phân tích nhân dạng (Tuổi, giới tính, đặc điểm khuôn mặt)..." className="flex-1 h-24 bg-[#0b0c15] border border-gray-700 rounded-lg p-2 text-[11px] text-gray-300 outline-none resize-none focus:border-blue-500 transition" />
          </div>
          {peopleCount === 2 && (
            <div className="flex gap-3 pt-3 border-t border-gray-800">
                <div 
                  className={`relative w-24 aspect-[3/4] shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${dragOverArea === 'model2' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 bg-[#0b0c15] hover:border-gray-600'}`} 
                  onClick={() => modelInputRef2.current?.click()}
                  onDragOver={(e) => handleDragOver(e, 'model2')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'model2')}
                >
                  {modelPreview2 ? <img src={modelPreview2} className="w-full h-full object-cover rounded-lg" /> : <i className="fas fa-plus text-gray-600"></i>}
                  <input type="file" ref={modelInputRef2} className="hidden" onChange={(e) => e.target.files?.[0] && onModelUpload2(e.target.files[0])} accept="image/*" />
                </div>
                <textarea value={modelDescription2} onChange={(e) => setModelDescription2(e.target.value)} placeholder="Phân tích nhân dạng 2..." className="flex-1 h-24 bg-[#0b0c15] border border-gray-700 rounded-lg p-2 text-[11px] text-gray-300 outline-none resize-none focus:border-blue-500 transition" />
            </div>
          )}
        </div>

        {/* 2. SẢN PHẨM PHÂN TÍCH - OPTIMIZED FOR PRODUCT PROMPT INJECTION */}
        <div className="bg-[#11121d] p-4 rounded-xl border border-gray-800 space-y-4 shadow-xl ring-1 ring-white/5 overflow-hidden">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
              <i className="fas fa-microscope text-cyan-400"></i> 2. Sản phẩm (AI Master Tech)
            </label>
            <button onClick={onSeparateOutfit} className="text-[8px] bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded font-black hover:bg-cyan-600/40 transition">TÁCH TỪ MẪU</button>
          </div>
          
          <div className="p-2 bg-blue-900/20 border border-blue-500/20 rounded-lg">
             <p className="text-[8px] text-blue-300 font-bold uppercase tracking-tighter flex items-center gap-1.5 mb-1">
               <i className="fas fa-info-circle"></i> Quan trọng: Thông số chuẩn
             </p>
             <p className="text-[9px] text-gray-400 italic leading-tight">Mô tả chi tiết kỹ thuật (số cúc, kiểu cổ, túi) sẽ được AI ưu tiên xử lý để tạo ảnh chính xác 100%.</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div 
                className={`relative w-24 aspect-[3/4] shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${dragOverArea === 'front' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 bg-[#0b0c15] hover:border-gray-600'}`} 
                onClick={() => productFrontRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, 'front')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'front')}
              >
                {productPreviewFront ? <img src={productPreviewFront} className="w-full h-full object-cover rounded-lg" /> : <div className="text-center p-2"><i className="fas fa-camera text-gray-700 block mb-1"></i><span className="text-[7px] text-gray-600 uppercase font-bold">MẶT TRƯỚC</span></div>}
                <input type="file" ref={productFrontRef} className="hidden" onChange={(e) => e.target.files?.[0] && onProductUploadFront(e.target.files[0])} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1.5">
                   <span className="text-[7px] font-black bg-cyan-600 text-white px-1 rounded uppercase tracking-tighter">AI Input</span>
                   <span className="text-[8px] text-gray-500 font-bold uppercase">Mô tả Master (Front)</span>
                </div>
                <textarea 
                  value={productDescriptionFront} 
                  onChange={(e) => setProductDescriptionFront(e.target.value)} 
                  placeholder="Ví dụ: Áo 3 cúc trắng, cổ Mandarin dựng, vải linen sọc tăm..." 
                  className="w-full h-24 bg-[#0b0c15] border border-gray-700 rounded-lg p-2 text-[10px] text-gray-300 outline-none resize-none focus:border-cyan-500 transition-all font-mono leading-tight" 
                />
                {isAnalyzingProductFront && <div className="text-[8px] text-cyan-400 animate-pulse font-bold flex items-center gap-1"><i className="fas fa-spinner fa-spin"></i> Đang trích xuất cấu trúc áo...</div>}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-800/50">
            <div className="flex gap-3">
              <div 
                className={`relative w-24 aspect-[3/4] shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${dragOverArea === 'back' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 bg-[#0b0c15] hover:border-gray-600'}`} 
                onClick={() => productBackRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, 'back')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'back')}
              >
                {productPreviewBack ? <img src={productPreviewBack} className="w-full h-full object-cover rounded-lg" /> : <div className="text-center p-2"><i className="fas fa-camera text-gray-700 block mb-1"></i><span className="text-[7px] text-gray-600 uppercase font-bold">MẶT SAU</span></div>}
                <input type="file" ref={productBackRef} className="hidden" onChange={(e) => e.target.files?.[0] && onProductUploadBack(e.target.files[0])} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1.5">
                   <span className="text-[7px] font-black bg-cyan-600 text-white px-1 rounded uppercase tracking-tighter">AI Input</span>
                   <span className="text-[8px] text-gray-500 font-bold uppercase">Mô tả Master (Back)</span>
                </div>
                <textarea 
                  value={productDescriptionBack} 
                  onChange={(e) => setProductDescriptionBack(e.target.value)} 
                  placeholder="Ví dụ: Xẻ tà giữa, đường may đôi, không họa tiết..." 
                  className="flex-1 h-24 bg-[#0b0c15] border border-gray-700 rounded-lg p-2 text-[10px] text-gray-300 outline-none resize-none focus:border-cyan-500 transition-all font-mono leading-tight" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. BỐI CẢNH */}
        <div className="bg-[#11121d] p-4 rounded-xl border border-gray-800 space-y-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><i className="fas fa-image text-purple-400"></i> 3. Bối cảnh & Không gian</label>
          <div 
            className={`border-2 border-dashed p-3 rounded-lg transition-all ${dragOverArea === 'bg' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800'}`}
            onDragOver={(e) => handleDragOver(e, 'bg')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'bg')}
          >
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {BACKGROUND_PRESETS.map((bp) => (
                <button 
                  key={bp} 
                  onClick={() => setBgPrompt(bp)} 
                  className={`px-2 py-2 rounded-lg text-[9px] font-bold border transition-all text-center leading-tight ${bgPrompt === bp ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-[#1a1b26] border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}
                >
                  {bp.split(',')[0]}
                </button>
              ))}
            </div>
            <textarea value={bgPrompt} onChange={(e) => setBgPrompt(e.target.value)} className="w-full h-16 bg-[#0b0c15] border border-gray-700 rounded-lg p-2 text-xs text-gray-300 outline-none focus:border-purple-500 transition" placeholder="Mô tả bối cảnh..." />
          </div>
        </div>

        {/* 4. LÀM ĐẸP & PHỤ KIỆN */}
        <div className="bg-[#11121d] p-4 rounded-xl border border-gray-800 space-y-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><i className="fas fa-magic text-yellow-400"></i> 4. Làm đẹp & Phụ kiện</label>
          <div className="space-y-4">
            <div className="flex gap-2">
                {['Nam', 'Nữ'].map(g => (
                  <button key={g} onClick={() => setBeautyConfig({ ...beautyConfig, gender: g as 'Nam' | 'Nữ' })} className={`flex-1 py-1.5 rounded text-[10px] font-bold transition ${beautyConfig.gender === g ? 'bg-cyan-600 text-white shadow-lg' : 'bg-[#1a1b26] text-gray-500'}`}>{g}</button>
                ))}
            </div>

            <div>
              <span className="text-[9px] text-gray-500 uppercase block mb-2">Kiểu tóc</span>
              <div className="flex flex-wrap gap-1.5">
                {currentHairList.map(style => (
                  <button key={style} onClick={() => setBeautyConfig({ ...beautyConfig, hairStyle: style })} className={`px-2.5 py-1 rounded text-[8px] font-bold border transition ${beautyConfig.hairStyle === style ? 'bg-cyan-600 border-cyan-500 text-white shadow-md' : 'bg-[#1a1b26] border-gray-700 text-gray-500 hover:text-gray-300'}`}>{style}</button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 uppercase block mb-2">Màu tóc</span>
              <div className="flex flex-wrap gap-1.5">
                {HAIR_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => setBeautyConfig({ ...beautyConfig, hairColor: color })} 
                    className={`px-3 py-1 rounded-full text-[8px] font-black border-2 transition-all ${beautyConfig.hairColor === color ? 'bg-purple-600 border-purple-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110' : 'bg-[#1a1b26] border-gray-700 text-gray-500 hover:text-gray-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] text-gray-500 uppercase">Phụ kiện gợi ý</span>
                 {beautyConfig.accessories.length > 0 && <button onClick={() => setBeautyConfig({...beautyConfig, accessories: []})} className="text-[8px] text-red-400 font-bold hover:underline">XÓA HẾT</button>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACCESSORIES_LIST.map(acc => {
                  const isActive = beautyConfig.accessories.includes(acc.name);
                  return (
                    <button 
                      key={acc.name} 
                      onClick={() => toggleAccessory(acc.name)} 
                      className={`px-3 py-1.5 rounded text-[8px] font-bold border transition flex items-center gap-1.5 ${isActive ? 'bg-yellow-600 border-yellow-500 text-white shadow-md' : 'bg-[#1a1b26] border-gray-700 text-gray-500 hover:text-gray-300'}`}
                    >
                      <i className={`fas fa-${acc.icon} text-[9px]`}></i>
                      {acc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5. DÁNG MẪU FASHION */}
        <div className="pb-10">
           <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><i className="fas fa-person-walking text-orange-400"></i> 5. Dáng mẫu Fashion</label>
              <div className="flex gap-1">
                  <button onClick={() => onAddAllPoses(STANDING_POSES)} className="text-[8px] bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded font-bold hover:bg-orange-600/30">CHỌN HẾT</button>
                  <button onClick={onClearPosePrompts} className="text-[8px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded font-bold hover:bg-red-600/30">XÓA</button>
              </div>
           </div>
           <div className="flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar p-2 bg-[#11121d] rounded-xl border border-gray-800">
               {STANDING_POSES.map((pose, idx) => {
                   const isSelected = selectedPosePrompts.includes(pose);
                   return (
                   <div key={idx} onClick={() => isSelected ? onRemovePosePrompt(selectedPosePrompts.indexOf(pose)) : onAddPosePrompt(pose)} className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-orange-600/10 border-orange-500/50' : 'bg-[#151620] border-gray-800 hover:border-gray-700'}`}>
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-600'}`}>{isSelected && <i className="fas fa-check text-[8px] text-white"></i>}</div>
                       <span className={`text-[10px] ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>{pose}</span>
                   </div>
               )})}
           </div>
        </div>
      </div>
    </div>
  );
};
