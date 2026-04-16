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

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // HATA 1 ÇÖZÜMÜ: "any" yerine TypeScript'in güvenli veri tipi olan "unknown" (bilinmeyen değer) kullandık.
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    let startIndex = 0;
    let fileType = "Bilinmeyen Format";

    // HATA 2 ÇÖZÜMÜ: "any" yerine "Record" (Anahtarı string, değeri bilinmeyen finansal nesne) kullandık.
    let rows: Record<string, unknown>[] = [];

    for (let i = 0; i < Math.min(25, rawData.length); i++) {
      const rowStr = JSON.stringify(rawData[i]);
      if (rowStr.includes('Kod') && rowStr.includes('Hesap Adı') && rowStr.includes('Borç')) {
        startIndex = i;
        fileType = "Mizan (Muhasebe Raporu)";
        break;
      }
    }

    if (fileType === "Mizan (Muhasebe Raporu)") {
      // Veriyi çekerken de tipimizi güvenli bir şekilde belirtiyoruz
      rows = XLSX.utils.sheet_to_json(worksheet, { range: startIndex }) as Record<string, unknown>[];

      console.log("--------------------------------------------------");
      console.log(`🚦 TRAFİK POLİSİ: Orijinal .xlsx dosyası tanındı! Tür: ${fileType}`);
      console.log("📦 İLK SATIR (EXCEL'DEN DOĞRUDAN):", rows[0]);
      console.log("--------------------------------------------------");
    }

    return NextResponse.json({
      message: `Excel başarıyla işlendi! Tür: ${fileType}`,
      totalRows: rows.length
    }, { status: 200 });

  } catch (error) {
    console.error('Excel yükleme hatası:', error);
    return NextResponse.json({ error: 'Excel dosyası işlenirken bir hata oluştu.' }, { status: 500 });
  }
}