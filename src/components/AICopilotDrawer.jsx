import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Settings, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  Rocket, 
  PieChart, 
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';
import { 
  askAICopilot, 
  loadAIConfig, 
  saveAIConfig, 
  checkOllamaConnection, 
  DEFAULT_AI_CONFIG,
  buildAIContext 
} from '../services/aiService';

const QUICK_PROMPTS = [
  { id: 'priorities', label: 'Hôm nay nên làm gì?', icon: TargetIcon, color: 'text-emerald-500' },
  { id: 'risks', label: 'Rủi ro trễ hạn', icon: AlertTriangle, color: 'text-amber-500' },
  { id: 'launches', label: 'Kế hoạch ra mắt', icon: Rocket, color: 'text-sage-500' },
  { id: 'productivity', label: 'Đánh giá hiệu suất', icon: PieChart, color: 'text-blue-500' },
];

function TargetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function AICopilotDrawer({
  isOpen,
  onClose,
  tasks = [],
  products = [],
  categories = []
}) {
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Xin chào! Tôi là **Trợ lý AI Copilot** của bạn.

Tôi đã đồng bộ với toàn bộ dữ liệu công việc và lịch ra mắt sản phẩm hiện tại của bạn.

Bạn có thể bấm các nút gợi ý nhanh bên dưới hoặc đặt câu hỏi bất kỳ để tôi hỗ trợ lên kế hoạch và phân bổ thời gian tối ưu!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Settings State
  const [aiConfig, setAiConfig] = useState(loadAIConfig);
  const [ollamaStatus, setOllamaStatus] = useState(null); // null | 'testing' | 'connected' | 'disconnected'
  const [availableModels, setAvailableModels] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !showSettings && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, showSettings]);

  // Context summary data
  const context = buildAIContext(tasks, products, categories);

  const handleSendMessage = async (textToSend, queryType = 'custom') => {
    const text = textToSend || inputText.trim();
    if (!text && queryType === 'custom') return;

    const userMsgId = 'user-' + Date.now();
    const newMsg = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await askAICopilot({
        message: text,
        queryType,
        tasks,
        products,
        categories,
      });

      const aiMsgId = 'ai-' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: 'assistant',
          content: response.reply,
          provider: response.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `❌ Có lỗi xảy ra trong quá trình xử lý: ${err.message}. Vui lòng thử lại.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPromptClick = (prompt) => {
    handleSendMessage(prompt.label, prompt.id);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Đã dọn dẹp lịch sử hội thoại. Tôi sẵn sàng hỗ trợ kế hoạch làm việc tiếp theo của bạn!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleTestOllama = async () => {
    setOllamaStatus('testing');
    const res = await checkOllamaConnection(aiConfig.ollamaUrl);
    if (res.connected) {
      setOllamaStatus('connected');
      setAvailableModels(res.models);
      if (res.models.length > 0 && !res.models.includes(aiConfig.ollamaModel)) {
        setAiConfig((prev) => ({ ...prev, ollamaModel: res.models[0] }));
      }
    } else {
      setOllamaStatus('disconnected');
    }
  };

  const handleSaveSettings = () => {
    saveAIConfig(aiConfig);
    setShowSettings(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sage-600 to-emerald-500 text-white flex items-center justify-center shadow-soft shadow-sage-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Trợ lý AI Copilot
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                  {aiConfig.provider === 'ollama' ? 'Ollama Local' : 'Local AI Engine'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tối ưu hóa thứ tự ưu tiên & điều phối kế hoạch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Cài đặt AI"
              className={`p-1.5 rounded-xl transition-colors ${
                showSettings
                  ? 'bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-300'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearHistory}
              title="Xóa lịch sử chat"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Đóng cửa sổ"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Context Metrics Pill Bar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none gap-3">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Quá hạn: <strong>{context.overdueTasks.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Hôm nay: <strong>{context.todayTasks.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-sage-500" />
            <span>Ra mắt 2 ngày: <strong>{context.launchesWithin2Days.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Xong: <strong>{context.completionRate}%</strong></span>
          </div>
        </div>

        {/* Main Body: Settings Panel OR Chat Conversation */}
        {showSettings ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 animate-fade-in text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                Cấu hình Chế độ AI
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-sage-600 dark:text-sage-400 font-semibold text-xs"
              >
                Quay lại chat
              </button>
            </div>

            {/* Provider Switcher */}
            <div>
              <label className="block font-semibold mb-1.5">Chọn Cơ chế Trí tuệ Nhân tạo:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiConfig((prev) => ({ ...prev, provider: 'builtin' }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    aiConfig.provider === 'builtin'
                      ? 'border-sage-500 bg-sage-50/70 dark:bg-sage-950/50 text-sage-900 dark:text-sage-200 font-semibold ring-2 ring-sage-500/20'
                      : 'border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    ⚡ Built-in Local Engine
                  </div>
                  <p className="text-[10px] font-normal opacity-80 mt-1 leading-snug">
                    Mặc định siêu nhẹ, 0 MB tải thêm, phản hồi tức thì 0 giây, không cần cài đặt.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiConfig((prev) => ({ ...prev, provider: 'ollama' }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    aiConfig.provider === 'ollama'
                      ? 'border-sage-500 bg-sage-50/70 dark:bg-sage-950/50 text-sage-900 dark:text-sage-200 font-semibold ring-2 ring-sage-500/20'
                      : 'border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1">
                    🦙 Ollama Local
                  </div>
                  <p className="text-[10px] font-normal opacity-80 mt-1 leading-snug">
                    Kết nối mô hình LLM chạy trên máy cá nhân (localhost:11434).
                  </p>
                </button>
              </div>
            </div>

            {/* Ollama options if selected */}
            {aiConfig.provider === 'ollama' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-750 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa chỉ máy chủ Ollama
                  </label>
                  <input
                    type="text"
                    value={aiConfig.ollamaUrl}
                    onChange={(e) => setAiConfig({ ...aiConfig, ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Model (Khuyên dùng qwen2.5:0.5b hoặc llama3.2:1b)
                  </label>
                  <input
                    type="text"
                    value={aiConfig.ollamaModel}
                    onChange={(e) => setAiConfig({ ...aiConfig, ollamaModel: e.target.value })}
                    placeholder="qwen2.5:0.5b"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleTestOllama}
                    disabled={ollamaStatus === 'testing'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    <RefreshCw className={`w-3 h-3 ${ollamaStatus === 'testing' ? 'animate-spin' : ''}`} />
                    <span>Kiểm tra kết nối</span>
                  </button>

                  {ollamaStatus === 'connected' && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Kết nối tốt
                    </span>
                  )}
                  {ollamaStatus === 'disconnected' && (
                    <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                      Không tìm thấy Ollama (tự động fallback)
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs shadow-soft transition-all"
            >
              Lưu cấu hình AI
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              {QUICK_PROMPTS.map((qp) => {
                const IconComponent = qp.icon;
                return (
                  <button
                    key={qp.id}
                    onClick={() => handleQuickPromptClick(qp)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-sage-100 hover:text-sage-900 dark:hover:bg-slate-750 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all border border-slate-200/60 dark:border-slate-750"
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${qp.color}`} />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed animate-fade-in ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative group max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-sage-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-750'
                    }`}
                  >
                    {/* Message Body formatting */}
                    <div className="whitespace-pre-wrap font-sans space-y-1">
                      {msg.content}
                    </div>

                    {/* Footer metadata & copy button */}
                    <div className={`mt-2 flex items-center justify-between text-[10px] opacity-60 ${
                      isUser ? 'text-sage-100' : 'text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Sao chép câu trả lời"
                          className="hover:opacity-100 p-0.5"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-slate-400 italic">
                <div className="w-7 h-7 rounded-xl bg-sage-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <span>Copilot đang phân tích dữ liệu...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              id="ai-copilot-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hỏi AI Copilot về công việc, kế hoạch, ưu tiên..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              id="btn-send-ai-message"
              disabled={!inputText.trim() || isTyping}
              className="px-3.5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 active:scale-98 text-white transition-all disabled:opacity-40 shadow-soft shadow-sage-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
