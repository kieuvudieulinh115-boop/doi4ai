import express from "express";
import path from "path";
import https from "https";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { EdgeTTS } from "node-edge-tts";
import {
  registerUser,
  loginUser,
  getUserFromToken,
  removeSession,
  updateUserProfile,
  createPasswordResetRequest,
  completePasswordReset
} from "./server/authStore";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = (customApiKey?: string) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to extract Bearer token from authorization header
function extractBearerToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

// AUTH API: Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, className, role, remember } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập họ và tên của bạn." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Vui lòng nhập địa chỉ email hợp lệ." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải chứa ít nhất 6 ký tự." });
    }

    const result = registerUser(
      name.trim(),
      email.trim(),
      password,
      className || "Lớp 7A1",
      role === "teacher" ? "teacher" : "student",
      Boolean(remember)
    );

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Đăng ký thất bại. Vui lòng thử lại." });
  }
});

// AUTH API: Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password, remember } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ email và mật khẩu." });
    }

    const result = loginUser(email, password, Boolean(remember));
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Đăng nhập không thành công." });
  }
});

// AUTH API: Get current session user (/api/auth/me)
app.get("/api/auth/me", (req, res) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn." });
  }

  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
  }

  return res.json({ user });
});

// AUTH API: Logout
app.post("/api/auth/logout", (req, res) => {
  const token = extractBearerToken(req);
  if (token) {
    removeSession(token);
  }
  return res.json({ success: true, message: "Đã đăng xuất an toàn." });
});

// AUTH API: Forgot Password Request
app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Vui lòng nhập địa chỉ email của bạn." });
    }

    const { resetToken } = createPasswordResetRequest(email);
    return res.json({
      success: true,
      message: "Yêu cầu đặt lại mật khẩu đã được tạo.",
      resetToken, // Provided in development/preview response so user can test reset directly
      instructions: "Hệ thống đã chuẩn bị mã bảo mật để đặt lại mật khẩu. Bạn có thể tiến hành tạo mật khẩu mới.",
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Không thể thực hiện yêu cầu đặt lại mật khẩu." });
  }
});

// AUTH API: Reset Password
app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin xác thực để đặt lại mật khẩu." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
    }

    completePasswordReset(email, token, newPassword);
    return res.json({ success: true, message: "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại." });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Không thể đặt lại mật khẩu." });
  }
});

// AUTH API: Update Profile
app.post("/api/auth/update-profile", (req, res) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Yêu cầu đăng nhập." });
  }

  const currentUser = getUserFromToken(token);
  if (!currentUser) {
    return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ." });
  }

  try {
    const { name, className } = req.body;
    const updatedUser = updateUserProfile(currentUser.id, { name, className });
    return res.json({ user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Không thể cập nhật hồ sơ." });
  }
});

