import { useNavigate } from 'react-router-dom';
import '../../styles/research/ResearchDetailHeader.css';

const ResearchDetailHeader = () => {
  const navigate = useNavigate();
  return (
    <button className="btn-back" onClick={() => navigate("/penelitian")}>
      <i className="bi bi-arrow-left"></i>
      Kembali ke Daftar
    </button>
  );
};

export default ResearchDetailHeader;

