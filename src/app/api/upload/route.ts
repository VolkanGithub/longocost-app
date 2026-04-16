// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Lütfen bir Excel dosyası yükleyin.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // SheetJS hem .xlsx hem de .csv okuyabilen güçlü bir motordur
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    let startIndex = 0;
    let fileType = "Bilinmeyen Format";
    let rows: Record<string, unknown>[] = [];

    // --- 🚦 TRAFİK POLİSİ (GÜNCELLENDİ) ---
    // Elektraweb'in "Hesap Adı" yerine sadece "Ad" kullandığını tespit ettik.
    for (let i = 0; i < Math.min(25, rawData.length); i++) {
      const rowStr = JSON.stringify(rawData[i]);
      // Artık 'Hesap Adı' değil, 'Ad' arıyoruz!
      if (rowStr.includes('Kod') && rowStr.includes('Ad') && rowStr.includes('Borç')) {
        startIndex = i;
        fileType = "Mizan (Muhasebe Raporu)";
        break; // Tabloyu bulduk, aramayı durdur.
      }
    }

    if (fileType === "Mizan (Muhasebe Raporu)") {
      // Bulduğumuz satırdan itibaren veriyi obje olarak alıyoruz
      rows = XLSX.utils.sheet_to_json(worksheet, { range: startIndex }) as Record<string, unknown>[];

      console.log("--------------------------------------------------");
      console.log(`🚦 TRAFİK POLİSİ: Orijinal dosya başarıyla tanındı! Tür: ${fileType}`);
      console.log("📦 100 KASA HESABI (İLK SATIR):", rows[0]);
      console.log("--------------------------------------------------");
    }

    return NextResponse.json({
      message: `Dosya başarıyla işlendi! Tür: ${fileType}`,
      totalRows: rows.length
    }, { status: 200 });

  } catch (error) {
    console.error('Yükleme hatası:', error);
    return NextResponse.json({ error: 'Dosya işlenirken bir hata oluştu.' }, { status: 500 });
  }
}