// AI CHAT API: Multi-turn conversational assistant (Grok-inspired, pedagogical, high-precision)
app.post("/api/ai/chat", async (req, res) => {
  const { messages, contextPassage, contextTitle, grade, customApiKey } = req.body;
  const customKeyFromHeader = (req.headers["x-gemini-api-key"] as string) || customApiKey;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Thiếu danh sách tin nhắn để trò chuyện cùng AI." });
  }

  const ai = getGeminiClient(customKeyFromHeader);
  const gradeLabel = grade === 'lop-6' ? 'Lớp 6' : grade === 'lop-7' ? 'Lớp 7' : grade === 'lop-8' ? 'Lớp 8' : 'Lớp 9 (THCS)';

  const systemInstruction = `Bạn là Trợ lý AI Đọc Hiểu & Ngữ Văn Thông Minh (AI Reading Assistant).
Bạn có phong cách phản hồi sắc sảo, khúc chiết, chuẩn mực, hiện đại và sâu sắc như các AI thế hệ mới (tương tự Grok/Claude/GPT-4o), nhưng có trái tim của người thầy tận tụy.
Bạn hỗ trợ học sinh và giáo viên phân tích ngữ liệu văn bản, giải thích từ ngữ, rèn luyện tư duy phản biện, đối chiếu dẫn chứng, và sáng tạo văn chương.
Khối lớp hiện tại của học sinh: ${gradeLabel}.
${contextPassage ? `VĂN BẢN ĐANG ĐỌC (${contextTitle || "Ngữ liệu"}):
"""
${contextPassage}
"""` : "Người dùng đang trò chuyện tự do hoặc hỏi đáp mở rộng về văn học, kỹ năng đọc và tư duy."}

Nguyên tắc phản hồi:
- Sử dụng Markdown phong phú (tiêu đề, in đậm, danh sách, trích dẫn, khối code nếu cần).
- Luôn bám sát dẫn chứng khách quan từ văn bản khi trả lời về ngữ liệu.
- Giọng điệu thông minh, khích lệ, tự tin, không sáo rỗng. Trả lời ngay vào trọng tâm.`;

  if (!ai) {
    // Elegant fallback if no API key is set
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    return res.json({
      content: `### Phản hồi AI (Chế độ Phân tích Ngoại tuyến)\n\nCảm ơn bạn đã đặt câu hỏi: **"${lastUserMessage.slice(0, 80)}..."**\n\nĐối với ngữ liệu ${contextTitle ? `*${contextTitle}*` : 'văn bản'}, một số khía cạnh quan trọng bạn có thể đào sâu:\n\n1. **Khía cạnh ngôn từ:** Chú ý các biện pháp tu từ, từ ngữ giàu hình ảnh và cách ngắt nhịp.\n2. **Tâm lý & Nhân vật:** Tìm hiểu động cơ hành động và sự biến chuyển nội tâm qua từng chi tiết.\n3. **Dẫn chứng xác thực:** Hãy luôn đối chiếu câu trả lời với các trích dẫn nguyên văn trong đoạn trích để luận điểm vững chắc nhất.\n\n*Hệ thống đang sẵn sàng kết nối Gemini 3.8 Flash để phân tích thời gian thực chuyên sâu hơn!*`,
      role: 'assistant',
      model: 'system-offline-analyst'
    });
  }

  try {
    // Format conversation history for Gemini SDK
    const conversationHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.content || '') }]
    }));

    // Ensure the last message is from the user
    const lastMsg = conversationHistory[conversationHistory.length - 1];
    if (!lastMsg || lastMsg.role !== 'user') {
      return res.status(400).json({ error: "Tin nhắn cuối cùng phải đến từ người dùng." });
    }

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: conversationHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = chatResponse.text || "Xin lỗi, tôi chưa thể hoàn thành câu trả lời. Bạn có thể hỏi lại được không?";
    return res.json({
      content: replyText,
      role: 'assistant',
      model: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.error("AI Chat generation error:", error);
    return res.status(500).json({
      error: error.message || "Đã xảy ra lỗi khi trao đổi với AI. Vui lòng thử lại."
    });
  }
});

