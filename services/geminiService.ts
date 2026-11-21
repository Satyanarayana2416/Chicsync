
import { GoogleGenAI, Type } from "@google/genai";
import { languages, LanguageCode } from '../lib/translations';

export type ProductSuggestion = {
  itemName: string;
  amazonSearchQuery: string;
  flipkartSearchQuery: string;
};

export type PersonOutfitSuggestion = {
    personDescription: string;
    outfitDescription: string;
    productSuggestions: ProductSuggestion[];
};

export type AnalysisResult = {
  verdict: string;
  feedback: string;
  compatibilityScore?: number;
  suggestion?: string;
  colorSuggestions?: string;
  accessorySuggestions?: string;
  familyOutfitSuggestions?: PersonOutfitSuggestion[];
  productSuggestions?: ProductSuggestion[];
  stylingTips?: string;
  accessoryAdvice?: string;
  beautyTips?: string;
};

export type UserProfile = {
  name: string;
  age: number | null;
  location: string;
  favoriteColors: string;
  stylePreference: string;
  height: number | null;
  weight: number | null;
  bodyType: string;
  preferredFit: string;
};

const buildUserProfileContext = (userProfile: UserProfile | null): string => {
    if (!userProfile) return '';
    const parts: string[] = [];
    if (userProfile.name) parts.push(`- Name: ${userProfile.name}`);
    if (userProfile.age) parts.push(`- Age: ${userProfile.age}`);
    if (userProfile.location) parts.push(`- Location: ${userProfile.location}`);
    if (userProfile.height) parts.push(`- Height (cm): ${userProfile.height}`);
    if (userProfile.weight) parts.push(`- Weight (kg): ${userProfile.weight}`);
    if (userProfile.bodyType) parts.push(`- Body Type: ${userProfile.bodyType}`);
    if (userProfile.favoriteColors) parts.push(`- Favorite Colors: ${userProfile.favoriteColors}`);
    if (userProfile.stylePreference) parts.push(`- General Style Preference: ${userProfile.stylePreference}`);
    if (userProfile.preferredFit) parts.push(`- Preferred Clothing Fit: ${userProfile.preferredFit}`);
    return parts.length === 0 ? '' : `\n---\nUSER PROFILE CONTEXT:\n${parts.join('\n')}\n---\n`;
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const JSON_INSTRUCTION = `Return ONLY a raw JSON object. NO code blocks. NO conversational text like "Here is your analysis". Just the JSON.`;

const PROMPT_OUTFIT_SUGGESTION_FULL_OUTFIT = `You are an expert personal stylist and digital artist. 
1. IMAGE GENERATION: You MUST generate a photorealistic image showing the person from the photo wearing a completely new, stylish outfit.
2. JSON ANALYSIS: ${JSON_INSTRUCTION}
Keys: "compatibilityScore" (1-10), "verdict" (short title), "feedback" (detailed review), "colorSuggestions" (string), "accessorySuggestions" (string), "productSuggestions" (array of {itemName, amazonSearchQuery, flipkartSearchQuery}).`;

const PROMPT_OUTFIT_SUGGESTION_WITH_ITEM = `You are an expert personal stylist and digital artist. 
1. IMAGE GENERATION: You MUST generate a photorealistic image showing the person from the photo wearing the uploaded clothing item styled with matching pieces.
2. JSON ANALYSIS: ${JSON_INSTRUCTION}
Keys: "compatibilityScore" (1-10), "verdict" (short title), "feedback" (detailed review), "colorSuggestions" (string), "accessorySuggestions" (string), "productSuggestions" (array of {itemName, amazonSearchQuery, flipkartSearchQuery}).`;

const PROMPT_PAIR = `You are an expert personal stylist and digital artist. 
1. IMAGE GENERATION: You MUST generate a photorealistic image of the person from the face photo wearing both clothing items provided together.
2. JSON ANALYSIS: ${JSON_INSTRUCTION}
Keys: "compatibilityScore" (1-10), "verdict" (short title), "feedback" (detailed review), "suggestion" (string), "colorSuggestions" (string), "productSuggestions" (array of {itemName, amazonSearchQuery, flipkartSearchQuery}).`;

const PROMPT_SAREE = `You are an expert personal stylist and digital artist. 
1. IMAGE GENERATION: You MUST generate a photorealistic image of the person from the face photo wearing the provided saree perfectly draped.
2. JSON ANALYSIS: ${JSON_INSTRUCTION}
Keys: "compatibilityScore" (1-10), "verdict" (short title), "feedback" (detailed review), "suggestion" (string), "colorSuggestions" (string), "productSuggestions" (array of {itemName, amazonSearchQuery, flipkartSearchQuery}).`;

const PROMPT_FAMILY = `You are an expert family fashion coordinator. 
1. IMAGE GENERATION: You MUST generate a photorealistic image of the family members from the photo wearing coordinated, stylish outfits for the occasion.
2. JSON ANALYSIS: ${JSON_INSTRUCTION}
Keys: "verdict" (short title), "feedback" (summary), "familyOutfitSuggestions" (array of {personDescription, outfitDescription, productSuggestions}).`;

const PROMPT_STYLE_FROM_DESCRIPTION = `You are an expert personal stylist. 
1. IMAGE GENERATION: You MUST generate a photorealistic image of the person wearing an outfit exactly as described in the request.
2. JSON ANALYSIS: ${JSON_INSTRUCTION}
Keys: "verdict" (short title), "feedback" (detailed review), "productSuggestions" (array), "stylingTips" (string), "accessoryAdvice" (string), "beautyTips" (string).`;

const cleanJsonString = (raw: string): string => {
    // Aggressively strip everything that isn't the JSON object
    let cleaned = raw.trim();
    
    // Remove potential markdown wrappers
    cleaned = cleaned.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/g, '');
    
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
        return cleaned.substring(start, end + 1);
    }
    return cleaned;
};

