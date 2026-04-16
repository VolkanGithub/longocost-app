// src/app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return setStatus("Lütfen dosya seçin.");
    setLoading(true);
    setStatus("İşleniyor...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setStatus(`Başarılı! ${data.totalRows} satır sisteme aktarıldı.`);
      } else {
        setStatus(`Hata: ${data.message || "Format tanınamadı."}`);
      }
    } catch (error) {
      // Hata tanımlandı ve konsola basılarak "kullanılmama" hatası engellendi
      console.error("Yükleme sırasında hata oluştu:", error);
      setStatus("Sistemsel hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <h1 className="text-4xl font-black text-slate-800 mb-2 italic">LongoCost</h1>
        <p className="text-slate-500 mb-8 text-sm">CFO Veri Analiz Motoru - KESİN ÇÖZÜM</p>

        <label className="group relative flex flex-col items-center justify-center w-full h-44 border-4 border-dashed border-blue-200 rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 mb-6">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <span className="text-blue-600 font-bold text-lg mb-1">Mizan Seçin</span>
            <span className="text-slate-400 text-xs font-bold">SADECE EXCEL (.xlsx)</span>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>

        {file && <div className="mb-4 text-sm font-bold text-green-600">Seçildi: {file.name}</div>}

        <button onClick={handleUpload} disabled={!file || loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">
          {loading ? "İŞLENİYOR..." : "VERİLERİ ANALİZ ET"}
        </button>

        {status && <div className="mt-6 p-4 rounded-xl text-sm font-bold border bg-slate-50">{status}</div>}
      </div>
    </main>
  );
}