/**
 * Cloud Function: Telegram Manager
 * Sammelt Daten (vom Frontend oder aus Firestore), schickt sie an Claude, sendet Ergebnis per Telegram.
 *
 * Aufruf (callable): runTelegramAnalysis({ telegramChatId, language?, payload })
 * payload = { user: { name, goal }, projects, tasks, goals, mood_entries, focus_modules }
 *
 * Secrets (Firebase): ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN
 *   firebase functions:secrets:set ANTHROPIC_API_KEY
 *   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Anthropic from "@anthropic-ai/sdk";

const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");
const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");

const SYSTEM_PROMPT_DE = `Du bist ein persönlicher Fokus- und Lebensmanager (Executive Assistant + Coach).
Deine Aufgabe: Der User soll sich fokussiert fühlen und genau wissen, was heute dran ist.
Prinzipien:
- Qualität vor Menge: 1–2 starke Schritte pro Tag, die zur Zielerreichung beitragen.
- Sei KLAR und ENTSCHIEDEN: Kein "vielleicht das oder jenes". Sage klar: "Heute machst du: [Aufgabe 1] und [Aufgabe 2]."
- Fokus zuerst: Nenne am Anfang, worauf der User gerade fokussiert ist (Projekt/ Ziel).
- Energie beachten: Wenn Stimmung/Mood niedrig, eine kleine schnelle Aufgabe vorschlagen.
Antworte auf Deutsch, warm aber bestimmt. Maximal 3 kurze Absätze. Emojis in Maßen.`;

const SYSTEM_PROMPT_EN = `You are a personal focus and life manager (Executive Assistant + Coach).
Your job: Help the user feel focused and know exactly what to do today.
Principles:
- Quality over quantity: 1–2 strong steps per day that move toward their goal.
- Be CLEAR and DECISIVE: No "maybe do this or that". Say clearly: "Today you're doing: [Task 1] and [Task 2]."
- Focus first: State at the start what they're focused on (project/goal).
- Consider energy: If mood is low, suggest one small quick win.
Reply in English, warm but firm. Max 3 short paragraphs. Emojis in moderation.`;

function buildContext(payload) {
  const { user = {}, projects = [], tasks = [], goals = [], mood_entries = [], focus_modules = [] } = payload;
  const name = user.name || "User";
  const goal = user.goal || "";
  const pending = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const projectTitles = projects.map((p) => p.title).join(", ") || "—";
  const goalTitles = goals.map((g) => g.title).join(", ") || "—";
  const focusStr = focus_modules.length ? focus_modules.map((f) => f.title || f.slot || "—").join(", ") : (projects[0]?.title || "—");
  const pendingList = pending.length ? pending.map((t) => `- ${t.title}`).join("\n") : "Keine offenen Aufgaben.";
  const doneList = done.length ? done.map((t) => `✅ ${t.title}`).join("\n") : "Noch keine erledigt heute.";
  const lastMood = mood_entries[0];
  const moodStr = lastMood ? `${lastMood.mood || ""} (${lastMood.mood_score || 0}/5)` : "—";

  return {
    name,
    goal,
    focusStr,
    projectTitles,
    goalTitles,
    pendingList,
    doneList,
    moodStr,
  };
}

export const runTelegramAnalysis = onCall(
  {
    region: "europe-west1",
    secrets: [anthropicApiKey, telegramBotToken],
  },
  async (request) => {
    // App nutzt Base44-Auth; Callable kann ohne Firebase Auth aufgerufen werden.
    const { telegramChatId, language = "de", payload } = request.data || {};
    if (!telegramChatId) {
      throw new HttpsError("invalid-argument", "telegramChatId is required.");
    }
    if (!payload) {
      throw new HttpsError("invalid-argument", "payload (user, projects, tasks, goals, mood_entries, focus_modules) is required.");
    }

    const apiKey = anthropicApiKey.value();
    const botToken = telegramBotToken.value();
    if (!apiKey || !botToken) {
      throw new HttpsError("failed-precondition", "ANTHROPIC_API_KEY or TELEGRAM_BOT_TOKEN not set. Use: firebase functions:secrets:set ...");
    }

    const ctx = buildContext(payload);
    const lang = language === "en" ? "en" : "de";
    const systemPrompt = lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_DE;

    const userPrompt = `User: ${ctx.name}
Goal / Lebensziel: ${ctx.goal || "—"}

Current focus (Projekt/Ziel): ${ctx.focusStr}
Projects: ${ctx.projectTitles}
Goals: ${ctx.goalTitles}
Last mood: ${ctx.moodStr}

Completed tasks:
${ctx.doneList}

Pending tasks:
${ctx.pendingList}

Write a short, firm manager briefing for today. State focus first, then 1–2 clear tasks to do. No maybes. Be warm but decisive.`;

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = response.content?.[0]?.type === "text" ? response.content[0].text : "";

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: String(telegramChatId),
        text: text || "Keine Analyse verfügbar.",
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new HttpsError("internal", "Telegram send failed: " + err);
    }

    return { success: true, message: "Telegram gesendet." };
  }
);
