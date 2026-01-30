# 🦦 OtterKlausi Dashboard

**Erweitertes Dashboard mit Kanban, AI-Status, Aktivitäts-Log & mehr**

**Live URL:** https://otterklausi.netlify.app

---

## 📊 Board Structure

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  📥 To Do   │  🔄 Karim   │  🤖 Klausi  │  ✅ Done    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Columns:**
- **To Do** - Neue Tasks, noch nicht assigned
- **Karim** - Karim bearbeitet
- **Klausi** - Klausi (AI) bearbeitet automatisch
- **Done** - Erledigt ✅

---

## 🤖 Automatic Task Processing

**Klausi checks for tasks 2x daily via Heartbeat:**

```bash
node kanban-task-processor.js
```

**Task Detection:**
- Keywords im Titel/Description triggern Auto-Processing
- `blog`, `artikel` → Blogbeitrag schreiben
- `research`, `recherche` → Web-Research
- `seo`, `keyword` → SEO-Analyse
- `notion`, `import` → Notion Import/Export
- `code`, `script` → Code schreiben

**Workflow:**
1. Task in "Klausi"-Spalte verschieben
2. Klausi analysiert Task-Typ (beim nächsten Check: morgens oder nachmittags)
3. Klausi bearbeitet oder fragt nach Details
4. Task wandert zu "Done" oder zurück zu "Karim"

**Check-Zeiten:**
- Morgens: 08:00-10:00 UTC (10:00-12:00 Mallorca-Zeit)
- Nachmittags: 14:00-16:00 UTC (16:00-18:00 Mallorca-Zeit)

---

## 🚀 Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Drag & Drop:** @dnd-kit
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Hosting:** Netlify
- **Automation:** Node.js Task Processor

---

## 📁 Files

```
kanban-board/
├── src/
│   ├── App.jsx              # Main app with DnD
│   ├── supabaseClient.js    # Supabase config
│   └── components/
│       ├── Column.jsx       # Board column
│       ├── TaskCard.jsx     # Task card
│       └── AddTaskModal.jsx # Task creation modal
├── kanban-task-processor.js # Klausi automation ⭐
├── setup-database.js        # Supabase table setup
└── README.md                # This file
```

---

## 🎯 Usage Examples

### Create a Task for Klausi

**Option 1: Via Web UI**
1. Open https://dogcare24-kanban.netlify.app
2. Click "+ Neuer Task"
3. Title: "Blogbeitrag: Patellaluxation beim Hund"
4. Priority: High
5. Drag to "Klausi" column

**Option 2: Via Supabase**
```javascript
await supabase.from('tasks').insert({
  id: `task-${Date.now()}`,
  title: 'Research: Hundekrankenversicherung Vergleich',
  description: 'Top 5 Versicherungen recherchieren',
  status: 'klausi',
  priority: 'high',
  created_at: new Date().toISOString()
});
```

**→ Klausi picks it up beim nächsten Check (morgens oder nachmittags)!**

---

## 🔄 Real-time Sync

**All changes sync instantly across all devices:**
- Create task → Appears everywhere
- Drag to new column → Updates everywhere
- Edit task → Changes propagate

**Powered by Supabase Realtime** 🚀

---

## 🛠️ Development

**Install dependencies:**
```bash
npm install
```

**Run locally:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

**Deploy:**
```bash
npx netlify deploy --prod --dir=dist
```

---

## 🤖 Task Processor

**Manual run:**
```bash
node kanban-task-processor.js
```

**Dry-run (no changes):**
```bash
node kanban-task-processor.js --dry-run
```

**Automatic (via Heartbeat):**
- Runs 2x daily (mornings & afternoons)
- Check times: ~09:00 UTC & ~15:00 UTC
- Checks "klausi" column
- Processes tasks automatically
- Updates status

---

## 📊 Database Schema

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,  -- 'todo', 'karim', 'klausi', 'done'
  priority TEXT,         -- 'low', 'medium', 'high'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎓 Integration with Dogcare24 Workflow

**Typical workflow:**

1. **Karim creates task** → "Blogbeitrag: Arthrose beim Hund"
2. **Drags to Klausi** → Status = 'klausi'
3. **Klausi detects** (beim nächsten Check: morgens oder nachmittags)
4. **Klausi processes:**
   - Identifies type: "blogpost"
   - Runs SEO Writer Skill
   - Writes full article (3-step workflow)
5. **Klausi moves to Done** ✅ or back to "karim" if input needed

---

## 💡 Pro Tips

**For Karim:**
- Use clear titles ("Blogbeitrag: [Topic]")
- Add details in description
- Set priority for urgent tasks
- Check "klausi" column progress

**For Klausi:**
- Check 2x daily via Heartbeat (~09:00 & ~15:00 UTC)
- Analyze task type from title/description
- Ask for clarification if needed (move to "karim")
- Update task with progress notes

---

## 🦦 Notes

- Supabase Free Tier: 500 MB database (plenty for kanban)
- Realtime updates work across all browsers/devices
- Task processor runs automatically via Heartbeat
- No deploy needed for task changes (all in DB)

**Created:** 2026-01-26  
**Status:** ✅ Production + Automation ready
