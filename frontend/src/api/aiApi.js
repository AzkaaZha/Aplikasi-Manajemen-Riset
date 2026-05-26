import { aiApiClient } from "./axiosClient";


export const formatAiContext = (formData, documentType) => {
  if (!formData) return {};

  const context = {
    document_type: documentType,
    judul: formData.judul_dokumen || formData.judul_penelitian || "",
    ringkasan: formData.ringkasan || "",
    latar_belakang: formData.latar_belakang || "",
    metode: formData.metode_penelitian || "",
    hasil_penelitian: formData.hasil_penelitian || formData.ringkasan_kemajuan || "",
    kata_kunci: formData.kata_kunci || "",
  };

  
  return Object.fromEntries(
    Object.entries(context).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );
};


export const chatWithAi = async (message, context = {}, history = []) => {
  try {
    
    
    const formattedHistory = history.map(msg => ({
      role: msg.isAi ? "assistant" : "user",
      content: msg.text
    }));

    const response = await aiApiClient.post("/ai/chat", {
      message,
      context,
      history: formattedHistory
    });

    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
