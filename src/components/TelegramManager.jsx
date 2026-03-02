import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { setUserSettings } from "@/lib/firestoreService";
import { runTelegramAnalysis } from "@/lib/telegramManagerApi";
import { Send, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TelegramManager() {
  const { user, refreshProfile } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setIsEnabled(!!user.telegram_manager_enabled);
    setTime(user.telegram_manager_time || "09:00");
    setTelegramChatId(user.telegram_chat_id ? String(user.telegram_chat_id) : "");
    setLoading(false);
  }, [user]);

  const saveSettings = async (updates) => {
    if (!user?.uid) return;
    try {
      await setUserSettings(user.uid, updates);
      if (updates.telegram_manager_enabled !== undefined) setIsEnabled(!!updates.telegram_manager_enabled);
      if (updates.telegram_manager_time !== undefined) setTime(updates.telegram_manager_time);
      if (updates.telegram_chat_id !== undefined) setTelegramChatId(String(updates.telegram_chat_id ?? ""));
      await refreshProfile();
    } catch (e) {
      console.error("Failed to save settings:", e);
      toast.error("Einstellungen konnten nicht gespeichert werden.");
    }
  };

  const toggleEnabled = () => {
    saveSettings({
      telegram_manager_enabled: !isEnabled,
      telegram_manager_time: time,
    });
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    saveSettings({
      telegram_manager_enabled: isEnabled,
      telegram_manager_time: newTime,
    });
  };

  const handleChatIdBlur = () => {
    const v = telegramChatId.trim();
    if (v !== (user?.telegram_chat_id ?? "")) {
      saveSettings({
        telegram_chat_id: v || null,
        telegram_manager_enabled: isEnabled,
        telegram_manager_time: time,
      });
    }
  };

  const handleSendNow = async () => {
    if (!user?.uid) return;
    const chatId = telegramChatId.trim();
    if (!chatId) {
      toast.error("Bitte zuerst deine Telegram Chat-ID eintragen.");
      return;
    }
    setSending(true);
    try {
      await runTelegramAnalysis(user.uid, chatId, "de");
      toast.success("Briefing wurde an Telegram gesendet.");
    } catch (e) {
      console.error("Telegram analysis failed:", e);
      const msg = e?.message || e?.code || String(e);
      toast.error("Briefing konnte nicht gesendet werden: " + msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-[#E8E8E0] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#0088cc18" }}>
            <Send className="w-5 h-5" style={{ color: "#0088cc" }} />
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wider">Telegram Manager</h3>
            <p className="text-[11px] text-[#8A8A80] mt-0.5">Automatische tägliche Analyse und Telegram Nachricht</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-[#8A8A80]" />
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              onBlur={handleChatIdBlur}
              placeholder="Telegram Chat-ID"
              className="w-36 px-3 py-2 bg-[#F5F5F0] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A8A80] focus:outline-none focus:ring-2 focus:ring-[#0088cc]/30"
              title="Chat-ID von @userinfobot in Telegram erhalten"
            />
          </div>

          {isEnabled && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#8A8A80]" />
              <input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="bg-transparent text-sm font-medium text-[#1A1A1A] focus:outline-none"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSendNow}
            disabled={loading || sending || !telegramChatId.trim()}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#E8E8E0] text-[#1A1A1A] hover:bg-[#D8D8D0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? "Senden…" : "Jetzt Briefing senden"}
          </button>

          <button
            onClick={toggleEnabled}
            disabled={loading}
            className={`
              px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all
              ${isEnabled ? "bg-[#0088cc] text-white hover:bg-[#0077b3]" : "bg-[#E8E8E0] text-[#8A8A80] hover:bg-[#D8D8D0]"}
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {isEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>
      <p className="text-[11px] text-[#8A8A80] mt-3">
        Chat-ID: In Telegram @userinfobot starten → deine ID ist die Nummer. Optional: Bot zuerst mit /start starten.
      </p>
    </div>
  );
}
