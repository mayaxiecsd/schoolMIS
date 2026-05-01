// ============================
//  EduTrack — Student Management
//  Pure JS, localStorage persistence
// ============================

// ---- DATA STORE ----
let students   = JSON.parse(localStorage.getItem('et_students')   || '[]');
let grades     = JSON.parse(localStorage.getItem('et_grades')     || '[]');
let attendance = JSON.parse(localStorage.getItem('et_attendance') || '[]');

function save() {
  localStorage.setItem('et_students',   JSON.stringify(students));
  localStorage.setItem('et_grades',     JSON.stringify(grades));
  localStorage.setItem('et_attendance', JSON.stringify(attendance));
}

// ---- SEED DATA (first run) ----
function seedData() {
  if (students.length > 0) return;

  const names  = ['Lalruata Hnamte','Zohmingliani Sailo','Vanlalruata Pachuau',
                   'Malsawmi Colney','Lalnunpuia Sailo','Rimawii Ralte',
                   'Zothanpuia Khiangte','Laldingpuii Hmar','Rothangpuia Sailo','Vanlalhriatpuii Colney'];
  const classes= ['Grade 9A','Grade 9B','Grade 10A','Grade 10B','Grade 11','Grade 12'];
  const ages   = [14,15,16,17,18];

  names.forEach((name, i) => {
    const id = 'S' + String(i+1).padStart(3,'0');
    students.push({
      id, name,
      class: classes[i % classes.length],
      age: ages[i % ages.length],
      gender: i % 2 === 0 ? 'Male' : 'Female',
      email: name.split(' ')[0].toLowerCase() + '@school.edu',
      phone: '+91 9876543' + String(i).padStart(3,'0'),
      address: 'Aizawl, Mizoram'
    });

    // seed 3 grades per student
    ['Mathematics','Science','English'].forEach(subj => {
      const score = 50 + Math.floor(Math.random() * 51);
      grades.push({
        id: 'G' + Date.now() + Math.random(),
        studentId: id,
        subject: subj,
        score,
        date: new Date(2025, Math.floor(Math.random()*10), 1+Math.floor(Math.random()*28))
               .toISOString().split('T')[0]
      });
    });

    // seed attendance
    for (let d = 1; d <= 10; d++) {
      const statuses = ['Present','Present','Present','Present','Absent','Late'];
      attendance.push({
        id: 'A' + Date.now() + Math.random() + d,
        studentId: id,
        date: `2025-09-${String(d).padStart(2,'0')}`,
        status: statuses[Math.floor(Math.random()*statuses.length)],
        note: ''
      });
    }
  });

  save();
}

// ---- HELPERS ----
function uid() { return '_' + Math.random().toString(36).slice(2, 9); }

function gradeFromScore(s) {
  if (s >= 90) return 'A+';
  if (s >= 80) return 'A';
  if (s >= 70) return 'B';
  if (s >= 60) return 'C';
  if (s >= 50) return 'D';
  return 'F';
}

function gradeClass(g) {
  if (g.startsWith('A')) return 'grade-A';
  if (g.startsWith('B')) return 'grade-B';
  if (g.startsWith('C')) return 'grade-C';
  if (g.startsWith('D')) return 'grade-D';
  return 'grade-F';
}

function studentAvg(id) {
  const sg = grades.filter(g => g.studentId === id);
  if (!sg.length) return null;
  return (sg.reduce((a, g) => a + g.score, 0) / sg.length).toFixed(1);
}

function studentAttendance(id) {
  const sa = attendance.filter(a => a.studentId === id);
  if (!sa.length) return null;
  const present = sa.filter(a => a.status === 'Present' || a.status === 'Late').length;
  return ((present / sa.length) * 100).toFixed(0) + '%';
}

function nameById(id) {
  const s = students.find(s => s.id === id);
  return s ? s.name : id;
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ---- NAVIGATION ----
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  if (page === 'dashboard')  renderDashboard();
  if (page === 'students')   renderStudents();
  if (page === 'grades')     renderGrades();
  if (page === 'attendance') renderAttendance();
}

