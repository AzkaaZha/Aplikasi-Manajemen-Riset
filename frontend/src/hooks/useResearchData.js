import { useState, useEffect, useCallback } from 'react';
import { 
  getResearchers, 
  createResearcher, 
  updateResearcher, 
  deleteResearcher,
  deleteResearch
} from '../api/researchApi';
import { documentApiClient } from '../api/axiosClient';


export const useResearchData = () => {
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [yearSort, setYearSort] = useState("Terbaru");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      
      const response = await documentApiClient.get('/researches/');
      const data = response.data;

      console.log('[useResearchData] Data penelitian dari /researches/:', data);

      
      
      const mappedData = data.map(research => {
        const status = (research.status_penelitian || '').toLowerCase() === 'selesai' ? 'Lengkap' : 'Draft';
        return {
          id: research.id,           
          penelitian_id: research.id, 
          researchId: research.id,    
          nama: research.judul_penelitian,
          tahun: research.tahun || new Date(research.created_at).getFullYear().toString(),
          status: status,
        };
      });

      console.log('[useResearchData] Mapped penelitian:', mappedData);
      setResearches(mappedData);
    } catch (err) {
      console.error('[useResearchData] Gagal mengambil daftar penelitian:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredResearches = researches
    .filter((item) => {
      const namaNormalized = (item.nama || '').toLowerCase();
      const matchesSearch = namaNormalized.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Semua Status' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const tahunA = parseInt(a.tahun) || 0;
      const tahunB = parseInt(b.tahun) || 0;
      if (yearSort === 'Terbaru') return tahunB - tahunA;
      if (yearSort === 'Terlama') return tahunA - tahunB;
      return 0;
    });

  return {
    researches: filteredResearches,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    yearSort,
    setYearSort,
    
    addResearch: async (data) => {
      const response = await documentApiClient.post('/researches/', {
        judul_penelitian: data.nama,
        tahun: data.tahun,
      });
      console.log('[addResearch] Penelitian baru dibuat:', response.data);
      await fetchData();
      return response.data;
    },
    
    editResearch: async (penelitianId, data) => {
      console.log('[editResearch] Mengupdate penelitian ID:', penelitianId);
      const response = await documentApiClient.put(`/researches/${penelitianId}`, {
        judul_penelitian: data.nama,
        tahun: data.tahun,
      });
      console.log('[editResearch] Penelitian diupdate:', response.data);
      await fetchData();
      return response.data;
    },
    
    removeResearch: async (penelitianId) => {
      console.log('[removeResearch] Menghapus penelitian ID:', penelitianId);
      await deleteResearch(penelitianId);
      
      await fetchData();
      console.log('[removeResearch] Data penelitian telah direfresh');
    },
    refreshData: fetchData
  };
};


export const useResearcherData = (documentId) => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!documentId) {
      setResearchers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getResearchers(documentId);
      setResearchers(data);
    } catch (err) {
      console.error("Gagal mengambil data peneliti:", err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addResearcher = async (data) => {
    if (!documentId) throw new Error("Document ID tidak ditemukan");
    const newResearcher = await createResearcher(documentId, data);
    setResearchers(prev => [...prev, newResearcher]);
    return newResearcher;
  };

  const editResearcher = async (researcherId, data) => {
    if (!documentId) throw new Error("Document ID tidak ditemukan");
    const updated = await updateResearcher(documentId, researcherId, data);
    setResearchers(prev => prev.map(r => r.id === updated.id ? updated : r));
    return updated;
  };

  const removeResearcher = async (researcherId) => {
    if (!documentId) throw new Error("Document ID tidak ditemukan");
    await deleteResearcher(documentId, researcherId);
    setResearchers(prev => prev.filter(r => r.id !== researcherId));
  };

  return {
    researchers,
    loading,
    addResearcher,
    editResearcher,
    removeResearcher,
    refreshData: fetchData
  };
};
