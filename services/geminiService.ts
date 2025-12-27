
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BeautyConfig } from "../types";

export const ensureVeoKey = async () => {
  if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
};

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const processFileForGemini = (file: File | string, maxDimension = 1536): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const processImage = (src: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve({ mimeType: 'image/jpeg', data: dataUrl.split(',')[1] });
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = src;
    };
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => processImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      processImage(file);
    }
  });
};

export const analyzeModelImage = async (fileOrUrl: File | string): Promise<string> => {
  const ai = getAiClient();
  try {
    const imgData = await processFileForGemini(fileOrUrl);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: imgData },
          { text: "Role: Professional Casting Director. Task: Analyze the person. Output: Gender, Age, Ethnicity, Hair Style/Color, Key Facial Features. Focus ONLY on physical identity. Do NOT describe clothes. Under 40 words." }
        ]
      }
    });
    return response.text?.trim() || "Không thể phân tích mẫu.";
  } catch (error) {
    console.error("Analysis error:", error);
    return "Lỗi phân tích mẫu.";
  }
};

export const analyzeProductImage = async (fileOrUrl: File | string): Promise<string> => {
  const ai = getAiClient();
  try {
    const imgData = await processFileForGemini(fileOrUrl);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: imgData },
          { text: "Role: Technical Fashion Auditor. Task: Extract technical garment specs. Count buttons precisely. Define collar type exactly. Note textures/patterns. Format: 'Type: [Name]. Specs: [Count] buttons, [Collar], [Pockets]. Pattern: [Description]'. Focus on details that matter for reproduction." }
        ]
      }
    });
    return response.text?.trim() || "Không thể phân tích sản phẩm.";
  } catch (error) {
    console.error("Product analysis error:", error);
    return "Lỗi phân tích sản phẩm.";
  }
};

export const generateFashionImage = async (
  mainPrompt: string,
  bgPrompt: string,
  posePrompt: string,
  modelImage1: File | string | null,
  modelDescription1: string,
  modelImage2: File | string | null,
  modelDescription2: string,
  peopleCount: number,
  productImageFront: File | string | null,
  productDescriptionFront: string,
  productImageBack: File | string | null,
  productDescriptionBack: string,
  poseReferenceImage: File | string | null,
  backgroundImage: File | string | null,
  aspectRatio: '1:1' | '9:16' | '16:9',
  seed: number,
  beautyConfig?: BeautyConfig
): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = [];
  
  // 1. Model Reference
  if (modelImage1) {
    parts.push({ inlineData: await processFileForGemini(modelImage1) });
    parts.push({ text: `MODEL 1 BASE: ${modelDescription1}. Maintain facial structure.` });
  }
  if (modelImage2 && peopleCount === 2) {
    parts.push({ inlineData: await processFileForGemini(modelImage2) });
    parts.push({ text: `MODEL 2 BASE: ${modelDescription2}.` });
  }

  // 2. Technical Product Specs - CRITICAL FOR FIDELITY
  if (productImageFront) {
    parts.push({ inlineData: await processFileForGemini(productImageFront) });
    // This is the core update: treating description as absolute truth
    parts.push({ text: `TECHNICAL PRODUCT MASTER (FRONT): ${productDescriptionFront}. 
    MANDATORY RULE: You must follow the technical specs above over any visual intuition. If it says 3 buttons, you must render exactly 3 buttons. Collar must match the described type.` });
  }

  if (productImageBack) {
    parts.push({ inlineData: await processFileForGemini(productImageBack) });
    parts.push({ text: `TECHNICAL PRODUCT MASTER (BACK): ${productDescriptionBack}. Ensure back seams and details match.` });
  }
  
  if (poseReferenceImage) parts.push({ inlineData: await processFileForGemini(poseReferenceImage) });
  if (backgroundImage) parts.push({ inlineData: await processFileForGemini(backgroundImage) });

  const accStr = beautyConfig?.accessories.length 
    ? `MANDATORY ACCESSORIES: ${beautyConfig.accessories.join(", ")}. Ensure they are distinct and photorealistic.` 
    : "";

  // 3. Final Orchestration
  const mainInstruction = `
    ACTION: Professional Fashion Photography Generation.
    
    GARMENT INTEGRATION (PRIORITY 1): 
    Transfer the provided product onto the model. 
    Front details: ${productDescriptionFront}
    Back details: ${productDescriptionBack}
    Rule: Absolute structural fidelity. No hallucinations of buttons or collars.
    
    STYLING & BEAUTY:
    Gender: ${beautyConfig?.gender}. Hair: ${beautyConfig?.hairStyle} (${beautyConfig?.hairColor}).
    ${accStr}
    
    SCENE & POSE:
    Setting: ${bgPrompt}. 
    Pose: ${posePrompt}.
    Vibe: ${mainPrompt}.
    
    NEGATIVE CONSTRAINTS: 
    extra fingers, twisted legs, overlapping fabric, blurry logos, missing buttons, wrong collar, glasses merging with face, distorted watch, text, watermark.
    
    OUTPUT: 8k photorealistic, cinematic lighting, ultra-detailed fabric.
  `;
  
  parts.push({ text: mainInstruction });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio }, seed }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Generation failed");
};

export const generateFashionVideo = async (
  prompt: string,
  imageInput: File | string | null,
  aspectRatio: '9:16' | '16:9'
): Promise<string> => {
  await ensureVeoKey();
  const ai = getAiClient();
  let imagePart = undefined;
  if (imageInput) {
    const data = await processFileForGemini(imageInput);
    imagePart = { imageBytes: data.data, mimeType: data.mimeType };
  }
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    ...(imagePart && { image: imagePart }),
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
  });
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video failed");
  const res = await fetch(`${uri}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const extractClothing = async (modelImage: File): Promise<string> => {
  const ai = getAiClient();
  const imgData = await processFileForGemini(modelImage);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: imgData },
        { text: "Ghost mannequin: Isolate clothing. Maintain all original technical details (buttons/collar) precisely." }
      ]
    }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Extraction failed");
};

export const createFaceAvatar = async (file: File): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const imgData = await processFileForGemini(file);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: imgData },
          { text: "Tight face crop for profile avatar." }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
};

export const analyzeImageForVideoPrompts = async (imageSrc: string): Promise<string[]> => {
  try {
    const ai = getAiClient();
    const imgData = await processFileForGemini(imageSrc);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: imgData },
          { text: "Generate 5 movement prompts based on this image. Focus on realistic fabric and lighting shifts." }
        ]
      }
    });
    return response.text?.split('\n').filter(l => l.trim().length > 5) || [];
  } catch (e) { return ["Slow cinematic pan"]; }
};

export const suggestPrompt = async (currentPrompt: string, type: 'main' | 'background' | 'pose' | 'video'): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve this fashion prompt for better realism: ${currentPrompt}`,
    });
    return response.text?.trim() || currentPrompt;
  } catch (e) { return currentPrompt; }
};
