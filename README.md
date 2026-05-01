# 📚 EduTrack — School Student Management System

A clean, modern student management web app that runs entirely in the browser. No backend or server required — runs on **GitHub Pages** for free.

---

## ✨ Features

- **Dashboard** — Overview stats: total students, average grade, attendance rate, top performer, grade distribution chart
- **Students** — Add, edit, delete students; search & filter by class
- **Grades** — Record subject scores, view letter grades (A+/A/B/C/D/F), filter by student
- **Attendance** — Record Present / Absent / Late / Excused per student per day
- **Data persistence** — All data is saved in browser localStorage (no server needed)
- **Responsive** — Works on desktop, tablet, and mobile

---

## 🚀 How to Run on GitHub Pages

### Step 1 — Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it anything, e.g. `student-management`
4. Set it to **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2 — Upload the Files

Upload these 3 files to the repository root:
- `index.html`
- `style.css`
- `app.js`

You can drag & drop them on the GitHub web interface.

### Step 3 — Enable GitHub Pages

1. Go to your repository **Settings**
2. Click **Pages** in the left sidebar
3. Under **Source**, select `Deploy from a branch`
4. Choose `main` branch and `/ (root)` folder
5. Click **Save**

### Step 4 — Access Your App

After a minute, your app will be live at:
```
https://<your-username>.github.io/<repository-name>/
```

---

## 💾 Data Storage

Data is stored in your browser's `localStorage`. This means:
- Data persists across page refreshes ✅
- Data is private to your browser ✅
- Data does NOT sync across devices ⚠️
- Clearing browser data will reset the app ⚠️

For a shared/multi-user setup, you would need a backend (Firebase, Supabase, etc.).

---

## 🗂 File Structure

```
/
├── index.html   ← Main HTML structure
├── style.css    ← All styles and theming
├── app.js       ← All logic, data management, rendering
└── README.md    ← This file
```

---

## 🛠 Customization

- **School name**: Edit the `.school-name` div in `index.html`
- **Colors**: Change CSS variables in `style.css` under `:root`
- **Seed data**: Modify the `seedData()` function in `app.js` to pre-populate with your students

---

## 📄 License

Free to use and modify for educational purposes.
