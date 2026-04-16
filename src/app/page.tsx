// src/app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Lütfen önce bir dosya seçin.");
      return;
    }

    setLoading(true);
    setStatus("Dosya analiz ediliyor...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Backend'den gelen başarı mesajını ve satır sayısını göster
        setStatus(`Başarılı! ${data.message} (${data.totalRows} satır okundu)`);
      } else {
        setStatus(`Hata: ${data.error}`);
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
      setStatus("Sistemsel bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight italic">LongoCost</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Finansal Veri Aktarım Merkezi</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Tıkla</span> veya dosyayı sürükle</p>
                <p className="text-xs text-gray-600 font-medium">Elektraweb Excel (.xlsx, .xls) veya CSV</p>
              </div>
              {/* DİKKAT: 'accept' niteliği macOS için hem uzantıları hem de MIME tiplerini içerir.
                Bu sayede dosya seçme penceresinde pasif (greyed out) kalma sorunu çözülür.
              */}
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv, application/csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {file && (
            <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-100 animate-pulse">
              <span className="font-bold">Seçilen Dosya:</span> {file.name}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-4 px-4 rounded-xl text-white font-bold tracking-wide transition-all ${!file || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
              }`}
          >
            {loading ? "VERİLER İŞLENİYOR..." : "ANALİZİ BAŞLAT"}
          </button>

          {status && (
            <div className={`text-center text-sm font-medium p-4 rounded-lg shadow-sm border ${status.includes('Başarılı')
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
              }`}>
              {status}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-400 font-mono">
        v2.0.0 - Excel Engine Active
      </div>
    </main>
  );
}