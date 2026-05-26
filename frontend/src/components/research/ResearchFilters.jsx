import React, { useState, useRef, useEffect } from "react";

function ResearchFilters({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, yearSort, setYearSort }) {
  const [openFilter, setOpenFilter] = useState(null); 
  const statusRef = useRef(null);
  const yearRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target) &&
          yearRef.current && !yearRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStatus = (value) => {
    setStatusFilter(value);
    setOpenFilter(null);
  };

  const handleSelectYear = (value) => {
    setYearSort(value);
    setOpenFilter(null);
  };

  return (
    <div className="research-filter-section">
      {}
      <div className="search-bar-group">
        <i className="bi bi-search"></i>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Cari judul penelitian..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {}
      <div className="filter-actions">
        
        {}
        <div className="custom-filter-dropdown" ref={statusRef}>
          <div 
            className={`filter-trigger ${openFilter === 'status' ? 'active' : ''}`}
            onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
          >
            <span>{statusFilter}</span>
            <i className="bi bi-chevron-down"></i>
          </div>
          {openFilter === 'status' && (
            <div className="filter-dropdown-menu">
              <div className="filter-dropdown-item" onClick={() => handleSelectStatus("Semua Status")}>Semua Status</div>
              <div className="filter-dropdown-item" onClick={() => handleSelectStatus("Draft")}>Draft</div>
              <div className="filter-dropdown-item" onClick={() => handleSelectStatus("Lengkap")}>Lengkap</div>
            </div>
          )}
        </div>

        {}
        <div className="custom-filter-dropdown" ref={yearRef}>
          <div 
            className={`filter-trigger ${openFilter === 'year' ? 'active' : ''}`}
            onClick={() => setOpenFilter(openFilter === 'year' ? null : 'year')}
          >
            <span>{yearSort === "Terbaru" ? "Tahun Terbaru" : "Tahun Terlama"}</span>
            <i className="bi bi-chevron-down"></i>
          </div>
          {openFilter === 'year' && (
            <div className="filter-dropdown-menu">
              <div className="filter-dropdown-item" onClick={() => handleSelectYear("Terbaru")}>Tahun Terbaru</div>
              <div className="filter-dropdown-item" onClick={() => handleSelectYear("Terlama")}>Tahun Terlama</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ResearchFilters;