// ---- DASHBOARD ----
function renderDashboard() {
  document.getElementById('stat-total').textContent = students.length;

  // avg grade
  const allScores = grades.map(g => g.score);
  if (allScores.length) {
    const avg = (allScores.reduce((a,b)=>a+b,0)/allScores.length).toFixed(1);
    document.getElementById('stat-avg-grade').textContent = gradeFromScore(+avg) + ' (' + avg + ')';
  }

  // attendance rate
  if (attendance.length) {
    const present = attendance.filter(a=>a.status==='Present'||a.status==='Late').length;
    document.getElementById('stat-attendance').textContent =
      ((present/attendance.length)*100).toFixed(0) + '%';
  }

  // top performer
  let top = null, topAvg = -1;
  students.forEach(s => {
    const a = +studentAvg(s.id);
    if (a > topAvg) { topAvg = a; top = s; }
  });
  if (top) document.getElementById('stat-top').textContent = top.name;

  // recent students
  const tbody = document.getElementById('recent-students-body');
  tbody.innerHTML = '';
  [...students].slice(-5).reverse().forEach(s => {
    const avg = studentAvg(s.id);
    const g = avg ? gradeFromScore(+avg) : '—';
    tbody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td><span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text3)">${s.class}</span></td>
        <td><span class="grade-badge ${gradeClass(g)}">${g}</span></td>
      </tr>`;
  });

  // grade distribution chart
  const buckets = { 'A+':0, A:0, B:0, C:0, D:0, F:0 };
  grades.forEach(g => { const gr = gradeFromScore(g.score); buckets[gr] = (buckets[gr]||0)+1; });
  const maxVal = Math.max(...Object.values(buckets), 1);
  const colors = { 'A+':'var(--accent)','A':'var(--accent)','B':'var(--accent3)','C':'var(--accent2)','D':'var(--accent4)','F':'var(--danger)' };
  const chart = document.getElementById('grade-chart');
  chart.innerHTML = '';
  Object.entries(buckets).forEach(([label, count]) => {
    const pct = (count / maxVal) * 130;
    chart.innerHTML += `
      <div class="bar-group">
        <div class="bar-count">${count}</div>
        <div class="bar-fill" style="height:${pct}px;background:${colors[label]};opacity:0.8"></div>
        <div class="bar-label">${label}</div>
      </div>`;
  });
}

// ---- STUDENTS ----
let _studentsFilter = '';
let _studentsClass  = '';

function renderStudents(filter = _studentsFilter, cls = _studentsClass) {
  _studentsFilter = filter; _studentsClass = cls;

  // populate class filter
  const cf = document.getElementById('class-filter');
  const classes = [...new Set(students.map(s=>s.class))].sort();
  cf.innerHTML = '<option value="">All Classes</option>' +
    classes.map(c=>`<option value="${c}" ${cls===c?'selected':''}>${c}</option>`).join('');

  let list = students.filter(s => {
    const q = filter.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      && (!cls || s.class === cls);
  });

  const tbody = document.getElementById('students-body');
  tbody.innerHTML = '';
  document.getElementById('students-empty').style.display = list.length ? 'none' : 'block';

  list.forEach(s => {
    const avg = studentAvg(s.id);
    const g   = avg ? gradeFromScore(+avg) : '—';
    tbody.innerHTML += `
      <tr>
        <td><span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text3)">${s.id}</span></td>
        <td><strong>${s.name}</strong></td>
        <td><span style="font-family:var(--font-mono);font-size:0.78rem">${s.class}</span></td>
        <td>${s.age||'—'}</td>
        <td style="color:var(--text2);font-size:0.82rem">${s.email||'—'}</td>
        <td>${avg ? `<span class="grade-badge ${gradeClass(g)}">${g} (${avg})</span>` : '—'}</td>
        <td>
          <button class="btn-icon" title="Edit" onclick="editStudent('${s.id}')">✎</button>
          <button class="btn-icon danger" title="Delete" onclick="deleteStudent('${s.id}')">✕</button>
        </td>
      </tr>`;
  });
}

function filterStudents(v) { renderStudents(v, _studentsClass); }
function filterByClass(v)   { renderStudents(_studentsFilter, v); }

// ---- STUDENT MODAL ----
function openModal(id) {
  document.getElementById('modal-title').textContent = id ? 'Edit Student' : 'Add Student';
  document.getElementById('edit-id').value = id || '';
  ['name','class','age','gender','email','phone','address'].forEach(f => {
    const el = document.getElementById('f-' + f);
    if (id) {
      const s = students.find(s => s.id === id);
      el.value = s[f] || '';
    } else {
      el.value = '';
    }
  });
  document.getElementById('student-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('student-modal').classList.remove('open');
}

function editStudent(id) { openModal(id); }

function saveStudent() {
  const name  = document.getElementById('f-name').value.trim();
  const cls   = document.getElementById('f-class').value.trim();
  if (!name || !cls) { toast('⚠ Name and class are required.'); return; }

  const editId = document.getElementById('edit-id').value;
  const data = {
    name,
    class:   cls,
    age:     document.getElementById('f-age').value,
    gender:  document.getElementById('f-gender').value,
    email:   document.getElementById('f-email').value.trim(),
    phone:   document.getElementById('f-phone').value.trim(),
    address: document.getElementById('f-address').value.trim()
  };

  if (editId) {
    const idx = students.findIndex(s => s.id === editId);
    students[idx] = { ...students[idx], ...data };
    toast('✓ Student updated.');
  } else {
    const id = 'S' + String(Date.now()).slice(-5);
    students.push({ id, ...data });
    toast('✓ Student added.');
  }

  save();
  closeModal();
  renderStudents();
  populateStudentDropdowns();
}

function deleteStudent(id) {
  if (!confirm('Delete this student? All grades and attendance will also be removed.')) return;
  students   = students.filter(s => s.id !== id);
  grades     = grades.filter(g => g.studentId !== id);
  attendance = attendance.filter(a => a.studentId !== id);
  save();
  renderStudents();
  renderGrades();
  renderAttendance();
  renderDashboard();
  populateStudentDropdowns();
  toast('✓ Student deleted.');
}

function closeModalOutside(e) {
  if (e.target === e.currentTarget) {
    closeModal();
    closeGradeModal();
    closeAttendanceModal();
  }
}

// ---- GRADES ----
let _gradesFilter = '';

function renderGrades(studentId = _gradesFilter) {
  _gradesFilter = studentId;
  populateStudentDropdowns();

  const sel = document.getElementById('grade-student-filter');
  sel.value = studentId;

  let list = studentId ? grades.filter(g => g.studentId === studentId) : grades;
  list = [...list].sort((a,b) => b.date.localeCompare(a.date));

  const tbody = document.getElementById('grades-body');
  tbody.innerHTML = '';
  document.getElementById('grades-empty').style.display = list.length ? 'none' : 'block';

  list.forEach(g => {
    const gr = gradeFromScore(g.score);
    tbody.innerHTML += `
      <tr>
        <td>${nameById(g.studentId)}</td>
        <td>${g.subject}</td>
        <td><span style="font-family:var(--font-mono)">${g.score}</span></td>
        <td><span class="grade-badge ${gradeClass(gr)}">${gr}</span></td>
        <td><span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text3)">${g.date}</span></td>
        <td>
          <button class="btn-icon danger" onclick="deleteGrade('${g.id}')">✕</button>
        </td>
      </tr>`;
  });
}

function filterGrades(v) { renderGrades(v); }

function openGradeModal() {
  document.getElementById('g-student').value = '';
  document.getElementById('g-subject').value = '';
  document.getElementById('g-score').value = '';
  document.getElementById('g-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('grade-modal').classList.add('open');
}

function closeGradeModal() {
  document.getElementById('grade-modal').classList.remove('open');
}

function saveGrade() {
  const studentId = document.getElementById('g-student').value;
  const subject   = document.getElementById('g-subject').value.trim();
  const score     = +document.getElementById('g-score').value;
  const date      = document.getElementById('g-date').value;

  if (!studentId || !subject || isNaN(score)) { toast('⚠ Fill all required fields.'); return; }
  if (score < 0 || score > 100) { toast('⚠ Score must be 0–100.'); return; }

  grades.push({ id: uid(), studentId, subject, score, date });
  save();
  closeGradeModal();
  renderGrades();
  toast('✓ Grade saved.');
}

function deleteGrade(id) {
  grades = grades.filter(g => g.id !== id);
  save();
  renderGrades();
  toast('✓ Grade removed.');
}

// ---- ATTENDANCE ----
let _attFilter = '';

function renderAttendance(studentId = _attFilter) {
  _attFilter = studentId;
  populateStudentDropdowns();

  const sel = document.getElementById('att-student-filter');
  sel.value = studentId;

  let list = studentId ? attendance.filter(a => a.studentId === studentId) : attendance;
  list = [...list].sort((a,b) => b.date.localeCompare(a.date));

  const tbody = document.getElementById('attendance-body');
  tbody.innerHTML = '';
  document.getElementById('attendance-empty').style.display = list.length ? 'none' : 'block';

  list.forEach(a => {
    tbody.innerHTML += `
      <tr>
        <td>${nameById(a.studentId)}</td>
        <td><span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text3)">${a.date}</span></td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td style="color:var(--text3);font-size:0.82rem">${a.note||'—'}</td>
        <td>
          <button class="btn-icon danger" onclick="deleteAttendance('${a.id}')">✕</button>
        </td>
      </tr>`;
  });
}

function filterAttendance(v) { renderAttendance(v); }

function openAttendanceModal() {
  document.getElementById('a-student').value = '';
  document.getElementById('a-status').value = 'Present';
  document.getElementById('a-note').value = '';
  document.getElementById('a-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('attendance-modal').classList.add('open');
}

function closeAttendanceModal() {
  document.getElementById('attendance-modal').classList.remove('open');
}

function saveAttendance() {
  const studentId = document.getElementById('a-student').value;
  const date      = document.getElementById('a-date').value;
  const status    = document.getElementById('a-status').value;
  const note      = document.getElementById('a-note').value.trim();

  if (!studentId || !date) { toast('⚠ Select student and date.'); return; }

  attendance.push({ id: uid(), studentId, date, status, note });
  save();
  closeAttendanceModal();
  renderAttendance();
  toast('✓ Attendance recorded.');
}

function deleteAttendance(id) {
  attendance = attendance.filter(a => a.id !== id);
  save();
  renderAttendance();
  toast('✓ Record deleted.');
}

// ---- POPULATE DROPDOWNS ----
function populateStudentDropdowns() {
  const opts = '<option value="">— Select student —</option>' +
    students.map(s => `<option value="${s.id}">${s.name} (${s.class})</option>`).join('');

  // grade modal
  document.getElementById('g-student').innerHTML = opts;
  // attendance modal
  document.getElementById('a-student').innerHTML = opts;

  // filter dropdowns
  const filterOpts = '<option value="">All Students</option>' +
    students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  document.getElementById('grade-student-filter').innerHTML = filterOpts;
  document.getElementById('att-student-filter').innerHTML   = filterOpts;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // set date
  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  seedData();
  populateStudentDropdowns();
  renderDashboard();
});
