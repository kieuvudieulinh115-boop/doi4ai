import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  FileText, 
  Check, 
  X, 
  Settings2, 
  BookOpen, 
  Award, 
  Download,
  Eye
} from 'lucide-react';
import { GradeLevel, VocabItem, ComprehensionQuestion, StudentProfile } from '../types';

interface ExportExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  passage: string;
  grade: GradeLevel;
  gradeLabel: string;
  vocabulary: VocabItem[];
  questions: ComprehensionQuestion[];
  studentProfile: StudentProfile;
  themeMode: 'dark' | 'light';
}

export const ExportExamModal: React.FC<ExportExamModalProps> = ({
  isOpen,
  onClose,
  title,
  passage,
  grade,
  gradeLabel,
  vocabulary,
  questions,
  studentProfile,
  themeMode
}) => {
  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  // Export configurations
  const [schoolName, setSchoolName] = useState('TRƯỜNG THCS BÌNH MINH');
  const [examName, setExamName] = useState('BÀI KIỂM TRA ĐỌC HIỂU NGỮ VĂN');
  const [examTime, setExamTime] = useState('45 phút');
  const [academicYear, setAcademicYear] = useState('Năm học 2025 - 2026');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeVocab, setIncludeVocab] = useState(true);
  const [includeAnswerLines, setIncludeAnswerLines] = useState(true);

  // Generate clean Word (.doc HTML format) content
  const generateWordDocument = () => {
    const questionsHtml = questions.map((q, idx) => {
      const score = q.level === 'nhan-biet' ? '1.0 điểm' : q.level === 'thong-hieu' ? '1.5 điểm' : '1.5 điểm';
      return `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; font-size: 13pt;">
            Câu ${idx + 1} (${score}) [Mức độ: ${q.levelLabel}]:
          </p>
          <p style="margin: 4px 0 8px 0; font-size: 13pt; line-height: 1.4;">
            ${q.question}
          </p>
          ${
            includeAnswerLines
              ? `
              <div style="margin: 8px 0 16px 0; border-bottom: 1px dotted #888; height: 26px;"></div>
              <div style="margin: 8px 0 16px 0; border-bottom: 1px dotted #888; height: 26px;"></div>
              <div style="margin: 8px 0 16px 0; border-bottom: 1px dotted #888; height: 26px;"></div>
              `
              : ''
          }
          ${
            includeAnswers
              ? `
              <div style="margin: 8px 0 14px 15px; padding: 10px; background-color: #f1f5f9; border-left: 3px solid #0284c7; font-size: 11.5pt;">
                <p style="margin: 0 0 4px 0; font-weight: bold; color: #0369a1;">* Hướng dẫn chấm & Dẫn chứng:</p>
                <p style="margin: 0 0 4px 0;"><strong>- Dẫn chứng chuẩn:</strong> <em>"${q.citationQuote || 'Theo văn bản'}"</em></p>
                <p style="margin: 0 0 4px 0;"><strong>- Định hướng trả lời:</strong> ${q.hintLevel1}</p>
                ${q.hintLevel2 ? `<p style="margin: 0;"><strong>- Tiêu chí đạt điểm:</strong> ${q.hintLevel2}</p>` : ''}
              </div>
              `
              : ''
          }
        </div>
      `;
    }).join('');

    const vocabHtml = includeVocab && vocabulary.length > 0 ? `
      <div style="margin: 20px 0;">
        <h4 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; color: #334155; margin-bottom: 8px;">
          * Chú thích từ khó ngữ cảnh:
        </h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11.5pt;" border="1" cellpadding="6">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="width: 25%; text-align: left;">Từ ngữ</th>
              <th style="width: 15%; text-align: center;">Từ loại</th>
              <th style="width: 60%; text-align: left;">Giải nghĩa trong văn cảnh</th>
            </tr>
          </thead>
          <tbody>
            ${vocabulary.map(v => `
              <tr>
                <td style="font-weight: bold; color: #0284c7;">${v.word}</td>
                <td style="text-align: center;">${v.partOfSpeech || 'Từ ngữ'}</td>
                <td>${v.contextMeaning}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const passageParagraphs = passage
      .split(/\n+/)
      .filter(p => p.trim())
      .map(p => `<p style="text-indent: 28px; margin: 0 0 8px 0; line-height: 1.5; font-size: 13pt; text-align: justify;">${p}</p>`)
      .join('');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${title} - Đề Đọc Hiểu</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            line-height: 1.35;
            color: #000;
          }
          table.header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin-bottom: 20px;
          }
          table.header-table td {
            border: none;
            padding: 4px;
            vertical-align: top;
          }
          .title-box {
            text-align: center;
            margin: 15px 0 20px 0;
          }
        </style>
      </head>
      <body>
        <!-- Header Section -->
        <table class="header-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <strong>${schoolName.toUpperCase()}</strong><br/>
              <strong>TỔ NGỮ VĂN</strong><br/>
              <em>${academicYear}</em>
            </td>
            <td style="width: 50%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
              -------------------
            </td>
          </tr>
        </table>

        <div class="title-box">
          <h2 style="margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase;">
            ${examName}
          </h2>
          <p style="margin: 4px 0; font-size: 13pt;">
            <strong>Môn: Ngữ Văn - ${gradeLabel}</strong> (Thời gian: ${examTime})
          </p>
        </div>

        <!-- Student Info Box -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 20px;" cellpadding="6">
          <tr>
            <td style="width: 60%; border: 1px solid #000;">
              Họ và tên học sinh: <strong>${studentProfile.name || '...................................................'}</strong><br/>
              Lớp: <strong>${studentProfile.className || '..................'}</strong>
            </td>
            <td style="width: 20%; border: 1px solid #000; text-align: center;">
              <strong>Điểm số</strong><br/><br/>
            </td>
            <td style="width: 20%; border: 1px solid #000; text-align: center;">
              <strong>Lời phê</strong><br/><br/>
            </td>
          </tr>
        </table>

        <!-- Part I: Passage -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0;">
            I. PHẦN ĐỌC HIỂU (6.0 điểm)
          </h3>
          <p style="font-style: italic; margin-bottom: 12px; font-size: 12pt;">
            Đọc kỹ ngữ liệu văn bản sau và trả lời các câu hỏi:
          </p>
          <div style="padding: 12px 16px; border: 1px solid #94a3b8; background-color: #f8fafc; margin-bottom: 12px;">
            <p style="text-align: center; font-weight: bold; font-size: 14pt; margin: 0 0 10px 0;">
              ${title.toUpperCase()}
            </p>
            ${passageParagraphs}
          </div>
          ${vocabHtml}
        </div>

        <!-- Part II: Questions -->
        <div>
          <h3 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0 0 12px 0;">
            II. HỆ THỐNG CÂU HỎI ĐỌC HIỂU
          </h3>
          ${questionsHtml}
        </div>

        <div style="text-align: center; margin-top: 30px; font-style: italic;">
          --- HẾT ---<br/>
          <em>(Cán bộ coi thi không giải thích gì thêm)</em>
        </div>
      </body>
      </html>
    `;
  };

  // Trigger Word download (.doc)
  const handleDownloadWord = () => {
    const content = generateWordDocument();
    const blob = new Blob(['\ufeff' + content], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = (title || 'De_Kiem_Tra_Doc_Hieu')
      .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_')
      .slice(0, 30);
    link.download = `${cleanTitle}_${grade}_DocHieu.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger Print / Save to PDF
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Vui lòng cho phép mở cửa sổ popup để in hoặc lưu file PDF.');
      return;
    }

    const content = generateWordDocument();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech font-bold text-lg">Xuất Đề Kiểm Tra & In Ấn</h3>
              <p className="text-xs text-slate-400 font-mono">Tạo đề thi chuẩn Word (.doc) và PDF theo định dạng GDPT 2018</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Configuration Form */}
        <div className="space-y-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Tên trường / Đơn vị:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-mono ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Tiêu đề bài kiểm tra:</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-mono ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Thời gian làm bài:</label>
              <select
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-mono ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="15 phút">15 phút (Kiểm tra 15p)</option>
                <option value="45 phút">45 phút (Kiểm tra 1 tiết / Giữa kỳ)</option>
                <option value="90 phút">90 phút (Thi Học kỳ)</option>
                <option value="60 phút">60 phút</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Năm học:</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-mono ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Checklist Options */}
          <div className="p-4 rounded-2xl border border-slate-700/60 bg-slate-950/40 space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Tùy chọn nội dung tài liệu:
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
              />
              <span>Kèm hướng dẫn chấm & dẫn chứng trích dẫn (Dành cho Giáo viên)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeAnswerLines}
                onChange={(e) => setIncludeAnswerLines(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
              />
              <span>Tạo dòng kẻ chấm để học sinh làm bài trực tiếp trên giấy</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeVocab}
                onChange={(e) => setIncludeVocab(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
              />
              <span>Bao gồm bảng tra nghĩa từ khó ngữ cảnh ({vocabulary.length} từ)</span>
            </label>
          </div>

          {/* Preview Snapshot Box */}
          <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 text-xs font-mono text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-cyan-300 font-bold">
              <span>Đoạn trích: {title}</span>
              <span>{gradeLabel}</span>
            </div>
            <p className="text-slate-400">
              Tổng số câu hỏi: {questions.length} câu • Từ vựng: {vocabulary.length} từ • Đầy đủ mức độ Nhận biết, Thông hiểu, Vận dụng
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={handleDownloadWord}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-mono font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-mono font-bold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>In ấn / Lưu file PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-700/80 text-slate-400 hover:text-white transition-colors text-sm font-mono"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
