import React from "react";
import "../../../styles/documents/document-preview.css";

const PreviewSection = ({ title, children }) => (
  <section className="preview-section mb-4">
    <h2 className="preview-section-title">{title}</h2>
    <div className="preview-section-body">{children}</div>
  </section>
);

const PreviewField = ({ label, value, fullWidth = false }) => (
  <div className={`preview-field ${fullWidth ? "full-width" : ""}`}>
    <div className="preview-field-label">{label}</div>
    <div className="preview-field-value">{value || "-"}</div>
  </div>
);

const PreviewRichText = ({ label, html }) => (
  <div className="preview-richtext-block">
    <div className="preview-field-label">{label}</div>
    <div className="preview-richtext" dangerouslySetInnerHTML={{ __html: html || "<p>-</p>" }} />
  </div>
);

const PreviewTable = ({ title, columns, rows }) => {
  if (!rows?.length) return null;
  return (
    <PreviewSection title={title}>
      <div className="preview-table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key || column.label}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map((column) => (
                  <td key={column.key || column.label}>{column.render ? column.render(item) : item[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PreviewSection>
  );
};

const DocumentPreviewTemplate = ({
  documentType,
  documentData,
  contents,
  parentContents = {},
  progressContents = {},
  researchers = [],
  partners = [],
  outputs = [],
  schedules = [],
  budgets = [],
  files = [],
}) => {
  const getDocTypeLabel = (type) => {
    if (type === "proposal") return "Proposal";
    if (type === "kemajuan") return "Laporan Kemajuan";
    if (type === "akhir") return "Laporan Akhir";
    return "Dokumen";
  };

  const getContentValue = (key) => {
    return contents?.[key] || progressContents?.[key] || parentContents?.[key] || "";
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const numberValue = Number(String(value).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(numberValue)) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(numberValue);
  };

  const renderIdentityFields = () => (
    <div className="preview-fields-grid">
      <PreviewField label="Judul Penelitian" value={documentData.judul_penelitian} fullWidth />
      <PreviewField label="Bidang Fokus RIRN / Bidang Unggulan Perguruan Tinggi" value={documentData.bidang_fokus_rirn} />
      <PreviewField label="Tema Penelitian" value={documentData.tema_penelitian} />
      <PreviewField label="Topik Penelitian" value={documentData.topik_penelitian} />
      <PreviewField label="Rumpun Bidang Ilmu" value={documentData.rumpun_bidang_ilmu} />
      <PreviewField label="Target Akhir TKT" value={documentData.target_akhir_tkt} />
      <PreviewField label="Lama Penelitian" value={documentData.lama_penelitian ? `${documentData.lama_penelitian} Tahun` : "-"} />
      <PreviewField label="Kata Kunci" value={documentData.kata_kunci} />
      <PreviewField label="Dana Penelitian" value={formatCurrency(documentData.dana_penelitian)} />
    </div>
  );

  const renderCommonNarratives = () => (
    <>
      <PreviewRichText label="Ringkasan" html={getContentValue("ringkasan")} />
      <PreviewRichText label="Latar Belakang" html={getContentValue("latar_belakang")} />
      <PreviewRichText label="Tinjauan Pustaka" html={getContentValue("tinjauan_pustaka")} />
      <PreviewRichText label="Metode Penelitian" html={getContentValue("metode_penelitian")} />
      <PreviewRichText label="Daftar Pustaka" html={getContentValue("daftar_pustaka")} />
    </>
  );

  const renderProgressNarratives = () => (
    <>
      <PreviewRichText label="Hasil Penelitian" html={getContentValue("hasil_penelitian")} />
      <PreviewRichText label="Hasil Pelaksanaan" html={getContentValue("hasil_pelaksanaan")} />
      <PreviewRichText label="Status Luaran" html={getContentValue("status_luaran")} />
      <PreviewRichText label="Peran Mitra" html={getContentValue("peran_mitra")} />
      <PreviewRichText label="Kendala Pelaksanaan" html={getContentValue("kendala_pelaksanaan")} />
      <PreviewRichText label="Rencana Tahapan Selanjutnya" html={getContentValue("rencana_tahapan_selanjutnya")} />
      <PreviewRichText label="Rencana Tindak Lanjut" html={getContentValue("rencana_tindak_lanjut")} />
    </>
  );

  const renderOutputsSection = () => (
    <PreviewTable
      title="Luaran dan Target Capaian"
      columns={[
        { key: "kategori_luaran", label: "Kategori" },
        { key: "tahun_luaran", label: "Tahun" },
        { key: "jenis_luaran", label: "Jenis Luaran" },
        { key: "status_target", label: "Status" },
      ]}
      rows={outputs}
    />
  );

  const renderScheduleSection = () => (
    <PreviewTable
      title="Jadwal Kegiatan"
      columns={[
        { key: "nama_kegiatan", label: "Nama Kegiatan" },
        {
          key: "bulan",
          label: "Bulan",
          render: (item) => {
            const activeMonths = [];
            for (let i = 1; i <= 12; i += 1) {
              if (item[`bulan_${i}`]) activeMonths.push(i);
            }
            return activeMonths.length ? activeMonths.join(", ") : "-";
          },
        },
      ]}
      rows={schedules}
    />
  );

  const renderBudgetSection = () => (
    <PreviewTable
      title="Rencana Anggaran"
      columns={[
        { key: "jenis_pembelanjaan", label: "Jenis" },
        { key: "item", label: "Item" },
        { key: "volume", label: "Volume" },
        { key: "satuan", label: "Satuan" },
        {
          key: "biaya_satuan",
          label: "Biaya Satuan",
          render: (item) => formatCurrency(item.biaya_satuan),
        },
        {
          key: "total",
          label: "Total",
          render: (item) => formatCurrency(item.total),
        },
      ]}
      rows={budgets}
    />
  );

  const renderResearchers = () => (
    <PreviewTable
      title="Data Pengusul"
      columns={[
        { key: "nama", label: "Nama" },
        { key: "peran", label: "Peran" },
        { key: "institusi", label: "Institusi" },
        { key: "nidn_nip_nim", label: "NIDN/NIP/NIM" },
      ]}
      rows={researchers}
    />
  );

  const renderPartners = () => (
    <PreviewTable
      title="Data Mitra"
      columns={[
        { key: "nama_mitra", label: "Nama Mitra" },
        { key: "institusi", label: "Institusi" },
        { key: "jenis_mitra", label: "Jenis" },
        { key: "alamat", label: "Alamat" },
      ]}
      rows={partners}
    />
  );

  const renderAttachments = () => {
    if (!files?.length) return null;
    return (
      <PreviewSection title="Lampiran">
        <ul className="preview-attachment-list">
          {files.map((file) => (
            <li key={file.id || file.nama_file} className="preview-attachment-item">
              {file.nama_file || "Lampiran"}
            </li>
          ))}
        </ul>
      </PreviewSection>
    );
  };

  const renderTemplateBody = () => {
    if (documentType === "proposal") {
      return (
        <>
          <PreviewSection title="Informasi Dokumen">
            <div className="preview-header-summary">
              <div className="preview-label">Judul Dokumen</div>
              <div className="preview-title">{documentData.judul || "-"}</div>
            </div>
          </PreviewSection>
          <PreviewSection title="Identitas Penelitian">
            {renderIdentityFields()}
          </PreviewSection>
          {renderResearchers()}
          {renderPartners()}
          <PreviewSection title="Isi Proposal">{renderCommonNarratives()}</PreviewSection>
          {renderOutputsSection()}
          {renderScheduleSection()}
          {renderBudgetSection()}
          {renderAttachments()}
        </>
      );
    }

    if (documentType === "kemajuan") {
      return (
        <>
          <PreviewSection title="Informasi Dokumen">
            <div className="preview-header-summary">
              <div className="preview-label">Judul Dokumen</div>
              <div className="preview-title">{documentData.judul || "-"}</div>
            </div>
          </PreviewSection>
          <PreviewSection title="Identitas Penelitian">
            {renderIdentityFields()}
          </PreviewSection>
          {renderResearchers()}
          {renderPartners()}
          <PreviewSection title="Isi Laporan Kemajuan">{renderProgressNarratives()}</PreviewSection>
          {renderOutputsSection()}
          {renderScheduleSection()}
          {renderBudgetSection()}
          {renderAttachments()}
        </>
      );
    }

    return (
      <>
        <PreviewSection title="Informasi Dokumen">
          <div className="preview-header-summary">
            <div className="preview-label">Judul Dokumen</div>
            <div className="preview-title">{documentData.judul || "-"}</div>
          </div>
        </PreviewSection>
        <PreviewSection title="Identitas Penelitian">
          {renderIdentityFields()}
        </PreviewSection>
        {renderResearchers()}
        {renderPartners()}
        <PreviewSection title="Isi Laporan Akhir">
          {renderProgressNarratives()}
          {renderCommonNarratives()}
        </PreviewSection>
        {renderOutputsSection()}
        {renderScheduleSection()}
        {renderBudgetSection()}
        {renderAttachments()}
      </>
    );
  };

  return (
    <div className="document-preview-template">
      <div className="preview-document-card">
        <div className="preview-document-header">
          <div>
            <div className="preview-document-type">{getDocTypeLabel(documentType)}</div>
            <h1 className="preview-document-title">{documentData.judul || "-"}</h1>
          </div>
          <div className="preview-document-meta">
            <div className="preview-document-meta-item">
              <span>Status:</span> {documentData.status_dokumen || "-"}
            </div>
          </div>
        </div>
        {renderTemplateBody()}
      </div>
    </div>
  );
};

export default DocumentPreviewTemplate;
