export const MESSAGES = {
  greeting: `👋 Hello! Welcome!

I'm here to share something exciting — a *simple income opportunity* that's changing lives.

Before I show you how it works, I'd love to learn a bit about you.

What's your *first name*?`,

  askGoal: (name: string) => `Great to meet you, *${name}*! 🙌

Let me ask you something important:

*Are you currently happy with your income, or are you looking for a way to earn more?*

Reply with:
1️⃣ - I want more income
2️⃣ - I'm doing okay but open to ideas
3️⃣ - I'm not interested right now`,

  askTime: `Perfect! Here's a quick question:

*How much time could you dedicate to building something new?*

1️⃣ - Less than 1 hour/day
2️⃣ - 1-3 hours/day  
3️⃣ - More than 3 hours/day`,

  askDecision: `One more question before I show you the opportunity:

*Are you someone who makes their own decisions, or do you need to consult others first?*

1️⃣ - I make my own decisions
2️⃣ - I'd need to check with my partner/family`,

  askUrgency: `Last one — I promise! 😄

*How soon do you need a change in your income situation?*

1️⃣ - ASAP — I need this now
2️⃣ - Within the next few months
3️⃣ - Someday, no rush`,

  presentation: `🎯 *Here's Your Opportunity*

I work with a network marketing company that has a *simple, proven system* for creating income.

💡 *How it works:*
✅ Join with one of our packages (Starter → Advanced)
✅ Introduce others to the opportunity (earn direct income)
✅ Help your team grow (earn leveraged income)

📦 *Our Packages:*
• 🟢 *Starter* — Low entry, get started quickly
• 🔵 *Mid Level* — More earning power
• 🔴 *Advanced* — Maximum earning potential

🔁 *The System:*
Invite → Show → Follow Up → Help Start → Duplicate

✨ *What you get:*
• No experience needed
• Full mentorship & support
• Flexible — work around your schedule
• Active + passive income streams
• Personal development included

*The best part?* You don't sell. You share. The system does the work.

👇 Do you have any questions, or are you ready to explore how to get started?`,

  hotLead: `🔥 *You sound like exactly the kind of person this works for!*

You're motivated, decisive, and ready to take action — those are the qualities that make people succeed in this.

I'd love to connect you with my mentor directly so you can get all your questions answered and get started.

*Are you ready to take the next step?* 🚀

Reply *YES* and I'll connect you right away!`,

  warmFollowUp1: `👋 Hey! Just checking in.

I know life gets busy, but I wanted to remind you — the opportunity we discussed is still available.

*Here's what I want you to remember:*
Most people who succeed here started exactly where you are — unsure, a little hesitant, but willing to try.

*What's the one thing holding you back right now?*`,

  warmFollowUp2: `💡 *Quick thought for you...*

Every day without an extra income stream is a day working only for others.

What if 6 months from now you looked back and said: *"I'm glad I took that step."*

The door is still open. What do you say? 🚀`,

  warmFollowUp3: `🎯 *Final check-in!*

I don't want to keep nudging you if this isn't for you — and that's totally okay.

But if there's ANY part of you that's curious about creating extra income...

*Now is a great time to ask your last questions and decide.*

What's on your mind? 🤔`,

  coldLead: `No worries at all! 😊

This opportunity isn't for everyone, and that's completely okay.

If you ever change your mind or know someone who might be interested, feel free to come back anytime!

Take care, and wishing you all the best! 🌟`,

  adminNotification: (lead: {
    firstName?: string | null;
    username?: string | null;
    telegramId: string;
    temperature?: string | null;
    qualificationScore?: number | null;
    answers?: string | null;
  }) => {
    const answers = lead.answers ? JSON.parse(lead.answers) : {};
    return `🔥 *HOT LEAD READY FOR CLOSING!*

👤 *Name:* ${lead.firstName || "Unknown"}
📱 *Username:* ${lead.username ? `@${lead.username}` : "No username"}
🆔 *Telegram ID:* ${lead.telegramId}
🌡️ *Temperature:* ${lead.temperature?.toUpperCase()}
⭐ *Score:* ${lead.qualificationScore}/100

📋 *Qualification Answers:*
• Income goal: ${answers.goal || "N/A"}
• Time available: ${answers.time || "N/A"}
• Decision maker: ${answers.decision || "N/A"}
• Urgency: ${answers.urgency || "N/A"}

👉 *Action:* Message this prospect directly on Telegram to close!`;
  },

  readyToConnect: `🎉 Amazing! I'll let my mentor know you're ready.

*They'll reach out to you very shortly* to answer any final questions and help you get started.

Get ready — your journey to a better income is about to begin! 🚀`,
};
