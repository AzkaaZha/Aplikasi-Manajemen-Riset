export const getDocuments = async (type) => {
  await new Promise((res) => setTimeout(res, 300));

  const safeType = type?.toString()?.toUpperCase?.();

  const data = {
    PROPOSAL: [
      { id: 1, nama: "Proposal AI", tanggal: "20 April 2026" },
    ],
    KEMAJUAN: [
      { id: 1, nama: "Laporan Progress AI", tanggal: "23 April 2026" },
    ],
    AKHIR: [
      { id: 1, nama: "Laporan Akhir AI", tanggal: "25 April 2026" },
    ],
  };

  return data[safeType] || [];
};