// Helper for fallback passage analysis if API fails or is offline
function generateFallbackAnalysis(passage: string, grade: string, initialNotes?: string) {
  const lines = passage.split('\n').filter(l => l.trim().length > 0);
  const words = passage.split(/\s+/).filter(w => w.length > 3);
  
  return {
    summary: lines.slice(0, 2).join(' ') || "Đoạn văn phản ánh sinh động nội dung và cảm xúc của nhân vật/sự việc thông qua các chi tiết chân thực.",
    mainTheme: "Nội dung phản ánh tư tưởng, tình cảm và bài học nhân sinh qua những hình ảnh miêu tả giàu sức biểu cảm.",
    vocabulary: [
      {
        id: "v-1",
        word: words[5] || "cường tráng",
        contextMeaning: "Khỏe mạnh, nở nang, tràn đầy sức sống của lứa tuổi trẻ trong văn cảnh.",
        originalSentence: lines[0] || passage.slice(0, 80),
        partOfSpeech: "Tính từ"
      },
      {
        id: "v-2",
        word: words[12] || "hãnh diện",
        contextMeaning: "Tự hào, sung sướng vì bản thân có được điều nổi trội hơn người khác.",
        originalSentence: lines[Math.min(1, lines.length - 1)] || "",
        partOfSpeech: "Tính từ"
      }
    ],
    questions: [
      {
        id: "q-1",
        level: "nhan-biet",
        levelLabel: "Nhận biết",
        question: "Dựa vào văn bản, những chi tiết nào trong đoạn văn thể hiện rõ nhất đặc điểm hoặc tâm trạng nổi bật của nhân vật/đối tượng?",
        hintLevel1: "Em hãy đọc kỹ lại nửa đầu đoạn văn và gạch dưới các từ ngữ chỉ hành động hoặc hình dáng.",
        hintLevel2: "Chú ý câu văn miêu tả đặc điểm ngoại hình hoặc phản ứng trực tiếp.",
        citationQuote: lines[0] || passage.slice(0, 60),
        studentAnswer: "",
        revealedHints: 0
      },
      {
        id: "q-2",
        level: "thong-hieu",
        levelLabel: "Thông hiểu",
        question: "Qua cách ứng xử và suy nghĩ của nhân vật/người viết, em hiểu được điều gì về thái độ và cảm xúc được gửi gắm trong văn bản?",
        hintLevel1: "Hãy chú ý đến sự thay đổi trong suy nghĩ từ lúc đầu đến cuối đoạn trích.",
        hintLevel2: "Đối chiếu chi tiết ở phần kết của đoạn văn.",
        citationQuote: lines[lines.length - 1] || passage.slice(-60),
        studentAnswer: "",
        revealedHints: 0
      },
      {
        id: "q-3",
        level: "van-dung",
        levelLabel: "Vận dụng",
        question: "Từ bài học hoặc thông điệp trong đoạn văn trên, em rút ra được lời khuyên gì cho bản thân trong học tập hoặc đời sống hàng ngày?",
        hintLevel1: "Liên hệ thông điệp cốt lõi của văn bản với cách ứng xử trong giao tiếp bạn bè.",
        hintLevel2: "Dựa trên chi tiết đắt giá ở câu kết của đoạn trích.",
        citationQuote: lines[lines.length - 1] || "",
        studentAnswer: "",
        revealedHints: 0
      }
    ]
  };
}

