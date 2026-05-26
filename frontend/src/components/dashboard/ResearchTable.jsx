const ResearchTable = ({ rows }) => {
  return (
    <div className="table-responsive research-table-card">
      <table className="table align-middle mb-0">
        <thead className="table-header-custom">
          <tr>
            <th>Judul</th>
            <th>Ketua</th>
            <th>Tahun</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.title}</td>
              <td>{row.leader}</td>
              <td>{row.year}</td>
              <td>
                <span className={`status-box ${row.statusClass}`}>{row.status}</span>
              </td>
              <td className="research-table-actions">
                <button className="btn btn-outline-custom btn-sm">Detail</button>
                <button className="btn btn-outline-custom btn-sm">Edit</button>
                <button className="btn btn-outline-custom btn-sm">Lanjutkan</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResearchTable;
