import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getDocuments } from "../../services/documentService";

function DocumentPage({ title = "Document", type = "" }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!type) return;

    const fetchData = async () => {
      try {
        const result = await getDocuments(type);
        setData(result || []);
      } catch (err) {
        console.error(err);
        setData([]);
      }
    };

    fetchData();
  }, [type]);

  return (
    <MainLayout>
      <div className="container-fluid">

        {/* HEADER */}
        <div className="mb-4">
          <h4 className="fw-bold">{title}</h4>
          <p className="text-muted">
            Kelola {title?.toLowerCase?.()} Anda di sini.
          </p>
        </div>

        {/* BUTTON */}
        <button className="btn btn-success mb-4">
          + Buat {title}
        </button>

        {/* TABLE */}
        <div className="card table-container p-0">

          <div className="table-responsive">
            <table className="table align-middle mb-0">

              <thead className="table-header-custom">
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Tanggal</th>
                  <th className="text-center">Action</th>
                  <th className="text-center">View</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>{i + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.tanggal}</td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-sm btn-warning">
                          Edit
                        </button>

                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>

                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-custom">
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default DocumentPage;