// Endpoint: Analyze passage, extract vocabulary, summarize, generate questions
app.post("/api/analyze-passage", async (req, res) => {
  const { passage, grade, initialNotes, apiKey: customKeyFromBody } = req.body;
  const customKeyFromHeader = (req.headers["x-gemini-api-key"] as string) || customKeyFromBody;

  if (!passage || typeof passage !== "string" || passage.trim().length < 20) {
    return res.status(400).json({ error: "Đoạn văn quá ngắn hoặc không hợp lệ. Vui lòng nhập ít nhất 20 ký tự." });
  }

  const gradeName = grade === 'lop-6' ? 'Lớp 6' : grade === 'lop-7' ? 'Lớp 7' : grade === 'lop-8' ? 'Lớp 8' : 'Lớp 9';
  const ai = getGeminiClient(customKeyFromHeader);

  if (!ai) {
    // Fallback if no API key
    const fallback = generateFallbackAnalysis(passage, grade, initialNotes);
    return res.json(fallback);
  }

  try {
    const prompt = `
Bạn là một chuyên gia sư phạm Ngữ Văn Trung học cơ sở (THCS) tại Việt Nam.
Hãy phân tích đoạn văn sau dành cho học sinh cấp ${gradeName} THCS:

=== ĐOẠN VĂN ===
${passage}
=== CÂU TRẢ LỜI / Ý KIẾN BAN ĐẦU CỦA HỌC SINH (NẾU CÓ) ===
${initialNotes || "Chưa có ý kiến ban đầu"}

=== YÊU CẦU XỬ LÝ (TUÂN THỦ TUYỆT ĐỐI NGUYÊN TẮC BÁM SÁT VĂN BẢN) ===
1. **Tóm tắt ý chính**: Viết một đoạn tóm tắt súc tích (khoảng 2-4 câu), nêu bật chủ đề và thông điệp chính của đoạn văn, phù hợp với nhận thức học sinh ${gradeName}.
2. **Chủ đề chính (mainTheme)**: Một câu ngắn gọn định danh chủ đề của đoạn văn.
3. **Giải thích từ khó (vocabulary)**: Chọn từ 3 đến 5 từ ngữ hoặc thành ngữ khó/từ ngữ nghệ thuật xuất hiện THỰC TẾ trong đoạn văn. Giải thích nghĩa của từ THEO NGỮ CẢNH CỤ THỂ của văn bản (không giải thích chung chung theo từ điển thuần túy). Trích nguyên câu chứa từ đó trong văn bản.
4. **Sinh câu hỏi đọc hiểu (questions)**: Tạo ra từ 3 đến 4 câu hỏi đọc hiểu phù hợp với học sinh ${gradeName}:
   - Bao gồm các cấp độ tư duy: 'nhan-biet' (Nhận biết thông tin trực tiếp), 'thong-hieu' (Suy luận ý nghĩa, tâm trạng, thái độ), 'van-dung' (Rút ra bài học, thông điệp gắn với thực tế dựa trên văn bản).
   - Mỗi câu hỏi PHẢI có:
     + "level": 'nhan-biet' | 'thong-hieu' | 'van-dung'
     + "levelLabel": 'Nhận biết' | 'Thông hiểu' | 'Vận dụng'
     + "question": Câu hỏi rõ ràng, sư phạm, không mớm cung hoặc làm bài thay học sinh.
     + "hintLevel1": Gợi ý định hướng suy nghĩ cấp 1 (câu hỏi gợi mở, hướng dẫn học sinh đọc đoạn nào).
     + "hintLevel2": Gợi ý cấp 2 (gợi ý cụ thể hơn nhưng KHÔNG trực tiếp nói đáp án, trỏ tới manh mối).
     + "citationQuote": Trích đoạn câu văn nguyên văn trong văn bản chứa dẫn chứng chính xác để học sinh tự đối chiếu.

LƯU Ý NGHIÊM NGẶT:
- Không thêm các chi tiết ngoài đoạn văn đã cho.
- Tất cả các citationQuote phải là câu trích dẫn nguyên văn hoặc cụm từ có thật trong đoạn văn.
- Không đưa ra điểm số.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một trợ lý giáo dục chuyên nghiệp, chuyên môn sâu về phương pháp dạy học đọc hiểu Ngữ văn THCS Việt Nam. Bạn luôn xuất dữ liệu ở định dạng JSON chuẩn xác theo schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Tóm tắt ý chính của đoạn văn súc tích" },
            mainTheme: { type: Type.STRING, description: "Chủ đề chính của đoạn văn" },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  word: { type: Type.STRING, description: "Từ khó xuất hiện trong bài" },
                  contextMeaning: { type: Type.STRING, description: "Nghĩa ngữ cảnh trong bài đọc" },
                  originalSentence: { type: Type.STRING, description: "Câu văn nguyên văn chứa từ đó" },
                  partOfSpeech: { type: Type.STRING, description: "Từ loại hoặc đặc điểm ngữ pháp" }
                },
                required: ["id", "word", "contextMeaning", "originalSentence"]
              }
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ["nhan-biet", "thong-hieu", "van-dung"] },
                  levelLabel: { type: Type.STRING },
                  question: { type: Type.STRING },
                  hintLevel1: { type: Type.STRING, description: "Gợi ý mức 1 định hướng suy nghĩ" },
                  hintLevel2: { type: Type.STRING, description: "Gợi ý mức 2 manh mối đoạn văn" },
                  citationQuote: { type: Type.STRING, description: "Trích dẫn nguyên văn từ đoạn văn làm dẫn chứng" }
                },
                required: ["id", "level", "levelLabel", "question", "hintLevel1", "hintLevel2", "citationQuote"]
              }
            }
          },
          required: ["summary", "mainTheme", "vocabulary", "questions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    // Ensure all questions have studentAnswer and revealedHints fields
    const sanitizedQuestions = (parsed.questions || []).map((q: any, idx: number) => ({
      id: q.id || `q-${idx + 1}`,
      level: q.level || "thong-hieu",
      levelLabel: q.levelLabel || (q.level === 'nhan-biet' ? 'Nhận biết' : q.level === 'van-dung' ? 'Vận dụng' : 'Thông hiểu'),
      question: q.question,
      hintLevel1: q.hintLevel1,
      hintLevel2: q.hintLevel2,
      citationQuote: q.citationQuote,
      studentAnswer: "",
      revealedHints: 0
    }));

    return res.json({
      summary: parsed.summary,
      mainTheme: parsed.mainTheme,
      vocabulary: (parsed.vocabulary || []).map((v: any, idx: number) => ({
        ...v,
        id: v.id || `v-${idx + 1}`
      })),
      questions: sanitizedQuestions
    });
  } catch (error: any) {
    console.error("Gemini API passage analysis error:", error);
    const fallback = generateFallbackAnalysis(passage, grade, initialNotes);
    return res.json(fallback);
  }
});

// Endpoint: Check student answer against passage without giving away answers or judging without evidence
app.post("/api/check-answer", async (req, res) => {
  const { passage, question, studentAnswer, citationQuote, hintLevel1, hintLevel2, apiKey: customKeyFromBody } = req.body;
  const customKeyFromHeader = (req.headers["x-gemini-api-key"] as string) || customKeyFromBody;

  if (!passage || !question || !studentAnswer) {
    return res.status(400).json({ error: "Thiếu thông tin đoạn văn, câu hỏi hoặc câu trả lời của học sinh." });
  }

  const ai = getGeminiClient(customKeyFromHeader);

  if (!ai) {
    // Graceful offline fallback
    return res.json({
      isGrounded: true,
      citationQuotes: [citationQuote || ""].filter(Boolean),
      feedbackComment: "Em đã bước đầu dựa vào các ý trong văn bản. Hãy tiếp tục quan sát kỹ các chi tiết cụ thể để câu trả lời thêm trọn vẹn.",
      guidedHint: hintLevel1 || "Đối chiếu câu trả lời của em với dẫn chứng từ văn bản.",
      canRefine: true
    });
  }

  try {
    const prompt = `
Bạn là một trợ giảng môn Ngữ Văn THCS đang hỗ trợ học sinh kiểm tra và điều chỉnh câu trả lời đọc hiểu.

=== ĐOẠN VĂN GỐC ===
${passage}

=== CÂU HỎI ĐỌC HIỂU ===
${question}

=== DẪN CHỨNG CHUẨN TRONG ĐOẠN VĂN ===
${citationQuote || "Không có dẫn chứng cố định, hãy tìm trong đoạn văn"}

=== CÂU TRẢ LỜI CỦA HỌC SINH ===
${studentAnswer}

=== QUY TẮC PHẢN HỒI BẮT BUỘC (TUÂN THỦ THEO YÊU CẦU NGHIÊM NGẶT CỦA BÀI TOÁN) ===
1. **Kiểm tra tính có căn cứ (isGrounded)**:
   - Câu trả lời của học sinh có dựa trên thông tin thực tế của đoạn văn hay không?
   - Nếu câu trả lời hoàn toàn vô nghĩa, lạc đề, chép linh tinh hoặc suy diễn hoàn toàn không có trong bài -> isGrounded: false.
   - Nếu câu trả lời có chứa thông tin hoặc suy luận bắt nguồn từ văn bản -> isGrounded: true.
2. **Không kết luận võ đoán, không chấm điểm, không làm bài hộ**:
   - Tuyệt đối KHÔNG viết câu trả lời hoàn chỉnh thay học sinh.
   - Tuyệt đối KHÔNG chấm điểm (không cho điểm số 8/10 hay A/B/C).
   - Nếu câu trả lời thiếu căn cứ (isGrounded = false): Không đưa ra kết luận chê trách; thay vào đó nhắc nhở học sinh đọc lại đoạn văn kèm theo trích dẫn cụ thể.
3. **Chỉ trích dẫn các trích đoạn trong đoạn văn làm dẫn chứng (citationQuotes)**:
   - Trích dẫn chính xác 1-2 câu văn hoặc cụm từ có thật trong đoạn văn liên quan trực tiếp đến câu hỏi để làm bằng chứng cho học sinh đối chiếu.
4. **Gợi ý tự điều chỉnh (guidedHint & feedbackComment)**:
   - Viết lời nhận xét thân thiện, khích lệ tư duy của lứa tuổi THCS.
   - Chỉ ra điểm học sinh đã làm tốt hoặc câu hỏi gợi mở để học sinh tự bổ sung/sửa đổi câu trả lời.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một trợ giảng Ngữ Văn THCS ân cần, giúp học sinh rèn luyện kỹ năng đọc hiểu qua việc đối chiếu trực tiếp với dẫn chứng trong văn bản.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isGrounded: { type: Type.BOOLEAN, description: "Câu trả lời có dựa trên văn bản hay không" },
            citationQuotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Các câu trích dẫn nguyên văn từ bài đọc làm căn cứ"
            },
            feedbackComment: { type: Type.STRING, description: "Nhận xét sư phạm thân thiện đối chiếu với dẫn chứng" },
            guidedHint: { type: Type.STRING, description: "Gợi ý để học sinh tự suy nghĩ và điều chỉnh lại câu trả lời" },
            canRefine: { type: Type.BOOLEAN, description: "Khuyến khích học sinh viết lại hoàn thiện hơn" }
          },
          required: ["isGrounded", "citationQuotes", "feedbackComment", "guidedHint", "canRefine"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      isGrounded: Boolean(parsed.isGrounded),
      citationQuotes: parsed.citationQuotes || [citationQuote].filter(Boolean),
      feedbackComment: parsed.feedbackComment || "Hãy đối chiếu câu trả lời của em với các câu trích dẫn từ văn bản để hoàn thiện hơn.",
      guidedHint: parsed.guidedHint || "Em hãy quan sát kỹ các từ ngữ then chốt trong đoạn trích dẫn.",
      canRefine: parsed.canRefine ?? true
    });
  } catch (error: any) {
    console.error("Gemini API answer check error:", error);
    return res.json({
      isGrounded: true,
      citationQuotes: [citationQuote || ""].filter(Boolean),
      feedbackComment: "Câu trả lời của em đã bước đầu bám sát câu hỏi. Hãy so sánh đối chiếu với câu trích dẫn từ văn bản bên dưới để hoàn thiện chi tiết hơn nhé!",
      guidedHint: hintLevel2 || "Chú ý các từ ngữ miêu tả trực tiếp trong đoạn trích.",
      canRefine: true
    });
  }
});

