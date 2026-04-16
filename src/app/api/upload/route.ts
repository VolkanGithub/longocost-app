// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// 🛡️ AKILLI NORMALİZASYON: Türkçe karakterleri ve boşlukları temizler
const normalize = (val: unknown) =>
  String(val || "")
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Veriyi güvenli tip ile alıyoruz (any yerine unknown kullandık)
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    let startIndex = -1;
    let fileType = "Bilinmeyen Format";

    // 🕵️‍♂️ AKILLI BAŞLIK TESPİTİ
    for (let i = 0; i < Math.min(50, rawData.length); i++) {
      const row = rawData[i];
      if (!row || !Array.isArray(row)) continue;

      const cleanRow = row.map(cell => normalize(cell));

      const hasKod = cleanRow.some(c => c === 'kod');
      const hasAd = cleanRow.some(c => c === 'ad' || c.includes('hesap adi'));
      const hasBorc = cleanRow.some(c => c === 'borc');

      if (hasKod && hasAd && hasBorc) {
        startIndex = i;
        fileType = "Mizan (Muhasebe Raporu)";
        break;
      }
    }

    // Tip güvenliği sağlandı ve yazım hatası (an y) düzeltildi
    let rows: Record<string, unknown>[] = [];
    if (startIndex !== -1) {
      rows = XLSX.utils.sheet_to_json(worksheet, { range: startIndex }) as Record<string, unknown>[];
    }

    console.log(`📊 İşlem tamamlandı: ${fileType} - Satır: ${rows.length}`);

    return NextResponse.json({
      message: `Dosya işlendi: ${fileType}`,
      totalRows: rows.length,
      status: startIndex !== -1 ? "success" : "unknown"
    }, { status: 200 });

  } catch (error) {
    console.error('Kritik Hata:', error);
    return NextResponse.json({ error: 'Dosya işlenirken bir hata oluştu.' }, { status: 500 });
  }
}