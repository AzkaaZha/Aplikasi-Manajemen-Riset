import { aiApiClient } from "./axiosClient";

/**
 * Helper to summarize document context into essential fields only.
 * @param {Object} formData - Full document form data
 * @param {string} documentType - proposal, kemajuan, or akhir
 */
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

  // Clean up empty fields to keep payload small
  return Object.fromEntries(
    Object.entries(context).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
  );
};

/**
 * Send chat message to AI backend.
 * @param {string} message - User message
 * @param {Object} context - Summarized document context
 * @param {Array} history - Chat history [{text, isAi}, ...]
 */
export const chatWithAi = async (message, context = {}, history = []) => {
  try {
    // Transform frontend history format to backend format if necessary
    // Backend expects history as a list of message objects
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
