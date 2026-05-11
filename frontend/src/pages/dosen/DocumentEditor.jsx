import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../../lib/api';
import AiSidebar from '../../components/AiSidebar';
import { Bot, ArrowLeft, Check, ChevronRight, ChevronLeft } from 'lucide-react';

import StepSubstansi from './steps/StepSubstansi';
import StepResearchers from './steps/StepResearchers';
import StepPartners from './steps/StepPartners';
import StepSchedules from './steps/StepSchedules';
import StepBudgets from './steps/StepBudgets';
import StepOutputs from './steps/StepOutputs';

import StepPreview from './steps/StepPreview';
const WIZARD_STEPS = [
  { id: 'substansi', label: 'Data Inti' },
  { id: 'researchers', label: 'Pengusul' },
  { id: 'partners', label: 'Mitra' },
  { id: 'schedules', label: 'Jadwal' },
  { id: 'budgets', label: 'Anggaran' },
  { id: 'outputs', label: 'Luaran' },
  { id: 'preview', label: 'Selesai' }
];

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  
  const [fields, setFields] = useState([]);
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAiSidebar, setShowAiSidebar] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', content: 'Halo! Saya asisten AI Riset. Ada yang bisa saya bantu terkait dokumen ini?' }
  ]);

  useEffect(() => {
    fetchDocumentData();
  }, [id]);

  const fetchDocumentData = async () => {
    try {
      const [fieldsRes, contentsRes] = await Promise.all([
        documentApi.getFields(id),
        documentApi.getContents(id)
      ]);
      
      setFields(fieldsRes.data);
      
      const contentMap = {};
      contentsRes.data.forEach(item => {
        contentMap[item.template_field_id] = item.isi || '';
      });
      setContents(contentMap);
    } catch (error) {
      console.error('Failed to load document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (fieldId, value) => {
    setContents(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveSubstansi = async () => {
    setSaving(true);
    try {
      const items = Object.entries(contents).map(([fieldId, isi]) => ({
        template_field_id: parseInt(fieldId),
        isi
      }));
      await documentApi.saveContents(id, items);
      // alert('Data Inti berhasil disimpan!'); // Optional: removed for smoother UX
    } catch (error) {
      console.error('Save failed:', error);
      alert('Gagal menyimpan Data Inti.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      setSaving(true);
      await handleSaveSubstansi();
      navigate('/dosen/penelitian');
    } catch (error) {
      alert('Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      await handleSaveSubstansi();
    }
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = async (index) => {
    if (currentStep === 0 && index !== 0) {
      await handleSaveSubstansi();
    }
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat editor dokumen...</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] -m-6 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto bg-gray-50/50 relative flex flex-col">
          
          {/* Header & Stepper */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-8 py-4">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition"
                >
                  <ArrowLeft size={20} />
                  Kembali
                </button>
                {/* AI Button moved to FAB */}
              </div>

              <div className="flex items-center justify-between px-2">
                {WIZARD_STEPS.map((step, index) => {
                  const isActive = currentStep === index;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div 
                      key={step.id} 
                      onClick={() => handleStepClick(index)}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : 
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                        'bg-white border-gray-200 text-gray-400 group-hover:border-blue-300 group-hover:text-blue-400'
                      }`}>
                        {isCompleted ? <Check size={20} /> : <span className="text-sm font-bold">{index + 1}</span>}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Area Konten */}
          <div className="flex-1 max-w-4xl w-full mx-auto px-8 py-12">
            {currentStep === 0 && <StepSubstansi fields={fields} contents={contents} handleContentChange={handleContentChange} />}
            {currentStep === 1 && <StepResearchers documentId={id} />}
            {currentStep === 2 && <StepPartners documentId={id} />}
            {currentStep === 3 && <StepSchedules documentId={id} />}
            {currentStep === 4 && <StepBudgets documentId={id} />}
            {currentStep === 5 && <StepOutputs documentId={id} />}
            {currentStep === 6 && <StepPreview documentId={id} handleSaveSubstansi={handleSaveSubstansi} isSaving={saving} />}
          </div>

          {/* Navigasi Bawah */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition disabled:opacity-0"
              >
                <ChevronLeft size={20} /> Sebelumnya
              </button>
              
                <div className="flex items-center gap-3">
                  {currentStep === 0 && (
                    <button 
                      onClick={handleSaveSubstansi}
                      disabled={saving}
                      className="px-5 py-2.5 text-blue-600 bg-blue-50 font-medium rounded-xl hover:bg-blue-100 transition disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Sementara'}
                    </button>
                  )}
                  
                  {currentStep === WIZARD_STEPS.length - 1 ? (
                    <button
                      onClick={handleSaveAndExit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan & Keluar'} <Check size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
                    >
                      Selanjutnya <ChevronRight size={20} />
                    </button>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {showAiSidebar && (
        <AiSidebar 
          onClose={() => setShowAiSidebar(false)} 
          documentContext={contents} 
          messages={aiMessages}
          setMessages={setAiMessages}
        />
      )}

      {/* FAB AI Assistant - Only show if sidebar is closed */}
      {!showAiSidebar && (
        <button
          onClick={() => setShowAiSidebar(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title="Asisten AI"
        >
          <Bot size={28} />
        </button>
      )}
    </div>
  );
}