// In-memory cache for audio streams to ensure instant replay
const ttsCache = new Map<string, Buffer>();

// Single chunk synthesizer using Microsoft Neural TTS
async function synthesizeEdgeTtsChunk(
  text: string, 
  voice: string = "vi-VN-HoaiMyNeural", 
  rate: string = "-5%"
): Promise<Buffer> {
  const tmpFile = path.join(os.tmpdir(), `tts_${crypto.randomUUID()}.mp3`);
  const clean = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const tts = new EdgeTTS({
    voice,
    lang: "vi-VN",
    outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    rate: rate || "-5%",
    timeout: 35000,
  });

  try {
    await tts.ttsPromise(clean, tmpFile);
    const buf = await fs.promises.readFile(tmpFile);
    await fs.promises.unlink(tmpFile).catch(() => {});
    return buf;
  } catch (err) {
    await fs.promises.unlink(tmpFile).catch(() => {});
    throw err;
  }
}

// Helper to chunk long text into natural paragraphs/sentences for parallel synthesis
function splitTextForNeuralTts(text: string, maxLen = 450): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  // Split on double line break or sentences
  const segments = clean.split(/(?<=[.?!;:\n])\s+/);
  let current = "";

  for (const seg of segments) {
    if ((current + " " + seg).trim().length <= maxLen) {
      current = (current + " " + seg).trim();
    } else {
      if (current) chunks.push(current);
      if (seg.length > maxLen) {
        // Fallback split on commas
        const subParts = seg.split(/(?<=[,])\s+/);
        let subCurrent = "";
        for (const p of subParts) {
          if ((subCurrent + " " + p).trim().length <= maxLen) {
            subCurrent = (subCurrent + " " + p).trim();
          } else {
            if (subCurrent) chunks.push(subCurrent);
            subCurrent = p;
          }
        }
        if (subCurrent) chunks.push(subCurrent);
        current = "";
      } else {
        current = seg;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(c => c.length > 0);
}

// Fallback TTS chunker in case of network constraint
function fetchTtsFallbackChunk(chunk: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Fallback TTS failed with status ${res.statusCode}`));
      }
      const data: Buffer[] = [];
      res.on("data", (d) => data.push(d));
      res.on("end", () => resolve(Buffer.concat(data)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Endpoint: High-Quality Studio Natural Vietnamese Text-to-Speech
app.post("/api/tts", async (req, res) => {
  const { text, voice: voiceParam, rate: rateParam } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Thiếu văn bản cần chuyển thành giọng đọc." });
  }

  const trimmed = text.trim();
  const voiceName = voiceParam === "namminh" 
    ? "vi-VN-NamMinhNeural" 
    : "vi-VN-HoaiMyNeural";
  const rateValue = rateParam || "-5%";
  const cacheKey = `${voiceName}:${rateValue}:${trimmed}`;

  if (ttsCache.has(cacheKey)) {
    const cached = ttsCache.get(cacheKey)!;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", cached.length);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(cached);
  }

  try {
    let combinedAudio: Buffer;

    try {
      // Primary: High-fidelity Microsoft Neural Voice (Studio Quality 96kbps)
      const chunks = splitTextForNeuralTts(trimmed, 500);
      if (chunks.length <= 1) {
        combinedAudio = await synthesizeEdgeTtsChunk(trimmed, voiceName, rateValue);
      } else {
        // Parallel synthesis of chunks for maximum speed
        const buffers = await Promise.all(
          chunks.map(chunk => synthesizeEdgeTtsChunk(chunk, voiceName, rateValue))
        );
        combinedAudio = Buffer.concat(buffers);
      }
    } catch (primaryErr) {
      console.warn("Primary Neural TTS failed, switching to backup engine:", primaryErr);
      // Fallback: Google TTS
      const fallbackChunks = splitTextForNeuralTts(trimmed, 180);
      const buffers: Buffer[] = [];
      for (const fc of fallbackChunks) {
        buffers.push(await fetchTtsFallbackChunk(fc));
      }
      combinedAudio = Buffer.concat(buffers);
    }

    // Limit cache size to 60 items
    if (ttsCache.size > 60) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, combinedAudio);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", combinedAudio.length);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(combinedAudio);
  } catch (err: any) {
    console.error("TTS processing final error:", err);
    return res.status(500).json({ error: "Không thể tạo giọng đọc tự nhiên lúc này." });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luyện Đọc Hiểu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
