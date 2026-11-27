/* DDG Studio — Digital Wedding Invitation Logic (script.js) */
const INVITATION_CONFIG = {
  countdownDate: "2026-12-27T09:00",
  musicEnabled: true,
  customMusicUrl: "assets/backsound.mp3"
};
window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to');
  if (guest) {
    const el = document.getElementById('pv_guestName');
    if (el) el.textContent = guest;
  }
  initScrollReveal();
  startCountdown();
});
function initScrollReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  if (!('IntersectionObserver' in window)) { sections.forEach((sec) => sec.classList.add('is-visible')); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
  }, { threshold: 0.08 });
  sections.forEach((sec) => observer.observe(sec));
}
function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target && target.style.display !== 'none') target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function openInvitation() {
  const cover = document.getElementById('invCoverOverlay');
  if (cover) { cover.classList.add('cover-opening'); setTimeout(() => { cover.style.display = 'none'; }, 800); }
  if (INVITATION_CONFIG.musicEnabled && !isMusicPlaying) toggleAudioMusic(true);
}
function startCountdown() {
  const tick = () => {
    const target = new Date(INVITATION_CONFIG.countdownDate).getTime();
    if (isNaN(target)) return;
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    if (document.getElementById('cd_days')) {
      document.getElementById('cd_days').textContent = String(d).padStart(2, '0');
      document.getElementById('cd_hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd_minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('cd_seconds').textContent = String(s).padStart(2, '0');
    }
  };
  tick(); setInterval(tick, 1000);
}
function openGalleryLightbox(src) {
  const lb = document.getElementById('galleryLightbox');
  const img = document.getElementById('galleryLightboxImg');
  if (!lb || !img) return;
  img.src = src; lb.classList.remove('hidden'); lb.classList.add('flex');
}
function closeGalleryLightbox() {
  const lb = document.getElementById('galleryLightbox');
  if (!lb) return;
  lb.classList.add('hidden'); lb.classList.remove('flex');
}
function copyTextById(id) {
  const text = document.getElementById(id).textContent.trim();
  const tmp = document.createElement('textarea'); tmp.value = text; document.body.appendChild(tmp);
  tmp.select(); document.execCommand('copy'); document.body.removeChild(tmp);
  const toast = document.createElement('div');
  toast.className = 'fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg';
  toast.textContent = 'Nomor rekening ' + text + ' disalin!';
  document.body.appendChild(toast); setTimeout(() => toast.remove(), 2200);
}
function submitGuestWish(e) {
  e.preventDefault();
  const name = document.getElementById('wishName').value.trim();
  const status = document.getElementById('wishStatus').value;
  const msg = document.getElementById('wishMessage').value.trim();
  if (!name || !msg) return;
  const badge = status === 'Hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
  const div = document.createElement('div');
  div.className = 'p-4 rounded-2xl inv-card border inv-border space-y-1.5 animate-hero-in';
  div.innerHTML = '<div class="flex items-center justify-between"><span class="text-sm font-bold">' + name.replace(/</g,'&lt;') + '</span><span class="text-xs px-2.5 py-0.5 rounded-full ' + badge + ' font-semibold">' + status + '</span></div><p class="text-sm inv-muted leading-relaxed">' + msg.replace(/</g,'&lt;') + '</p>';
  document.getElementById('wishListContainer').prepend(div);
  document.getElementById('wishName').value = ''; document.getElementById('wishMessage').value = '';
}
let isMusicPlaying = false, isMusicMuted = false, musicLoop = null, synth = null;
function toggleMuteMusic() {
  isMusicMuted = !isMusicMuted;
  const audioEl = document.getElementById('bgAudioPlayer');
  if (audioEl) audioEl.muted = isMusicMuted;
  if (window.Tone && Tone.Destination) Tone.Destination.mute = isMusicMuted;
  const muteBtn = document.getElementById('floatingMuteBtn');
  if (muteBtn) {
    muteBtn.innerHTML = isMusicMuted ? '<i data-lucide="volume-x" class="w-4 h-4 text-rose-600"></i>' : '<i data-lucide="volume-2" class="w-4 h-4"></i>';
    if (window.lucide) lucide.createIcons();
  }
}
async function toggleAudioMusic(forcePlay = false) {
  const icon = document.getElementById('musicDiscIcon');
  const audioEl = document.getElementById('bgAudioPlayer');
  if (isMusicPlaying && !forcePlay) {
    if (audioEl) audioEl.pause();
    if (musicLoop) musicLoop.stop();
    if (window.Tone) Tone.Transport.stop();
    isMusicPlaying = false; if (icon) icon.classList.add('paused-spin');
    return;
  }
  if (INVITATION_CONFIG.customMusicUrl && audioEl) {
    try {
      if (!audioEl.src) audioEl.src = INVITATION_CONFIG.customMusicUrl;
      audioEl.muted = isMusicMuted;
      await audioEl.play(); isMusicPlaying = true; if (icon) icon.classList.remove('paused-spin');
      return;
    } catch (err) {}
  }
  try {
    if (!window.Tone) return;
    await Tone.start();
    if (Tone.context.state !== 'running') await Tone.context.resume();
    Tone.Destination.mute = isMusicMuted;
    if (!synth) {
      synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.08, decay: 0.6, sustain: 0.35, release: 1.6 } }).toDestination();
      synth.volume.value = -6;
      const notes = [['C4','E4','G4'],'E5','D5','C5',['G3','B3','D4'],'D5','C5','B4',['A3','C4','E4'],'C5','B4','A4',['F3','A3','C4'],'A4','G4','F4',['G3','B3','D4'],'G4','B4','D5'];
      let i = 0; musicLoop = new Tone.Loop((t) => { synth.triggerAttackRelease(notes[i++ % notes.length], '4n', t); }, '4n');
    }
    musicLoop.start(0); Tone.Transport.bpm.value = 76; Tone.Transport.start();
    isMusicPlaying = true; if (icon) icon.classList.remove('paused-spin');
  } catch (e) {}
}