const analyzeAndGenerateImage = async (prompt: string, images: File[], language: LanguageCode): Promise<{ analysis: AnalysisResult, generatedImage: string | null }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const imageParts = await Promise.all(images.map(fileToGenerativePart));
    const languageName = languages[language];
    
    const finalPrompt = `${prompt}\n\nIMPORTANT: Use ${languageName} for all text. You MUST provide an image and the raw JSON. NO PREAMBLE.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    ...imageParts,
                    { text: finalPrompt }
                ]
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4"
                }
            }
        });

        let analysis: AnalysisResult | null = null;
        let generatedImage: string | null = null;
        let rawText = "";

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImage = part.inlineData.data;
                } else if (part.text) {
                    rawText += part.text;
                }
            }
        }

        if (rawText) {
            try {
                const cleaned = cleanJsonString(rawText);
                analysis = JSON.parse(cleaned);
            } catch (e) {
                console.error("JSON parse failed. Raw text was:", rawText);
                // Attempt a second chance: search specifically for the feedback and verdict keys using regex if the whole block fails
                const feedbackMatch = rawText.match(/"feedback":\s*"([^"]+)"/);
                const verdictMatch = rawText.match(/"verdict":\s*"([^"]+)"/);
                
                analysis = {
                    verdict: verdictMatch ? verdictMatch[1] : "Style Analysis",
                    feedback: feedbackMatch ? feedbackMatch[1] : "The AI has generated your virtual try-on. Review the image for your custom recommendation."
                };
            }
        }

        if (!analysis) {
            analysis = {
                verdict: "Style Analysis",
                feedback: "The AI has analyzed your request. See the virtual try-on image below."
            };
        }

        return { analysis, generatedImage };
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("The fashion AI is experiencing high traffic. Please try again in a moment.");
    }
};

export const analyzeOutfitSuggestion = async (personImage: File, clothingImage: File | null, language: LanguageCode, userProfile: UserProfile | null): Promise<{ analysis: AnalysisResult, generatedImage: string | null }> => {
    const images: File[] = [personImage];
    const prompt = clothingImage ? PROMPT_OUTFIT_SUGGESTION_WITH_ITEM : PROMPT_OUTFIT_SUGGESTION_FULL_OUTFIT;
    if (clothingImage) images.push(clothingImage);
    const finalPrompt = `${buildUserProfileContext(userProfile)}\n${prompt}`;
    return analyzeAndGenerateImage(finalPrompt, images, language);
};

export const analyzePairCompatibility = async (faceImageFile: File, itemImageFile1: File, itemImageFile2: File, language: LanguageCode, userProfile: UserProfile | null): Promise<{ analysis: AnalysisResult, generatedImage: string | null }> => {
    const finalPrompt = `${buildUserProfileContext(userProfile)}\n${PROMPT_PAIR}`;
    return analyzeAndGenerateImage(finalPrompt, [faceImageFile, itemImageFile1, itemImageFile2], language);
};

export const analyzeSareeCompatibility = async (faceImageFile: File, sareeImageFile: File, language: LanguageCode, userProfile: UserProfile | null): Promise<{ analysis: AnalysisResult, generatedImage: string | null }> => {
    const finalPrompt = `${buildUserProfileContext(userProfile)}\n${PROMPT_SAREE}`;
    return analyzeAndGenerateImage(finalPrompt, [faceImageFile, sareeImageFile], language);
};

export const analyzeFamilyOutfit = async (imageFile: File, occasion: string, language: LanguageCode, userProfile: UserProfile | null): Promise<{ analysis: AnalysisResult, generatedImage: string | null }> => {
    const finalPrompt = `${buildUserProfileContext(userProfile)}\n${PROMPT_FAMILY}\nOccasion: ${occasion}`;
    return analyzeAndGenerateImage(finalPrompt, [imageFile], language);
};

export const analyzeStyleFromDescription = async (faceImageFile: File, description: string, language: LanguageCode, userProfile: UserProfile | null): Promise<{ analysis: AnalysisResult, generatedImage: string | null }> => {
    const finalPrompt = `${buildUserProfileContext(userProfile)}\n${PROMPT_STYLE_FROM_DESCRIPTION}\nRequest: ${description}`;
    return analyzeAndGenerateImage(finalPrompt, [faceImageFile], language);
};
