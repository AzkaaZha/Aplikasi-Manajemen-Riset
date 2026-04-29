import MainLayout from "../../layouts/MainLayout";
import DocumentCard from "../../components/dashboard/DocumentCard";

function Dashboard() {
  const data = [
    { title: "Analisis AI dalam Pendidikan" },
    { title: "Sistem Rekomendasi Penelitian" },
  ];

  const sections = [
    "Penelitian",
    "Laporan Kemajuan",
    "Laporan Akhir",
  ];

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="row g-3">

          {sections.map((title, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <DocumentCard title={title} data={data} />
            </div>
          ))}

        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;