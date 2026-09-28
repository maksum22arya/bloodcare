// Internationalization: English (default) + Indonesian.
// Dynamic content (categories, recommendations, warnings, pulse/trend labels)
// is looked up by stable ids so the backend never has to know about language.

const STORAGE_KEY = "bloodcare_lang";

const DICT = {
  en: {
    "app.tagline": "Guard Your Heart Health",
    "menu.title": "Menu",
    "menu.dashboard": "Dashboard",
    "menu.create_account": "Create Account",
    "menu.edit_account": "Edit Account",
    "menu.history": "History",
    "menu.theme": "Theme",
    "menu.language": "Language",
    "theme.dark": "Dark",
    "theme.light": "Light",
    "lang.en": "English",
    "lang.id": "Indonesian",

    "dashboard.title": "Check Your Blood Pressure",
    "dashboard.subtitle": "Quick, simple, family-friendly monitoring",
    "dashboard.systolic": "Systolic",
    "dashboard.diastolic": "Diastolic",
    "dashboard.pulse": "Pulse (optional)",
    "dashboard.account": "Account (optional)",
    "dashboard.account_placeholder": "No account — result won't be saved",
    "dashboard.check_now": "Check Now",
    "dashboard.systolic_placeholder": "e.g. 120",
    "dashboard.diastolic_placeholder": "e.g. 80",
    "dashboard.pulse_placeholder": "e.g. 72",

    "error.required_bp": "Please enter both systolic and diastolic values.",
    "error.generic": "Something went wrong. Please try again.",
    "error.network": "Couldn't reach the server. Check your connection.",

    "result.title": "Result",
    "result.back": "Back to Dashboard",
    "result.unit": "mmHg",
    "result.pulse_heading": "Pulse Analysis",
    "result.pulse_value": "Pulse",
    "result.pulse_status": "Status",
    "result.pulse_bpm": "bpm",
    "result.no_pulse": "No pulse entered",
    "result.recommendations_heading": "Recommendations",
    "result.warnings_heading": "Possible Health Risks",
    "result.no_warnings": "No specific risks flagged for this reading.",
    "result.disclaimer": "This is educational information only and not a substitute for professional medical advice. Please consult a healthcare provider for diagnosis or treatment.",
    "result.saved_yes": "Saved to {name}'s history",
    "result.saved_no": "Not saved — select an account to keep a history",

    "category.normal": "Normal",
    "category.elevated": "Elevated",
    "category.stage1": "Hypertension Stage 1",
    "category.stage2": "Hypertension Stage 2",
    "category.crisis": "Hypertensive Crisis",

    "pulse.low": "Low",
    "pulse.normal": "Normal",
    "pulse.high": "High",

    "rec_maintain_diet": "Maintain a balanced, low-sodium diet",
    "rec_regular_exercise": "Get at least 30 minutes of exercise most days",
    "rec_routine_checkup": "Keep up with routine health checkups",
    "rec_reduce_salt": "Reduce salt intake in daily meals",
    "rec_monitor_home": "Monitor your blood pressure regularly at home",
    "rec_weight_management": "Work towards a healthy body weight",
    "rec_limit_alcohol": "Limit alcohol consumption",
    "rec_dash_diet": "Follow a DASH-style diet rich in fruits and vegetables",
    "rec_reduce_stress": "Practice stress-reduction techniques like deep breathing",
    "rec_consult_doctor_soon": "Schedule a visit with your doctor soon",
    "rec_emergency_room": "Seek emergency medical care immediately",
    "rec_avoid_exertion": "Avoid physical exertion until evaluated",
    "rec_track_symptoms": "Track symptoms such as chest pain, shortness of breath, or vision changes",
    "rec_medication_adherence": "Take prescribed medication exactly as directed",
    "rec_limit_caffeine": "Avoid caffeine and stimulants until evaluated",

    "warn_progress_risk": "May progress to high blood pressure over time",
    "warn_heart_disease": "Heart Disease",
    "warn_stroke": "Stroke",
    "warn_kidney_disease": "Kidney Disease",
    "warn_emergency": "This reading requires immediate emergency attention",

    "history.title": "History",
    "history.select_account": "Select an account",
    "history.select_account_placeholder": "Choose an account",
    "history.trend_heading": "Trend Analysis",
    "trend.improving": "Improving",
    "trend.stable": "Stable",
    "trend.worsening": "Worsening",
    "history.trend_insufficient": "Not enough data yet",
    "history.systolic_chart": "Systolic Trend",
    "history.diastolic_chart": "Diastolic Trend",
    "history.cards_heading": "Recent Readings",
    "history.empty": "No history yet",
    "history.empty_sub": "Select an account and check your blood pressure to start tracking",
    "history.no_account_selected": "Choose an account above to see their history",
    "history.no_pulse_short": "—",

    "account.create_title": "Create Account",
    "account.manage_title": "Manage Accounts",
    "account.name_label": "Name",
    "account.name_placeholder": "e.g. Grandma Sari",
    "account.birthdate_label": "Birth Date",
    "account.create_btn": "Create Account",
    "account.save_btn": "Save Changes",
    "account.cancel_btn": "Cancel",
    "account.delete_title": "Delete Account",
    "account.delete_confirm": "Delete this account and all of its history? This cannot be undone.",
    "account.delete_password_label": "Password",
    "account.delete_password_placeholder": "Enter delete password",
    "account.invalid_delete_password": "Invalid delete password",
    "account.delete_btn": "Delete",
    "account.edit_btn": "Edit",
    "account.empty": "No accounts yet. Create one to start tracking history.",
    "account.close_btn": "Close",
    "account.years_suffix": "yrs",
    "account.duplicate_error": "An account with this name already exists.",
    "account.invalid_error": "Please check the name and birth date.",

    "footer.tagline": "🩺 Small daily checks, healthier tomorrows.",
    "common.close": "Close",
    "common.loading": "Loading...",
  },

  id: {
    "app.tagline": "Jaga Kesehatan Jantung Anda",
    "menu.title": "Menu",
    "menu.dashboard": "Dasbor",
    "menu.create_account": "Buat Akun",
    "menu.edit_account": "Edit Akun",
    "menu.history": "Riwayat",
    "menu.theme": "Tema",
    "menu.language": "Bahasa",
    "theme.dark": "Gelap",
    "theme.light": "Terang",
    "lang.en": "Inggris",
    "lang.id": "Indonesia",

    "dashboard.title": "Cek Tekanan Darah Anda",
    "dashboard.subtitle": "Pemantauan cepat, mudah, untuk seluruh keluarga",
    "dashboard.systolic": "Sistolik",
    "dashboard.diastolic": "Diastolik",
    "dashboard.pulse": "Detak Nadi (opsional)",
    "dashboard.account": "Akun (opsional)",
    "dashboard.account_placeholder": "Tanpa akun — hasil tidak akan disimpan",
    "dashboard.check_now": "Cek Sekarang",
    "dashboard.systolic_placeholder": "cth. 120",
    "dashboard.diastolic_placeholder": "cth. 80",
    "dashboard.pulse_placeholder": "cth. 72",

    "error.required_bp": "Mohon isi nilai sistolik dan diastolik.",
    "error.generic": "Terjadi kesalahan. Silakan coba lagi.",
    "error.network": "Tidak dapat terhubung ke server. Periksa koneksi Anda.",

    "result.title": "Hasil",
    "result.back": "Kembali ke Dasbor",
    "result.unit": "mmHg",
    "result.pulse_heading": "Analisis Detak Nadi",
    "result.pulse_value": "Detak Nadi",
    "result.pulse_status": "Status",
    "result.pulse_bpm": "bpm",
    "result.no_pulse": "Detak nadi tidak diisi",
    "result.recommendations_heading": "Rekomendasi",
    "result.warnings_heading": "Potensi Risiko Kesehatan",
    "result.no_warnings": "Tidak ada risiko khusus untuk hasil ini.",
    "result.disclaimer": "Informasi ini hanya bersifat edukasi dan bukan pengganti saran medis profesional. Silakan konsultasikan dengan tenaga kesehatan untuk diagnosis atau pengobatan.",
    "result.saved_yes": "Disimpan ke riwayat {name}",
    "result.saved_no": "Tidak disimpan — pilih akun untuk menyimpan riwayat",

    "category.normal": "Normal",
    "category.elevated": "Meningkat",
    "category.stage1": "Hipertensi Tahap 1",
    "category.stage2": "Hipertensi Tahap 2",
    "category.crisis": "Krisis Hipertensi",

    "pulse.low": "Rendah",
    "pulse.normal": "Normal",
    "pulse.high": "Tinggi",

    "rec_maintain_diet": "Jaga pola makan seimbang dan rendah garam",
    "rec_regular_exercise": "Berolahraga minimal 30 menit hampir setiap hari",
    "rec_routine_checkup": "Lakukan pemeriksaan kesehatan rutin",
    "rec_reduce_salt": "Kurangi konsumsi garam pada makanan sehari-hari",
    "rec_monitor_home": "Pantau tekanan darah secara rutin di rumah",
    "rec_weight_management": "Usahakan mencapai berat badan yang sehat",
    "rec_limit_alcohol": "Batasi konsumsi alkohol",
    "rec_dash_diet": "Terapkan pola makan DASH yang kaya buah dan sayur",
    "rec_reduce_stress": "Lakukan teknik pengurang stres seperti latihan napas dalam",
    "rec_consult_doctor_soon": "Segera buat jadwal konsultasi dengan dokter",
    "rec_emergency_room": "Segera cari pertolongan medis darurat",
    "rec_avoid_exertion": "Hindari aktivitas fisik berat sampai diperiksa dokter",
    "rec_track_symptoms": "Catat gejala seperti nyeri dada, sesak napas, atau gangguan penglihatan",
    "rec_medication_adherence": "Minum obat sesuai resep dokter",
    "rec_limit_caffeine": "Hindari kafein dan stimulan sampai diperiksa dokter",

    "warn_progress_risk": "Berpotensi berkembang menjadi tekanan darah tinggi",
    "warn_heart_disease": "Penyakit Jantung",
    "warn_stroke": "Stroke",
    "warn_kidney_disease": "Penyakit Ginjal",
    "warn_emergency": "Hasil ini memerlukan penanganan darurat segera",

    "history.title": "Riwayat",
    "history.select_account": "Pilih akun",
    "history.select_account_placeholder": "Pilih sebuah akun",
    "history.trend_heading": "Analisis Tren",
    "trend.improving": "Membaik",
    "trend.stable": "Stabil",
    "trend.worsening": "Memburuk",
    "history.trend_insufficient": "Data belum cukup",
    "history.systolic_chart": "Tren Sistolik",
    "history.diastolic_chart": "Tren Diastolik",
    "history.cards_heading": "Pengukuran Terbaru",
    "history.empty": "Belum ada riwayat",
    "history.empty_sub": "Pilih akun dan cek tekanan darah untuk mulai memantau",
    "history.no_account_selected": "Pilih akun di atas untuk melihat riwayatnya",
    "history.no_pulse_short": "—",

    "account.create_title": "Buat Akun",
    "account.manage_title": "Kelola Akun",
    "account.name_label": "Nama",
    "account.name_placeholder": "cth. Nenek Sari",
    "account.birthdate_label": "Tanggal Lahir",
    "account.create_btn": "Buat Akun",
    "account.save_btn": "Simpan Perubahan",
    "account.cancel_btn": "Batal",
    "account.delete_title": "Hapus Akun",
    "account.delete_confirm": "Hapus akun ini beserta seluruh riwayatnya? Tindakan ini tidak dapat dibatalkan.",
    "account.delete_password_label": "Password",
    "account.delete_password_placeholder": "Masukkan password hapus akun",
    "account.invalid_delete_password": "Password hapus akun salah",
    "account.delete_btn": "Hapus",
    "account.edit_btn": "Edit",
    "account.empty": "Belum ada akun. Buat satu untuk mulai memantau riwayat.",
    "account.close_btn": "Tutup",
    "account.years_suffix": "th",
    "account.duplicate_error": "Akun dengan nama ini sudah ada.",
    "account.invalid_error": "Mohon periksa nama dan tanggal lahir.",

    "footer.tagline": "🩺 Cek kecil setiap hari, masa depan yang lebih sehat.",
    "common.close": "Tutup",
    "common.loading": "Memuat...",
  },
};

export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || "en";
}

export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

export function t(key, vars) {
  const lang = getLang();
  let str = (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return str;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
  });
}
