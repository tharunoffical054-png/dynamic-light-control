import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Mail, Eye, EyeOff, Globe, BookOpen, Github,
  X, User, Briefcase, Home, CheckCircle, AlertCircle,
  LayoutDashboard, FilePlus, FolderOpen, Download, Trash2, LogOut,
  Search, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Table, Paperclip, Star, RotateCcw, Edit3, Menu,
  Minus, FileText, Plus, Pin, Bell, Tag, Palette, Hash,
  Type, ChevronDown, Link, Image, Code,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'planned' | 'watching' | 'purchased' | 'cancelled';
  files: { name: string; size: number; type: string; dataUrl: string }[];
  deleted: boolean;
  deletedAt?: string;
  highPriority: boolean;
  archived: boolean;
  pinned?: boolean;
  tags?: string[];
  noteColor?: string;
  reminder?: string;
}

interface CurrentUser {
  name: string;
  email: string;
  photo: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PERSONAL_DOMAINS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com',
  'icloud.com','live.com','msn.com','ymail.com','protonmail.com',
  'mail.com','zoho.com','gmx.com','fastmail.com','me.com',
  'mac.com','googlemail.com','yahoo.co.uk','yahoo.fr','yahoo.es',
  'rediffmail.com','inbox.com','rocketmail.com',
]);

function detectEmailType(email: string): 'professional' | 'personal' | null {
  const atIdx = email.indexOf('@');
  if (atIdx < 1) return null;
  const domain = email.slice(atIdx + 1).toLowerCase();
  if (!domain.includes('.')) return null;
  return PERSONAL_DOMAINS.has(domain) ? 'personal' : 'professional';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isValidPassword(pw: string): boolean {
  return pw.length >= 8;
}

function isValidGitHubUsername(u: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(u.trim()) || isValidEmail(u);
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────
function ModalShell({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          >
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="relative w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <VisuallyHidden.Root><Dialog.Title>NoteVault dialog</Dialog.Title></VisuallyHidden.Root>
                {children}
              </motion.div>
            </Dialog.Content>
          </motion.div>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Google Modal ─────────────────────────────────────────────────────────────
function GoogleModal({ open, onClose, lang, onLogin, onOpenSignUp }: {
  open: boolean; onClose: () => void; lang: string;
  onLogin: (user: CurrentUser) => void;
  onOpenSignUp: () => void;
}) {
  const [gEmail, setGEmail] = useState('');
  const [gPass, setGPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});

  const emailType = detectEmailType(gEmail);
  const handleClose = () => { setGEmail(''); setGPass(''); setErrors({}); onClose(); };

  const validate = () => {
    const e: { email?: string; pass?: string } = {};
    if (!isValidEmail(gEmail)) e.email = lang === 'EN' ? 'Enter a valid email address' : 'Ingresa un correo válido';
    if (!isValidPassword(gPass)) e.pass = lang === 'EN' ? 'Password must be at least 8 characters' : 'Mínimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleClose();
      onLogin({ name: gEmail.split('@')[0] || 'Google User', email: gEmail, photo: null });
    }, 1500);
  };

  const handleCreateAccount = () => { handleClose(); onOpenSignUp(); };

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #dadce0' }}>
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f1f3f4' }}>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: '#202124' }}>Google</p>
                <p className="text-xs" style={{ color: '#5f6368' }}>{lang === 'EN' ? 'Sign in to continue' : 'Inicia sesión para continuar'}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" style={{ color: '#5f6368' }}><X className="w-5 h-5" /></button>
          </div>

          <h2 className="text-xl font-semibold mb-5" style={{ color: '#202124' }}>{lang === 'EN' ? 'Sign in with Google' : 'Inicia sesión con Google'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: '#202124' }}>{lang === 'EN' ? 'Email address' : 'Correo electrónico'}</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4.5 h-4.5" style={{ color: '#5f6368', width: 18, height: 18 }} />
                <input type="email" value={gEmail} onChange={e => setGEmail(e.target.value)}
                  className="w-full rounded-xl py-3 text-sm focus:outline-none transition-all"
                  style={{ paddingLeft: 42, paddingRight: 14, background: '#ffffff', border: errors.email ? '2px solid #ea4335' : '1.5px solid #dadce0', color: '#202124' }}
                  onFocus={e => { e.currentTarget.style.border = '2px solid #1a73e8'; }}
                  onBlur={e => { e.currentTarget.style.border = errors.email ? '2px solid #ea4335' : '1.5px solid #dadce0'; }}
                  placeholder={lang === 'EN' ? 'your@email.com' : 'tu@correo.com'} autoFocus />
              </div>
              {errors.email && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#ea4335' }}><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
              {!errors.email && emailType && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{ background: emailType === 'professional' ? 'rgba(26,115,232,0.07)' : 'rgba(251,188,5,0.09)', border: `1px solid ${emailType === 'professional' ? 'rgba(26,115,232,0.2)' : 'rgba(251,188,5,0.3)'}` }}>
                  {emailType === 'professional' ? <Briefcase className="w-3.5 h-3.5" style={{ color: '#1a73e8' }} /> : <Home className="w-3.5 h-3.5" style={{ color: '#f9ab00' }} />}
                  <span className="text-xs font-medium" style={{ color: emailType === 'professional' ? '#1a73e8' : '#f9ab00' }}>
                    {emailType === 'professional' ? (lang === 'EN' ? 'Professional email' : 'Correo profesional') : (lang === 'EN' ? 'Personal email' : 'Correo personal')}
                  </span>
                </motion.div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#202124' }}>{lang === 'EN' ? 'Password' : 'Contraseña'}</label>
                <a href="#" className="text-xs font-medium" style={{ color: '#1a73e8' }}>{lang === 'EN' ? 'Forgot?' : '¿Olvidaste?'}</a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5" style={{ color: '#5f6368', width: 18, height: 18 }} />
                <input type={showPw ? 'text' : 'password'} value={gPass} onChange={e => setGPass(e.target.value)}
                  className="w-full rounded-xl py-3 text-sm focus:outline-none transition-all"
                  style={{ paddingLeft: 42, paddingRight: 44, background: '#ffffff', border: errors.pass ? '2px solid #ea4335' : '1.5px solid #dadce0', color: '#202124' }}
                  onFocus={e => { e.currentTarget.style.border = '2px solid #1a73e8'; }}
                  onBlur={e => { e.currentTarget.style.border = errors.pass ? '2px solid #ea4335' : '1.5px solid #dadce0'; }}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 transition-colors" style={{ color: '#5f6368' }}>
                  {showPw ? <EyeOff className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.pass && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#ea4335' }}><AlertCircle className="w-3.5 h-3.5" />{errors.pass}</p>}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg,#1a73e8,#1557b0)', boxShadow: '0 2px 8px rgba(26,115,232,0.35)' }}>
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : null}
              {lang === 'EN' ? 'Sign in with Google' : 'Ingresar con Google'}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-sm" style={{ color: '#5f6368' }}>
            {lang === 'EN' ? "No Google account? " : '¿Sin cuenta? '}
            <button type="button" onClick={handleCreateAccount} className="font-semibold" style={{ color: '#1a73e8' }}>
              {lang === 'EN' ? 'Create account' : 'Crear cuenta'}
            </button>
          </p>
          <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: '#e8eaed' }}>
            <p className="text-xs" style={{ color: '#80868b' }}>{lang === 'EN' ? 'Protected by Google reCAPTCHA · Privacy · Terms' : 'Protegido por reCAPTCHA · Privacidad · Términos'}</p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── GitHub Modal ─────────────────────────────────────────────────────────────
function GitHubModal({ open, onClose, lang, onLogin, onOpenSignUp }: {
  open: boolean; onClose: () => void; lang: string;
  onLogin: (user: CurrentUser) => void;
  onOpenSignUp: () => void;
}) {
  const [ghUser, setGhUser] = useState('');
  const [ghPass, setGhPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ user?: string; pass?: string }>({});

  const handleClose = () => { setGhUser(''); setGhPass(''); setErrors({}); onClose(); };

  const validate = () => {
    const e: { user?: string; pass?: string } = {};
    if (!isValidGitHubUsername(ghUser)) e.user = lang === 'EN' ? 'Enter a valid GitHub username or email' : 'Usuario o correo de GitHub inválido';
    if (!isValidPassword(ghPass)) e.pass = lang === 'EN' ? 'Password must be at least 8 characters' : 'Mínimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleClose();
      const displayName = ghUser.includes('@') ? ghUser.split('@')[0] : ghUser;
      onLogin({ name: displayName || 'GitHub User', email: ghUser.includes('@') ? ghUser : `${ghUser}@github.com`, photo: null });
    }, 1500);
  };

  const inputStyle = (hasError?: boolean) => ({
    paddingLeft: 42, paddingRight: 44,
    background: '#0d1117',
    border: hasError ? '1.5px solid #f85149' : '1.5px solid #30363d',
    color: '#e6edf3',
    borderRadius: 12,
  });

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#21262d' }}>
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">GitHub</p>
                <p className="text-xs" style={{ color: '#8b949e' }}>{lang === 'EN' ? 'Sign in to continue' : 'Inicia sesión para continuar'}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full transition-colors hover:bg-white/10" style={{ color: '#8b949e' }}><X className="w-5 h-5" /></button>
          </div>

          <h2 className="text-xl font-semibold text-white mb-5">{lang === 'EN' ? 'Sign in to GitHub' : 'Inicia sesión en GitHub'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: '#e6edf3' }}>{lang === 'EN' ? 'Username or email' : 'Usuario o correo'}</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5" style={{ color: '#8b949e', width: 18, height: 18 }} />
                <input type="text" value={ghUser} onChange={e => setGhUser(e.target.value)}
                  className="w-full py-3 text-sm placeholder-gray-600 focus:outline-none transition-all"
                  style={inputStyle(!!errors.user)}
                  onFocus={e => (e.currentTarget.style.borderColor = '#388bfd')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.user ? '#f85149' : '#30363d')}
                  placeholder={lang === 'EN' ? 'username or email@example.com' : 'usuario o correo'} autoFocus required />
              </div>
              {errors.user && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#f85149' }}><AlertCircle className="w-3.5 h-3.5" />{errors.user}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#e6edf3' }}>{lang === 'EN' ? 'Password' : 'Contraseña'}</label>
                <a href="#" className="text-xs" style={{ color: '#388bfd' }}>{lang === 'EN' ? 'Forgot password?' : '¿Olvidaste?'}</a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5" style={{ color: '#8b949e', width: 18, height: 18 }} />
                <input type={showPw ? 'text' : 'password'} value={ghPass} onChange={e => setGhPass(e.target.value)}
                  className="w-full py-3 text-sm placeholder-gray-600 focus:outline-none transition-all"
                  style={inputStyle(!!errors.pass)}
                  onFocus={e => (e.currentTarget.style.borderColor = '#388bfd')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.pass ? '#f85149' : '#30363d')}
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 transition-colors" style={{ color: '#8b949e' }}>
                  {showPw ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.pass && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#f85149' }}><AlertCircle className="w-3.5 h-3.5" />{errors.pass}</p>}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(180deg,#238636,#1a7f37)', border: '1px solid rgba(240,246,252,0.1)' }}>
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Github className="w-4 h-4" />}
              {lang === 'EN' ? 'Sign in with GitHub' : 'Ingresar con GitHub'}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-sm" style={{ color: '#8b949e' }}>
            {lang === 'EN' ? 'New to GitHub? ' : '¿Nuevo en GitHub? '}
            <button type="button" onClick={() => { handleClose(); onOpenSignUp(); }} className="font-semibold" style={{ color: '#388bfd' }}>
              {lang === 'EN' ? 'Create an account' : 'Crear cuenta'}
            </button>
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Sign Up Modal ─────────────────────────────────────────────────────────────
function SignUpModal({ open, onClose, lang, lampOn, onLogin }: {
  open: boolean; onClose: () => void; lang: string; lampOn: boolean;
  onLogin: (user: CurrentUser) => void;
}) {
  const [name, setName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);

  const emailType = detectEmailType(suEmail);
  const passwordsMatch = suPass.length > 0 && suPass === suConfirm;
  const pwStrength = suPass.length >= 12 ? 4 : suPass.length >= 10 ? 3 : suPass.length >= 8 ? 2 : suPass.length > 0 ? 1 : 0;

  const handleClose = () => { setName(''); setSuEmail(''); setSuPass(''); setSuConfirm(''); setErrors({}); setDone(false); setPhotoDataUrl(null); onClose(); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e['name'] = lang === 'EN' ? 'Full name is required' : 'Nombre requerido';
    if (!isValidEmail(suEmail)) e['email'] = lang === 'EN' ? 'Enter a valid email address' : 'Correo inválido';
    if (!isValidPassword(suPass)) e['pass'] = lang === 'EN' ? 'Password must be at least 8 characters' : 'Mínimo 8 caracteres';
    if (suPass !== suConfirm) e['confirm'] = lang === 'EN' ? "Passwords don't match" : 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); setTimeout(() => { handleClose(); onLogin({ name, email: suEmail, photo: photoDataUrl }); }, 1200); }, 1800);
  };

  const light = lampOn;
  const inputBg = light ? '#ffffff' : 'rgba(0,0,0,0.45)';
  const inputBorder = light ? '#d1d5db' : 'rgba(120,53,15,0.4)';
  const inputColor = light ? '#111' : '#f3f4f6';
  const labelColor = light ? '#374151' : '#d1d5db';

  const strColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
  const strLabels = ['', lang === 'EN' ? 'Weak' : 'Débil', lang === 'EN' ? 'Fair' : 'Regular', lang === 'EN' ? 'Good' : 'Bueno', lang === 'EN' ? 'Strong' : 'Fuerte'];

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div className="rounded-3xl shadow-2xl overflow-hidden border-2"
        style={{ background: light ? 'linear-gradient(135deg,#ffffff,#fffbeb)' : 'linear-gradient(135deg,rgba(5,5,10,0.97),rgba(40,0,0,0.9))', borderColor: light ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.35)' }}>
        <div className="relative px-7 py-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: light ? '#111' : '#fff' }}>NoteVault</p>
                <p className="text-xs text-yellow-600">{lang === 'EN' ? 'Create your account' : 'Crea tu cuenta'}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full transition-colors hover:bg-black/10" style={{ color: light ? '#9ca3af' : '#6b7280' }}><X className="w-5 h-5" /></button>
          </div>

          <div className="flex justify-center mb-4">
            <button type="button" onClick={() => photoInputRef.current?.click()}
              className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-500 transition-all group"
              style={{ width: 72, height: 72, background: light ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.08)' }}>
              {photoDataUrl ? <img src={photoDataUrl} alt="profile" className="w-full h-full object-cover" /> : (
                <div className="flex flex-col items-center justify-center h-full gap-1">
                  <User className="w-7 h-7 text-yellow-500" />
                  <span className="text-xs text-yellow-600">{lang === 'EN' ? 'Photo' : 'Foto'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/40">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: light ? '#111' : '#fff' }}>{lang === 'EN' ? 'Account created!' : '¡Cuenta creada!'}</h3>
              <p className="text-sm" style={{ color: light ? '#6b7280' : '#9ca3af' }}>{lang === 'EN' ? `Welcome to NoteVault, ${name}!` : `¡Bienvenido a NoteVault, ${name}!`}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: labelColor }}>{lang === 'EN' ? 'Full Name' : 'Nombre completo'}</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5" style={{ color: '#ca8a04', width: 18, height: 18 }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full border rounded-xl py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    style={{ paddingLeft: 42, paddingRight: 14, background: inputBg, borderColor: errors['name'] ? '#ef4444' : inputBorder, color: inputColor }}
                    placeholder={lang === 'EN' ? 'Your full name' : 'Tu nombre completo'} autoFocus />
                </div>
                {errors['name'] && <p className="text-xs mt-0.5 text-red-500">{errors['name']}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: labelColor }}>{lang === 'EN' ? 'Email Address' : 'Correo Electrónico'}</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5" style={{ color: '#ca8a04', width: 18, height: 18 }} />
                  <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)}
                    className="w-full border rounded-xl py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    style={{ paddingLeft: 42, paddingRight: 14, background: inputBg, borderColor: errors['email'] ? '#ef4444' : inputBorder, color: inputColor }}
                    placeholder={lang === 'EN' ? 'your@email.com' : 'tu@email.com'} />
                </div>
                {errors['email'] && <p className="text-xs mt-0.5 text-red-500">{errors['email']}</p>}
                {!errors['email'] && emailType && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mt-1 px-2.5 py-1.5 rounded-lg"
                    style={{ background: emailType === 'professional' ? 'rgba(59,130,246,0.08)' : 'rgba(234,179,8,0.08)', border: `1px solid ${emailType === 'professional' ? 'rgba(59,130,246,0.2)' : 'rgba(234,179,8,0.25)'}` }}>
                    {emailType === 'professional' ? <Briefcase className="w-3.5 h-3.5 text-blue-500" /> : <Home className="w-3.5 h-3.5 text-yellow-500" />}
                    <span className="text-xs font-medium" style={{ color: emailType === 'professional' ? '#3b82f6' : '#ca8a04' }}>
                      {emailType === 'professional' ? (lang === 'EN' ? 'Professional email' : 'Correo profesional') : (lang === 'EN' ? 'Personal email' : 'Correo personal')}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: labelColor }}>{lang === 'EN' ? 'Password' : 'Contraseña'}</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5" style={{ color: '#ca8a04', width: 18, height: 18 }} />
                  <input type={showPw ? 'text' : 'password'} value={suPass} onChange={e => setSuPass(e.target.value)}
                    className="w-full border rounded-xl py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    style={{ paddingLeft: 42, paddingRight: 44, background: inputBg, borderColor: errors['pass'] ? '#ef4444' : inputBorder, color: inputColor }}
                    placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5" style={{ color: light ? '#6b7280' : '#9ca3af' }}>
                    {showPw ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                {errors['pass'] && <p className="text-xs mt-0.5 text-red-500">{errors['pass']}</p>}
                {suPass.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1,2,3,4].map(i => <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: i <= pwStrength ? strColors[pwStrength] : light ? '#e5e7eb' : '#374151' }} />)}
                    <span className="text-xs ml-1" style={{ color: strColors[pwStrength] }}>{strLabels[pwStrength]}</span>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-sm mb-1 font-medium" style={{ color: labelColor }}>{lang === 'EN' ? 'Confirm Password' : 'Confirmar Contraseña'}</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5" style={{ color: '#ca8a04', width: 18, height: 18 }} />
                  <input type={showCf ? 'text' : 'password'} value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                    className="w-full border rounded-xl py-3 text-sm placeholder-gray-400 focus:outline-none transition-all"
                    style={{ paddingLeft: 42, paddingRight: 44, background: inputBg, borderColor: suConfirm ? (passwordsMatch ? '#22c55e' : '#ef4444') : errors['confirm'] ? '#ef4444' : inputBorder, color: inputColor }}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowCf(p => !p)} className="absolute right-3.5" style={{ color: light ? '#6b7280' : '#9ca3af' }}>
                    {showCf ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                {suConfirm && (
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: passwordsMatch ? '#22c55e' : '#ef4444' }}>
                    {passwordsMatch ? <><CheckCircle className="w-3.5 h-3.5" />{lang === 'EN' ? 'Passwords match' : 'Las contraseñas coinciden'}</> : <><AlertCircle className="w-3.5 h-3.5" />{lang === 'EN' ? "Passwords don't match" : 'No coinciden'}</>}
                  </p>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="relative w-full overflow-hidden rounded-xl py-3.5 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-semibold disabled:opacity-50 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 mt-1">
                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative z-10 flex items-center gap-2">
                  {loading && <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
                  {lang === 'EN' ? 'Create Account' : 'Crear Cuenta'}
                </span>
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Shared Content Modal ─────────────────────────────────────────────────────
function ContentModal({ open, onClose, title, icon, children, lampOn }: {
  open: boolean; onClose: () => void; title: string; icon: React.ReactNode; children: React.ReactNode; lampOn: boolean;
}) {
  const light = lampOn;
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="rounded-3xl shadow-2xl border-2 overflow-hidden flex flex-col max-h-[85vh]"
        style={{ background: light ? 'linear-gradient(135deg,#ffffff,#fffbeb)' : 'linear-gradient(135deg,rgba(5,5,10,0.98),rgba(30,0,0,0.92))', borderColor: light ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.35)' }}>
        <div className="flex items-center justify-between px-7 py-5 border-b shrink-0" style={{ borderColor: light ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-xl flex items-center justify-center shadow-md">{icon}</div>
            <h2 className="text-lg font-semibold" style={{ color: light ? '#111' : '#f9fafb' }}>{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors" style={{ color: light ? '#9ca3af' : '#6b7280' }}><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto px-7 py-6 space-y-6 flex-1 text-sm leading-relaxed" style={{ color: light ? '#374151' : '#d1d5db' }}>
          {children}
        </div>
      </div>
    </ModalShell>
  );
}

function Section({ title, children, lampOn }: { title: string; children: React.ReactNode; lampOn: boolean }) {
  return (
    <div>
      <h3 className="font-semibold mb-2 text-base" style={{ color: lampOn ? '#111' : '#f9fafb' }}>{title}</h3>
      <div className="space-y-2" style={{ color: lampOn ? '#4b5563' : '#9ca3af' }}>{children}</div>
    </div>
  );
}

function PrivacyModal({ open, onClose, lang, lampOn }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean }) {
  const t = lang === 'EN';
  return (
    <ContentModal open={open} onClose={onClose} title={t ? 'Privacy Policy' : 'Política de Privacidad'} icon={<Lock className="w-4 h-4 text-white" />} lampOn={lampOn}>
      <p style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>{t ? 'Last updated: August 1, 2026 · Effective immediately' : 'Última actualización: 1 de agosto de 2026'}</p>
      <Section title={t ? '1. Information We Collect' : '1. Información que recopilamos'} lampOn={lampOn}>
        <p>{t ? 'We collect information you provide directly when creating an account: name, email, and password. We also collect usage data including pages visited, features used, and timestamps.' : 'Recopilamos información que proporcionas al crear una cuenta: nombre, correo y contraseña.'}</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>{t ? 'Account information (name, email, password hash)' : 'Información de cuenta'}</li>
          <li>{t ? 'Notes content and metadata' : 'Contenido de notas y metadatos'}</li>
          <li>{t ? 'Device and browser information' : 'Información del dispositivo y navegador'}</li>
        </ul>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '2. How We Use Your Information' : '2. Cómo usamos tu información'} lampOn={lampOn}>
        <p>{t ? 'We use the information to provide, maintain, and improve NoteVault, authenticate your identity, and protect against fraud. We do not sell your data.' : 'Usamos la información para brindar y mejorar NoteVault. No vendemos tus datos.'}</p>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '3. Data Security' : '3. Seguridad de datos'} lampOn={lampOn}>
        <p>{t ? 'We implement AES-256 encryption at rest, TLS 1.3 in transit, bcrypt password hashing, and regular security audits.' : 'Implementamos cifrado AES-256, TLS 1.3 y auditorías periódicas.'}</p>
      </Section>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: lampOn ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: lampOn ? '#92400e' : '#fbbf24' }}>
        {t ? 'Questions? Contact privacy@notevault.io' : '¿Preguntas? privacy@notevault.io'}
      </div>
    </ContentModal>
  );
}

function TermsModal({ open, onClose, lang, lampOn }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean }) {
  const t = lang === 'EN';
  return (
    <ContentModal open={open} onClose={onClose} title={t ? 'Terms of Service' : 'Términos de Servicio'} icon={<BookOpen className="w-4 h-4 text-white" />} lampOn={lampOn}>
      <p style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>{t ? 'Last updated: August 1, 2026 · By using NoteVault you agree to these terms.' : 'Última actualización: 1 de agosto de 2026 · Al usar NoteVault aceptas estos términos.'}</p>
      <Section title={t ? '1. Acceptance of Terms' : '1. Aceptación de términos'} lampOn={lampOn}>
        <p>{t ? 'By accessing NoteVault, you agree to be bound by these Terms of Service. If you disagree, you may not access the Service.' : 'Al acceder a NoteVault, aceptas estos Términos.'}</p>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '2. Account Responsibilities' : '2. Responsabilidades de cuenta'} lampOn={lampOn}>
        <ul className="list-disc list-inside space-y-1">
          <li>{t ? 'You must be at least 13 years old' : 'Debes tener al menos 13 años'}</li>
          <li>{t ? 'You are responsible for keeping your password confidential' : 'Eres responsable de la confidencialidad de tu contraseña'}</li>
          <li>{t ? 'Notify us immediately of any unauthorized access' : 'Notifícanos inmediatamente cualquier acceso no autorizado'}</li>
        </ul>
      </Section>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: lampOn ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: lampOn ? '#92400e' : '#fbbf24' }}>
        {t ? 'Questions? Contact legal@notevault.io' : '¿Preguntas? legal@notevault.io'}
      </div>
    </ContentModal>
  );
}

function SupportModal({ open, onClose, lang, lampOn, onContact }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean; onContact: () => void }) {
  const t = lang === 'EN';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = t ? [
    { q: 'How do I reset my password?', a: 'Click "Forgot Password?" on the login screen to receive a reset email.' },
    { q: 'Can I access NoteVault offline?', a: 'Yes! NoteVault caches notes locally and syncs when you reconnect.' },
    { q: 'How do I export my notes?', a: 'Use the "Save to Computer" section in the sidebar.' },
    { q: 'Is there a storage limit?', a: 'Free accounts get 500 MB. Premium accounts get 50 GB.' },
    { q: 'Can I use both personal and professional emails?', a: 'Yes! NoteVault accepts both personal (Gmail, Yahoo, etc.) and professional email addresses.' },
  ] : [
    { q: '¿Cómo restablezco mi contraseña?', a: 'Haz clic en "¿Olvidaste tu contraseña?" en el inicio de sesión.' },
    { q: '¿Puedo usar NoteVault sin conexión?', a: 'Sí. Las notas se almacenan localmente y sincronizan al reconectarte.' },
    { q: '¿Cómo exporto mis notas?', a: 'Usa la sección "Guardar en Computadora" en el menú lateral.' },
    { q: '¿Hay límite de almacenamiento?', a: 'Las cuentas gratuitas tienen 500 MB. Premium tiene 50 GB.' },
  ];
  return (
    <ContentModal open={open} onClose={onClose} title={t ? 'Help & Support' : 'Ayuda y Soporte'} icon={<User className="w-4 h-4 text-white" />} lampOn={lampOn}>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl overflow-hidden border transition-all" style={{ borderColor: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }}>
            <button className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{ background: lampOn ? (openFaq === i ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.5)') : (openFaq === i ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)') }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span className="font-medium text-sm" style={{ color: lampOn ? '#111' : '#f9fafb' }}>{faq.q}</span>
              <span className="text-yellow-500 ml-2 text-lg leading-none">{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 pb-3 text-sm"
                style={{ color: lampOn ? '#6b7280' : '#9ca3af', background: lampOn ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.02)' }}>
                {faq.a}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onClose(); onContact(); }}
        className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 shadow-lg flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" />{t ? 'Send Us a Message' : 'Envíanos un Mensaje'}
      </motion.button>
    </ContentModal>
  );
}

function ContactModal({ open, onClose, lang, lampOn }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean }) {
  const t = lang === 'EN';
  const [name, setName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const light = lampOn;

  const handleClose = () => { setName(''); setCEmail(''); setSubject(''); setMessage(''); setSent(false); onClose(); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 1800); };

  const inputStyle = { background: light ? '#ffffff' : 'rgba(0,0,0,0.4)', borderColor: light ? '#d1d5db' : 'rgba(120,53,15,0.35)', color: light ? '#111' : '#f3f4f6' };
  const labelColor = light ? '#374151' : '#d1d5db';

  return (
    <ContentModal open={open} onClose={handleClose} title={t ? 'Contact Us' : 'Contáctanos'} icon={<Mail className="w-4 h-4 text-white" />} lampOn={lampOn}>
      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/40">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: light ? '#111' : '#fff' }}>{t ? 'Message sent!' : '¡Mensaje enviado!'}</h3>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleClose} className="px-8 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900">
            {t ? 'Done' : 'Cerrar'}
          </motion.button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{t ? 'Full Name' : 'Nombre'}</label>
              <div className="relative">
                <User className="absolute left-3 w-4 h-4 text-yellow-600 top-1/2 -translate-y-1/2" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all" style={inputStyle} placeholder={t ? 'Your name' : 'Tu nombre'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 w-4 h-4 text-yellow-600 top-1/2 -translate-y-1/2" />
                <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} required className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all" style={inputStyle} placeholder="you@example.com" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{t ? 'Subject' : 'Asunto'}</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} required className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-all" style={inputStyle}>
              <option value="">{t ? '— Select a topic —' : '— Selecciona un tema —'}</option>
              <option value="billing">{t ? 'Billing & Subscription' : 'Facturación'}</option>
              <option value="bug">{t ? 'Bug Report' : 'Reporte de error'}</option>
              <option value="feature">{t ? 'Feature Request' : 'Solicitud de función'}</option>
              <option value="other">{t ? 'Other' : 'Otro'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{t ? 'Message' : 'Mensaje'}</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="w-full border rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all resize-none" style={inputStyle} placeholder={t ? 'Describe your issue...' : 'Describe tu problema...'} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !subject}
            className="relative w-full overflow-hidden rounded-xl py-3.5 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Mail className="w-4 h-4" />}
              {t ? 'Send Message' : 'Enviar Mensaje'}
            </span>
          </motion.button>
        </form>
      )}
    </ContentModal>
  );
}

// ─── Improved LampCordRight ───────────────────────────────────────────────────
function LampCordRight({ lampOn, onToggle, className = '' }: { lampOn: boolean; onToggle: () => void; className?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const dragStartY = useRef(0);
  const MAX_PULL = 140;
  const TRIGGER_THRESHOLD = 48; // easier pull
  const CORD_BASE = 64;

  const onKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPullDistance(Math.max(0, Math.min(MAX_PULL, e.clientY - dragStartY.current)));
  };
  const onKnobPointerUp = () => {
    if (!isDragging) return;
    if (pullDistance >= TRIGGER_THRESHOLD) onToggle();
    setPullDistance(0);
    setIsDragging(false);
  };

  const wireColor = lampOn ? '#b0a080' : '#4b5563';
  const shadeLight = lampOn ? 'linear-gradient(180deg,#a06030 0%,#d08840 55%,#a05020 100%)' : 'linear-gradient(180deg,#1a0a02 0%,#3a1608 60%,#1e0b02 100%)';

  return (
    <div className={`fixed right-0 top-0 bottom-0 z-40 flex flex-col items-center ${className}`} style={{ width: 64, pointerEvents: 'none' }}>
      {/* Ceiling wire */}
      <div style={{ width: 3, height: 52, background: `linear-gradient(180deg, ${wireColor}, ${wireColor})`, borderRadius: 2, transition: 'background 0.7s', pointerEvents: 'none' }} />

      {/* Lamp assembly */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
        {/* Halo glow */}
        <motion.div style={{ position: 'absolute', width: 140, height: 140, top: -28, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,rgba(255,220,80,0.7) 0%,transparent 65%)', filter: 'blur(20px)', pointerEvents: 'none' }}
          animate={{ opacity: lampOn ? 1 : 0, scale: lampOn ? 1 : 0.6 }} transition={{ duration: 0.6 }} />

        {/* Top mount / ceiling plate */}
        <div style={{ width: 48, height: 10, borderRadius: '3px 3px 0 0', background: lampOn ? 'linear-gradient(90deg,#6b3a10,#b06828,#6b3a10)' : 'linear-gradient(90deg,#1c0f04,#3d1a08,#1c0f04)', boxShadow: lampOn ? '0 2px 8px rgba(160,96,30,0.5)' : 'none', transition: 'background 0.7s, box-shadow 0.7s' }} />

        {/* Shade body */}
        <div style={{ width: 118, height: 76, clipPath: 'polygon(11% 0%,89% 0%,100% 100%,0% 100%)', position: 'relative', overflow: 'hidden', background: shadeLight, transition: 'background 0.7s', boxShadow: lampOn ? '0 8px 24px rgba(200,120,0,0.4)' : 'none' }}>
          <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,248,160,0.95) 0%,rgba(255,200,55,0.65) 55%,rgba(255,150,20,0.15) 100%)' }}
            animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.5 }} />
          {[...Array(5)].map((_, i) => <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 22}%`, width: 1, background: 'rgba(0,0,0,0.1)' }} />)}
          {/* Bottom rim highlight */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: lampOn ? 'rgba(255,220,100,0.5)' : 'transparent', transition: 'background 0.5s' }} />
        </div>

        {/* Bulb */}
        <motion.div style={{ width: 26, height: 26, borderRadius: '50%', marginTop: -5, zIndex: 2 }}
          animate={{ background: lampOn ? 'radial-gradient(circle at 35% 30%,#fffff0,#ffe060 45%,#ff9000)' : 'radial-gradient(circle at 35% 30%,#555,#222)', boxShadow: lampOn ? '0 0 28px 12px rgba(255,220,40,0.95),0 0 60px 24px rgba(255,180,20,0.5)' : '0 2px 5px rgba(0,0,0,0.5)' }}
          transition={{ duration: 0.5 }} />
      </div>

      {/* Light cone */}
      <motion.div style={{ width: 220, height: 260, clipPath: 'polygon(38% 0%,62% 0%,100% 100%,0% 100%)', background: 'linear-gradient(180deg,rgba(255,235,90,0.55) 0%,rgba(255,200,55,0.18) 55%,transparent 100%)', filter: 'blur(7px)', pointerEvents: 'none', marginTop: -3 }}
        animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.7 }} />

      {/* Fixed cord segment */}
      <div style={{ width: 3, height: CORD_BASE, background: wireColor, borderRadius: 2, transition: 'background 0.7s', marginTop: -232, pointerEvents: 'none' }} />

      {/* Draggable knob + cord */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${pullDistance}px)`, transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', marginTop: CORD_BASE - 3, pointerEvents: 'all', touchAction: 'none' }}
        onPointerDown={onKnobPointerDown}
        onPointerMove={onKnobPointerMove}
        onPointerUp={onKnobPointerUp}
        onPointerCancel={onKnobPointerUp}
      >
        {/* Stretching cord */}
        <div style={{ width: 3, height: 42 + pullDistance * 0.4, background: wireColor, borderRadius: 2, transition: isDragging ? 'none' : 'height 0.55s cubic-bezier(0.34,1.56,0.64,1),background 0.7s' }} />

        {/* Knob — larger and softer for easy grab */}
        <motion.div whileHover={{ scale: 1.2 }} style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${lampOn ? '#ffd700' : '#6b7280'}`, background: lampOn ? 'radial-gradient(circle at 32% 28%,#fffde0,#ffd700 48%,#b8860b)' : 'radial-gradient(circle at 32% 28%,#9ca3af,#4b5563)', boxShadow: lampOn ? '0 0 20px 8px rgba(255,215,0,0.7),inset 0 1px 3px rgba(255,255,200,0.6)' : '0 4px 14px rgba(0,0,0,0.6),inset 0 1px 2px rgba(255,255,255,0.1)', transition: 'background 0.5s,border-color 0.5s,box-shadow 0.5s' }}>
          {/* Inner dot */}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: lampOn ? 'rgba(255,255,220,0.95)' : 'rgba(255,255,255,0.25)', transition: 'background 0.5s' }} />
        </motion.div>

        {/* Trigger hint */}
        {isDragging && pullDistance >= TRIGGER_THRESHOLD && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 8, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(255,215,0,0.18)', border: '1px solid rgba(255,215,0,0.55)', color: '#ffd700', whiteSpace: 'nowrap' }}>
            {lampOn ? 'Release to turn off' : 'Release to turn on!'}
          </motion.div>
        )}
      </div>

      {/* Idle hint pulse */}
      {!isDragging && (
        <motion.p
          animate={{ opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 2.8, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 20, fontSize: 9, writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: lampOn ? '#ca8a04' : '#6b7280', userSelect: 'none', pointerEvents: 'none', transition: 'color 0.7s', letterSpacing: 1 }}>
          {lampOn ? '↑ pull off' : '↓ pull on'}
        </motion.p>
      )}
    </div>
  );
}

// ─── NoteVaultApp ─────────────────────────────────────────────────────────────
type AppPage = 'dashboard' | 'new-note' | 'all-files' | 'save' | 'recycle';

function NoteVaultApp({ lampOn, onToggleLamp, notes, setNotes, currentUser, setCurrentUser, onLogout, language }: {
  lampOn: boolean; onToggleLamp: () => void;
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  currentUser: CurrentUser; setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  onLogout: () => void; language: string;
}) {
  const [page, setPage] = useState<AppPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const dark = !lampOn;
  const bg = dark ? '#0d1117' : '#f8f9fa';
  const textPrimary = dark ? '#e6edf3' : '#111827';
  const textSecondary = dark ? '#8b949e' : '#6b7280';
  const borderColor = dark ? 'rgba(48,54,61,0.9)' : 'rgba(209,213,219,0.8)';
  const cardBg = dark ? '#161b22' : '#ffffff';
  const sidebarBg = dark ? '#000000' : '#ffffff';
  const topbarBg = dark ? 'rgba(1,4,9,0.92)' : 'rgba(255,255,255,0.95)';

  const activeNotes = notes.filter(n => !n.deleted && !n.archived);
  const deletedCount = notes.filter(n => n.deleted).length;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCurrentUser(u => u ? { ...u, photo: ev.target?.result as string } : u);
    reader.readAsDataURL(file);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    setSearchFocused(false);
  };

  const filteredNotes = activeNotes.filter(n => {
    const matchSearch = !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || n.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const navItems = [
    { id: 'dashboard' as AppPage, icon: <LayoutDashboard className="w-5 h-5" />, label: language === 'EN' ? 'Dashboard' : 'Panel' },
    { id: 'new-note' as AppPage, icon: <FilePlus className="w-5 h-5" />, label: language === 'EN' ? 'New Note' : 'Nueva Nota' },
    { id: 'all-files' as AppPage, icon: <FolderOpen className="w-5 h-5" />, label: language === 'EN' ? 'All Files' : 'Todos los Archivos' },
    { id: 'save' as AppPage, icon: <Download className="w-5 h-5" />, label: language === 'EN' ? 'Save to Computer' : 'Guardar' },
    { id: 'recycle' as AppPage, icon: <Trash2 className="w-5 h-5" />, label: language === 'EN' ? 'Recycle Bin' : 'Papelera', badge: deletedCount },
  ];

  const categoryColors: Record<string, string> = { planned: '#3b82f6', watching: '#8b5cf6', purchased: '#22c55e', cancelled: '#ef4444' };

  const navigateTo = (id: AppPage) => {
    setPage(id);
    if (id !== 'new-note') setEditingNote(null);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-900/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: textPrimary }}>NoteVault</span>
          </div>
        )}
        <button onClick={() => setSidebarCollapsed(p => !p)}
          className="p-2 rounded-xl transition-colors hidden md:flex"
          style={{ color: textSecondary, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-xl md:hidden" style={{ color: textSecondary }}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User */}
      <div className={`flex flex-col items-center py-5 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}
        style={{ borderBottom: dark ? '1px solid #21262d' : '1px solid #e5e7eb' }}>
        <button onClick={() => photoInputRef.current?.click()}
          className="relative rounded-full overflow-hidden group mb-3"
          style={{ width: sidebarCollapsed ? 40 : 72, height: sidebarCollapsed ? 40 : 72, border: `3px solid ${dark ? '#ca8a04' : 'rgba(202,138,4,0.5)'}`, transition: 'all 0.3s' }}>
          {currentUser.photo
            ? <img src={currentUser.photo} alt="user" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: dark ? 'linear-gradient(135deg,#92400e,#ca8a04)' : 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
                <User style={{ width: sidebarCollapsed ? 18 : 28, height: sidebarCollapsed ? 18 : 28, color: 'white' }} />
              </div>}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-white" />
          </div>
        </button>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        {!sidebarCollapsed && (
          <>
            <p className="text-xs mb-0.5" style={{ color: textSecondary }}>{language === 'EN' ? 'Welcome back,' : 'Bienvenido,'}</p>
            <p className="font-bold text-sm text-center w-full truncate" style={{ color: textPrimary }}>{currentUser.name}</p>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all relative ${sidebarCollapsed ? 'justify-center' : ''}`}
              style={{
                background: active ? (dark ? 'linear-gradient(135deg,#78350f,#451a03)' : 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(180,60,0,0.1))') : 'transparent',
                color: active ? '#fbbf24' : textSecondary,
              }}>
              <span style={{ color: active ? '#fbbf24' : textSecondary }}>{item.icon}</span>
              {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              {item.badge != null && item.badge > 0 && (
                <span className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: dark ? '1px solid #21262d' : '1px solid #e5e7eb' }}>
        <button onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all hover:bg-red-500/10 ${sidebarCollapsed ? 'justify-center' : ''}`}
          style={{ color: '#f87171' }}>
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="font-medium text-sm">{language === 'EN' ? 'Log Out' : 'Cerrar Sesión'}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen transition-colors duration-700" style={{ background: bg }}>
      {/* Background grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: dark ? 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)' : 'linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }} />
        {!dark && <motion.div animate={{ scale: [1,1.2,1], opacity: [0.1,0.2,0.1] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,rgba(202,138,4,0.15),rgba(180,100,0,0.08))' }} />}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={() => setMobileSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 flex flex-col md:hidden w-72"
            style={{ background: sidebarBg, borderRight: dark ? '1px solid #21262d' : '1px solid #e5e7eb' }}>
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div animate={{ width: sidebarCollapsed ? 72 : 260 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative z-30 flex-col shrink-0 hidden md:flex"
        style={{ background: sidebarBg, borderRight: dark ? '1px solid #21262d' : '1px solid #e5e7eb', height: '100vh', position: 'sticky', top: 0 }}>
        <SidebarContent />
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10" style={{ paddingRight: 56 }}>
        {/* Topbar */}
        <div className="sticky top-0 z-20 backdrop-blur-xl border-b px-3 sm:px-6 py-3 flex items-center gap-3"
          style={{ background: topbarBg, borderColor }}>
          {/* Mobile menu button */}
          <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 rounded-xl transition-colors" style={{ color: textSecondary, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 relative flex justify-center">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) handleSearch(searchQuery); }}
                placeholder={language === 'EN' ? 'Search notes...' : 'Buscar notas...'}
                className="w-full pl-9 pr-9 py-2 rounded-xl border text-sm focus:outline-none transition-all"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor, color: textPrimary }} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }}><X className="w-4 h-4" /></button>
              )}
              <AnimatePresence>
                {searchFocused && recentSearches.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-50"
                    style={{ background: dark ? '#0d1117' : '#fff', borderColor }}>
                    {recentSearches.map((s, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-yellow-500/10 cursor-pointer transition-colors" onClick={() => handleSearch(s)}>
                        <div className="flex items-center gap-2"><Search className="w-3.5 h-3.5" style={{ color: textSecondary }} /><span className="text-sm" style={{ color: textPrimary }}>{s}</span></div>
                        <button onClick={e => { e.stopPropagation(); setRecentSearches(prev => prev.filter((_, idx) => idx !== i)); }} style={{ color: textSecondary }}><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    <div className="border-t px-4 py-2" style={{ borderColor }}>
                      <button onClick={() => setRecentSearches([])} className="text-xs" style={{ color: '#ca8a04' }}>{language === 'EN' ? 'Clear all' : 'Limpiar todo'}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <AnimatePresence mode="wait">
            {page === 'dashboard' && (
              <DashboardView key="dashboard" notes={notes} setNotes={setNotes} lampOn={lampOn} language={language}
                filteredNotes={filteredNotes} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                onEditNote={note => { setEditingNote(note); setPage('new-note'); }}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} categoryColors={categoryColors} />
            )}
            {page === 'new-note' && (
              <NewNoteView key="new-note" lampOn={lampOn} language={language} editingNote={editingNote}
                onSave={note => {
                  if (editingNote) setNotes(prev => prev.map(n => n.id === editingNote.id ? note : n));
                  else setNotes(prev => [note, ...prev]);
                  setEditingNote(null); setPage('dashboard');
                }}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} />
            )}
            {page === 'all-files' && (
              <AllFilesView key="all-files" notes={notes} setNotes={setNotes} lampOn={lampOn} language={language}
                onEditNote={note => { setEditingNote(note); setPage('new-note'); }}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} categoryColors={categoryColors} />
            )}
            {page === 'save' && (
              <SaveView key="save" notes={notes} lampOn={lampOn} language={language}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} categoryColors={categoryColors} />
            )}
            {page === 'recycle' && (
              <RecycleView key="recycle" notes={notes} setNotes={setNotes} lampOn={lampOn} language={language}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} />
            )}
          </AnimatePresence>
        </div>
      </div>

      <LampCordRight lampOn={lampOn} onToggle={onToggleLamp} />
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ notes, setNotes, lampOn, language, filteredNotes, categoryFilter, setCategoryFilter, onEditNote, textPrimary, textSecondary, borderColor, cardBg, dark, categoryColors }: {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>; lampOn: boolean; language: string;
  filteredNotes: Note[]; categoryFilter: string; setCategoryFilter: (c: string) => void;
  onEditNote: (note: Note) => void;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
  categoryColors: Record<string, string>;
}) {
  const total = notes.filter(n => !n.deleted && !n.archived).length;
  const highPriority = notes.filter(n => !n.deleted && n.highPriority).length;
  const archived = notes.filter(n => n.archived && !n.deleted).length;
  const deleted = notes.filter(n => n.deleted).length;

  const stats = [
    { label: language === 'EN' ? 'Total Notes' : 'Total Notas', value: total, icon: <FileText className="w-5 h-5" />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: language === 'EN' ? 'High Priority' : 'Alta Prioridad', value: highPriority, icon: <Star className="w-5 h-5" />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: language === 'EN' ? 'Archived' : 'Archivadas', value: archived, icon: <FolderOpen className="w-5 h-5" />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: language === 'EN' ? 'Recycle Bin' : 'Papelera', value: deleted, icon: <Trash2 className="w-5 h-5" />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  const categories = ['all', 'planned', 'watching', 'purchased', 'cancelled'];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
      {/* Stat cards — white in light mode */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor, backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: textPrimary }}>{s.value}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: textSecondary }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <motion.button key={cat} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCategoryFilter(cat)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
            style={{
              background: categoryFilter === cat ? (dark ? 'linear-gradient(135deg,rgba(234,179,8,0.3),rgba(153,0,0,0.2))' : 'linear-gradient(135deg,rgba(234,179,8,0.2),rgba(153,0,0,0.12))') : 'transparent',
              borderColor: categoryFilter === cat ? 'rgba(234,179,8,0.6)' : borderColor,
              color: categoryFilter === cat ? '#fbbf24' : textSecondary,
            }}>
            {cat === 'all' ? (language === 'EN' ? 'All' : 'Todos') : `#${cat}`}
          </motion.button>
        ))}
      </div>

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FileText className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'No notes here yet' : 'No hay notas aquí aún'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, boxShadow: dark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.1)' }}
              className="rounded-2xl p-4 border cursor-pointer transition-all" style={{ background: note.noteColor ? note.noteColor + (dark ? '22' : '15') : cardBg, borderColor: note.noteColor ? note.noteColor + '55' : borderColor }}
              onClick={() => onEditNote(note)}>
              {note.pinned && <div className="flex items-center gap-1 text-xs mb-2" style={{ color: '#f59e0b' }}><Pin className="w-3 h-3" />{language === 'EN' ? 'Pinned' : 'Fijado'}</div>}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold truncate flex-1 text-sm sm:text-base" style={{ color: textPrimary }}>{note.title || (language === 'EN' ? 'Untitled' : 'Sin título')}</h3>
                {note.highPriority && <Star className="w-4 h-4 text-yellow-400 shrink-0 ml-2 fill-yellow-400" />}
              </div>
              <p className="text-sm line-clamp-2 mb-3" style={{ color: textSecondary }}>
                {note.content.replace(/<[^>]*>/g, '').slice(0, 100) || '...'}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: textSecondary }}>#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${categoryColors[note.category]}20`, color: categoryColors[note.category] }}>#{note.category}</span>
                <span className="text-xs" style={{ color: textSecondary }}>{new Date(note.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── New Note View ─────────────────────────────────────────────────────────────
function NewNoteView({ lampOn, language, editingNote, onSave, textPrimary, textSecondary, borderColor, cardBg, dark }: {
  lampOn: boolean; language: string; editingNote: Note | null;
  onSave: (note: Note) => void;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
}) {
  const [title, setTitle] = useState(editingNote?.title ?? '');
  const [content, setContent] = useState(editingNote?.content ?? '');
  const [date, setDate] = useState(() => editingNote ? editingNote.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [category, setCategory] = useState<Note['category']>(editingNote?.category ?? 'planned');
  const [highPriority, setHighPriority] = useState(editingNote?.highPriority ?? false);
  const [pinned, setPinned] = useState(editingNote?.pinned ?? false);
  const [files, setFiles] = useState<Note['files']>(editingNote?.files ?? []);
  const [tags, setTags] = useState<string[]>(editingNote?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [noteColor, setNoteColor] = useState(editingNote?.noteColor ?? '');
  const [reminder, setReminder] = useState(editingNote?.reminder ?? '');
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableHover, setTableHover] = useState<[number, number]>([0, 0]);
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const text = editorRef.current?.innerText ?? '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [content]);

  const execCmd = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type, dataUrl: ev.target?.result as string }]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#+/, '');
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput(''); }
  };

  const insertTable = (rows: number, cols: number) => {
    let html = '<table style="border-collapse:collapse;width:100%">';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += `<td style="border:1px solid ${dark ? '#4b5563' : '#d1d5db'};padding:6px;min-width:60px">&nbsp;</td>`;
      html += '</tr>';
    }
    html += '</table>';
    document.execCommand('insertHTML', false, html);
    setShowTablePicker(false);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    const note: Note = {
      id: editingNote?.id ?? `note-${Date.now()}`,
      title: title.trim() || (language === 'EN' ? 'Untitled' : 'Sin título'),
      content: editorRef.current?.innerHTML ?? content,
      date: new Date(date).toISOString(),
      category, files, deleted: false, highPriority, archived: editingNote?.archived ?? false,
      pinned, tags, noteColor, reminder,
    };
    onSave(note);
  };

  const tbBtn = (title_: string, onClick: () => void, children: React.ReactNode) => (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" title={title_} onClick={onClick}
      className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/15"
      style={{ color: dark ? '#c9d1d9' : '#374151', border: 'none', cursor: 'pointer', background: 'transparent' }}>
      {children}
    </motion.button>
  );

  const categoryColors: Record<string, string> = { planned: '#3b82f6', watching: '#8b5cf6', purchased: '#22c55e', cancelled: '#ef4444' };
  const noteColors = [
    { value: '', label: language === 'EN' ? 'Default' : 'Por defecto', swatch: dark ? '#161b22' : '#ffffff' },
    { value: '#f59e0b', label: 'Amber', swatch: '#fef3c7' },
    { value: '#3b82f6', label: 'Blue', swatch: '#dbeafe' },
    { value: '#22c55e', label: 'Green', swatch: '#dcfce7' },
    { value: '#8b5cf6', label: 'Purple', swatch: '#ede9fe' },
    { value: '#f43f5e', label: 'Rose', swatch: '#ffe4e6' },
    { value: '#06b6d4', label: 'Cyan', swatch: '#cffafe' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="max-w-3xl mx-auto space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>
          {editingNote ? (language === 'EN' ? 'Edit Note' : 'Editar Nota') : (language === 'EN' ? 'New Note' : 'Nueva Nota')}
        </h2>
        <div className="flex items-center gap-2">
          {pinned && <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>📌 {language === 'EN' ? 'Pinned' : 'Fijado'}</span>}
        </div>
      </div>

      {/* Title */}
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder={language === 'EN' ? 'Note title...' : 'Título de la nota...'}
        className="w-full text-xl sm:text-2xl font-semibold bg-transparent border-b-2 pb-2 focus:outline-none transition-colors"
        style={{ borderColor, color: textPrimary }} />

      {/* Rich text editor — white background in light mode */}
      <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: '#ffffff', borderColor }}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b" style={{ borderColor, background: dark ? '#1c2128' : '#f9fafb' }}>
          {tbBtn('Bold', () => execCmd('bold'), <Bold className="w-4 h-4" />)}
          {tbBtn('Italic', () => execCmd('italic'), <Italic className="w-4 h-4" />)}
          {tbBtn('Underline', () => execCmd('underline'), <Underline className="w-4 h-4" />)}
          {tbBtn('Strike', () => execCmd('strikeThrough'), <Strikethrough className="w-4 h-4" />)}
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          {tbBtn('H1', () => execCmd('formatBlock', 'h1'), <span className="text-xs font-bold">H1</span>)}
          {tbBtn('H2', () => execCmd('formatBlock', 'h2'), <span className="text-xs font-bold">H2</span>)}
          {tbBtn('H3', () => execCmd('formatBlock', 'h3'), <span className="text-xs font-bold">H3</span>)}
          <select onChange={e => execCmd('fontSize', e.target.value)} className="text-xs rounded px-1 py-0.5 border focus:outline-none"
            style={{ background: dark ? '#0d1117' : '#fff', borderColor, color: dark ? '#e6edf3' : '#374151' }}>
            <option value="1">XS</option>
            <option value="2">SM</option>
            <option value="3">MD</option>
            <option value="5">LG</option>
            <option value="7">XL</option>
          </select>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          {tbBtn('Align Left', () => execCmd('justifyLeft'), <AlignLeft className="w-4 h-4" />)}
          {tbBtn('Center', () => execCmd('justifyCenter'), <AlignCenter className="w-4 h-4" />)}
          {tbBtn('Align Right', () => execCmd('justifyRight'), <AlignRight className="w-4 h-4" />)}
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          {tbBtn('Bullet list', () => execCmd('insertUnorderedList'), <List className="w-4 h-4" />)}
          {tbBtn('Numbered list', () => execCmd('insertOrderedList'), <ListOrdered className="w-4 h-4" />)}
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          {/* Table picker */}
          <div className="relative">
            {tbBtn('Table', () => setShowTablePicker(p => !p), <Table className="w-4 h-4" />)}
            {showTablePicker && (
              <div className="absolute top-full left-0 mt-1 p-2 rounded-xl border shadow-xl z-50" style={{ background: dark ? '#0d1117' : '#fff', borderColor }}>
                <p className="text-xs mb-2" style={{ color: textSecondary }}>{tableHover[0] > 0 ? `${tableHover[0]}×${tableHover[1]}` : (language === 'EN' ? 'Select size' : 'Tamaño')}</p>
                <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                  {Array.from({ length: 36 }, (_, idx) => {
                    const r = Math.floor(idx / 6) + 1, c = (idx % 6) + 1;
                    return <div key={idx} className="w-5 h-5 rounded-sm cursor-pointer border transition-colors"
                      style={{ background: r <= tableHover[0] && c <= tableHover[1] ? 'rgba(234,179,8,0.4)' : 'transparent', borderColor }}
                      onMouseEnter={() => setTableHover([r, c])} onClick={() => insertTable(r, c)} />;
                  })}
                </div>
              </div>
            )}
          </div>
          {tbBtn('Divider', () => execCmd('insertHorizontalRule'), <Minus className="w-4 h-4" />)}
          {tbBtn('Link', () => { const url = prompt('URL:'); if (url) execCmd('createLink', url); }, <Link className="w-4 h-4" />)}
          {tbBtn('Code', () => execCmd('formatBlock', 'pre'), <Code className="w-4 h-4" />)}
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          {tbBtn('Undo', () => execCmd('undo'), <span className="text-sm">↩</span>)}
          {tbBtn('Redo', () => execCmd('redo'), <span className="text-sm">↪</span>)}
        </div>

        {/* Editor area — always white */}
        <div ref={editorRef} contentEditable suppressContentEditableWarning
          onInput={e => setWordCount(e.currentTarget.innerText.trim() ? e.currentTarget.innerText.trim().split(/\s+/).length : 0)}
          dangerouslySetInnerHTML={{ __html: content }}
          className="p-4 sm:p-5 focus:outline-none min-h-[240px]"
          style={{ color: '#111827', background: '#ffffff', caretColor: '#fbbf24', fontSize: 15, lineHeight: '1.7' }} />

        {/* Word count footer */}
        <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor, background: dark ? '#1c2128' : '#f9fafb' }}>
          <span className="text-xs" style={{ color: textSecondary }}>{wordCount} {language === 'EN' ? 'words' : 'palabras'}</span>
          <span className="text-xs" style={{ color: textSecondary }}>{language === 'EN' ? 'Rich text editor' : 'Editor de texto enriquecido'}</span>
        </div>
      </div>

      {/* Options row: priority + pin */}
      <div className="flex flex-wrap gap-2">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setHighPriority(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm"
          style={{ borderColor: highPriority ? '#f59e0b' : borderColor, background: highPriority ? 'rgba(245,158,11,0.12)' : cardBg, color: highPriority ? '#f59e0b' : textSecondary }}>
          <Star className={`w-4 h-4 ${highPriority ? 'fill-yellow-400' : ''}`} />
          {language === 'EN' ? 'High Priority' : 'Alta Prioridad'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setPinned(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm"
          style={{ borderColor: pinned ? '#f59e0b' : borderColor, background: pinned ? 'rgba(245,158,11,0.12)' : cardBg, color: pinned ? '#f59e0b' : textSecondary }}>
          <Pin className="w-4 h-4" />
          {language === 'EN' ? 'Pin Note' : 'Fijar Nota'}
        </motion.button>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>{language === 'EN' ? 'Category' : 'Categoría'}</label>
        <div className="flex gap-2 flex-wrap">
          {(['planned', 'watching', 'purchased', 'cancelled'] as Note['category'][]).map(cat => (
            <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{ borderColor: category === cat ? categoryColors[cat] : borderColor, color: category === cat ? categoryColors[cat] : textSecondary, background: category === cat ? `${categoryColors[cat]}18` : cardBg }}>
              #{cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Note Color */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: textSecondary }}>
          <Palette className="w-4 h-4" />{language === 'EN' ? 'Note Color' : 'Color de Nota'}
        </label>
        <div className="flex gap-2 flex-wrap">
          {noteColors.map(nc => (
            <button key={nc.value} onClick={() => setNoteColor(nc.value)} title={nc.label}
              className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
              style={{ background: nc.swatch, borderColor: noteColor === nc.value ? '#fbbf24' : borderColor, boxShadow: noteColor === nc.value ? '0 0 0 2px rgba(251,191,36,0.4)' : 'none' }}>
              {noteColor === nc.value && nc.value === '' && <div className="w-full h-full rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4" style={{ color: dark ? '#e6edf3' : '#374151' }} /></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: textSecondary }}>
          <Tag className="w-4 h-4" />{language === 'EN' ? 'Tags' : 'Etiquetas'}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', color: textPrimary }}>
              #{tag}
              <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} style={{ color: textSecondary }} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
              className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-all"
              style={{ background: '#ffffff', borderColor, color: '#111827' }}
              placeholder={language === 'EN' ? 'Add tag, press Enter' : 'Agregar etiqueta, Enter'} />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addTag}
            className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
            style={{ borderColor, color: textSecondary, background: cardBg }}>
            {language === 'EN' ? 'Add' : 'Agregar'}
          </motion.button>
        </div>
      </div>

      {/* Date & Reminder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: textSecondary }}>{language === 'EN' ? 'Date & Time' : 'Fecha y Hora'}</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-all"
            style={{ background: '#ffffff', borderColor, color: '#111827' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: textSecondary }}>
            <Bell className="w-3.5 h-3.5" />{language === 'EN' ? 'Reminder' : 'Recordatorio'}
          </label>
          <input type="datetime-local" value={reminder} onChange={e => setReminder(e.target.value)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-all"
            style={{ background: '#ffffff', borderColor, color: '#111827' }} />
        </div>
      </div>

      {/* Attachments */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <label className="text-sm font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'Attachments' : 'Archivos adjuntos'}</label>
          <motion.button whileHover={{ scale: 1.04 }} type="button" onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-yellow-500"
            style={{ borderColor, color: textSecondary, background: cardBg }}>
            <Paperclip className="w-4 h-4" />{language === 'EN' ? 'Attach file' : 'Adjuntar archivo'}
          </motion.button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileAdd} multiple />
        </div>
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border text-sm" style={{ borderColor, background: '#ffffff' }}>
                <span style={{ color: '#111827' }} className="truncate flex-1">{f.name}</span>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span style={{ color: textSecondary }}>{(f.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ color: '#ef4444' }}><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <motion.button whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(234,179,8,0.3)' }} whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        className="relative w-full overflow-hidden rounded-xl py-4 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-semibold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2">
        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="relative z-10">{language === 'EN' ? 'Save Note' : 'Guardar Nota'}</span>
      </motion.button>
    </motion.div>
  );
}

// ─── All Files View ────────────────────────────────────────────────────────────
function AllFilesView({ notes, setNotes, lampOn, language, onEditNote, textPrimary, textSecondary, borderColor, cardBg, dark, categoryColors }: {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>; lampOn: boolean; language: string;
  onEditNote: (note: Note) => void;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
  categoryColors: Record<string, string>;
}) {
  const visibleNotes = notes.filter(n => !n.deleted).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const deleteNote = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, deleted: true, deletedAt: new Date().toISOString() } : n));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>{language === 'EN' ? 'All Files' : 'Todos los Archivos'}</h2>
      {visibleNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FolderOpen className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'No files yet' : 'Sin archivos aún'}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: cardBg, borderColor }}>
          {visibleNotes.map((note, i) => (
            <div key={note.id} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 ${i !== 0 ? 'border-t' : ''} hover:bg-yellow-500/5 transition-colors`} style={{ borderColor }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: textSecondary }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm sm:text-base" style={{ color: textPrimary }}>{note.title}</p>
                <p className="text-xs hidden sm:block" style={{ color: textSecondary }}>{new Date(note.date).toLocaleString()}</p>
              </div>
              {note.highPriority && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 hidden sm:inline-block" style={{ background: `${categoryColors[note.category]}20`, color: categoryColors[note.category] }}>#{note.category}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => onEditNote(note)} className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/10" style={{ color: textSecondary }}><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: '#ef4444' }}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Save View ─────────────────────────────────────────────────────────────────
function SaveView({ notes, lampOn, language, textPrimary, textSecondary, borderColor, cardBg, dark, categoryColors }: {
  notes: Note[]; lampOn: boolean; language: string;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
  categoryColors: Record<string, string>;
}) {
  const visibleNotes = notes.filter(n => !n.deleted);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleNote = (id: string) => setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAll = () => setSelected(selected.size === visibleNotes.length ? new Set() : new Set(visibleNotes.map(n => n.id)));

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(visibleNotes.filter(n => selected.has(n.id)), null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `notevault-export-${new Date().toISOString().slice(0, 10)}.notevault` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>{language === 'EN' ? 'Save to Computer' : 'Guardar en Computadora'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={toggleAll} className="text-sm px-3 py-1.5 rounded-lg border transition-all" style={{ borderColor, color: textSecondary, background: cardBg }}>
            {selected.size === visibleNotes.length ? (language === 'EN' ? 'Deselect All' : 'Deseleccionar') : (language === 'EN' ? 'Select All' : 'Seleccionar Todo')}
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownload} disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40 bg-gradient-to-r from-yellow-500 to-amber-600 shadow-md">
            <Download className="w-4 h-4" />
            {language === 'EN' ? `Download (${selected.size})` : `Descargar (${selected.size})`}
          </motion.button>
        </div>
      </div>
      {visibleNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Download className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'No notes to export' : 'Sin notas para exportar'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleNotes.map(note => (
            <div key={note.id} onClick={() => toggleNote(note.id)} className="rounded-2xl p-4 border cursor-pointer transition-all" style={{ background: cardBg, borderColor: selected.has(note.id) ? '#fbbf24' : borderColor, outline: selected.has(note.id) ? '2px solid rgba(251,191,36,0.35)' : 'none' }}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected.has(note.id) ? 'bg-yellow-500 border-yellow-500' : ''}`} style={{ borderColor: selected.has(note.id) ? '#fbbf24' : borderColor }}>
                  {selected.has(note.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm" style={{ color: textPrimary }}>{note.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{new Date(note.date).toLocaleDateString()}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block" style={{ background: `${categoryColors[note.category]}20`, color: categoryColors[note.category] }}>#{note.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Recycle Bin View ──────────────────────────────────────────────────────────
function RecycleView({ notes, setNotes, lampOn, language, textPrimary, textSecondary, borderColor, cardBg, dark }: {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>; lampOn: boolean; language: string;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
}) {
  const deletedNotes = notes.filter(n => n.deleted);
  const restore = (id: string) => setNotes(prev => prev.map(n => {
    if (n.id !== id) return n;
    const { deletedAt: _deletedAt, ...restoredNote } = n;
    return { ...restoredNote, deleted: false };
  }));
  const deleteForever = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  const emptyBin = () => setNotes(prev => prev.filter(n => !n.deleted));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>{language === 'EN' ? 'Recycle Bin' : 'Papelera'}</h2>
        {deletedNotes.length > 0 && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={emptyBin} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-red-500/10" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            <Trash2 className="w-4 h-4" />{language === 'EN' ? 'Empty Recycle Bin' : 'Vaciar Papelera'}
          </motion.button>
        )}
      </div>
      {deletedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Trash2 className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'Recycle bin is empty' : 'La papelera está vacía'}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: cardBg, borderColor }}>
          {deletedNotes.map((note, i) => (
            <div key={note.id} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 ${i !== 0 ? 'border-t' : ''} hover:bg-red-500/5 transition-colors`} style={{ borderColor }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: textSecondary }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm sm:text-base" style={{ color: textPrimary }}>{note.title}</p>
                <p className="text-xs" style={{ color: textSecondary }}>{language === 'EN' ? 'Deleted' : 'Eliminado'}: {note.deletedAt ? new Date(note.deletedAt).toLocaleString() : '—'}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => restore(note.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:border-green-500 hover:text-green-500" style={{ borderColor, color: textSecondary }}>
                  <RotateCcw className="w-3.5 h-3.5" /><span className="hidden sm:inline">{language === 'EN' ? 'Restore' : 'Restaurar'}</span>
                </button>
                <button onClick={() => deleteForever(note.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:bg-red-500/10" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                  <X className="w-3.5 h-3.5" /><span className="hidden sm:inline">{language === 'EN' ? 'Delete Forever' : 'Eliminar'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({
  lampOn, setLampOn, language, setLanguage, onLogin,
  showGoogle, setShowGoogle, showGitHub, setShowGitHub,
  showSignUp, setShowSignUp, showPrivacy, setShowPrivacy,
  showTerms, setShowTerms, showSupport, setShowSupport,
  showContact, setShowContact,
}: {
  lampOn: boolean; setLampOn: (v: boolean) => void;
  language: string; setLanguage: (v: string) => void;
  onLogin: (user: CurrentUser) => void;
  showGoogle: boolean; setShowGoogle: (v: boolean) => void;
  showGitHub: boolean; setShowGitHub: (v: boolean) => void;
  showSignUp: boolean; setShowSignUp: (v: boolean) => void;
  showPrivacy: boolean; setShowPrivacy: (v: boolean) => void;
  showTerms: boolean; setShowTerms: (v: boolean) => void;
  showSupport: boolean; setShowSupport: (v: boolean) => void;
  showContact: boolean; setShowContact: (v: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const dragStartY = useRef(0);
  const dark = !lampOn;
  const MAX_PULL = 130;
  const TRIGGER_THRESHOLD = 50;
  const CORD_BASE = 80;
  const emailType = detectEmailType(email);

  const validate = () => {
    const e: { email?: string; pass?: string } = {};
    if (!isValidEmail(email)) e.email = language === 'EN' ? 'Enter a valid email address' : 'Ingresa un correo válido';
    if (!isValidPassword(password)) e.pass = language === 'EN' ? 'Password must be at least 8 characters' : 'Mínimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ name: email.split('@')[0] || 'User', email, photo: null });
    }, 1500);
  };

  const onKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true); dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPullDistance(Math.max(0, Math.min(MAX_PULL, e.clientY - dragStartY.current)));
  };
  const onKnobPointerUp = () => {
    if (!isDragging) return;
    if (pullDistance >= TRIGGER_THRESHOLD) setLampOn(!lampOn);
    setPullDistance(0); setIsDragging(false);
  };

  const inputStyle = {
    background: '#ffffff',
    borderColor: dark ? 'rgba(120,53,15,0.4)' : 'rgba(209,213,219,0.9)',
    color: '#111827',
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden transition-colors duration-700" style={{ background: dark ? '#030712' : '#fffbeb' }}>
      {/* Lamp radiance */}
      <motion.div className="fixed inset-0 pointer-events-none z-[1]" animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.9 }}
        style={{ background: 'radial-gradient(ellipse 75% 100% at 26% 32%,rgba(255,210,70,0.42) 0%,rgba(255,170,30,0.2) 38%,transparent 68%)' }} />

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 transition-opacity duration-700"
          style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.04) 1px,transparent 1px)', backgroundSize: '50px 50px', opacity: dark ? 1 : 0.3 }} />
        <motion.div animate={{ scale: [1,1.2,1], opacity: [0.2,0.4,0.2] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,rgba(202,138,4,0.3),rgba(180,100,0,0.2))' }} />
        <motion.div animate={{ scale: [1,1.3,1], opacity: [0.15,0.28,0.15] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,rgba(127,0,0,0.3),rgba(100,0,0,0.18))' }} />
        {[...Array(12)].map((_, i) => (
          <motion.div key={i} animate={{ y: [0,-65,0], opacity: [0,0.5,0] }} transition={{ duration: 3+i*0.22, repeat: Infinity, delay: i*0.38 }}
            className="absolute w-1 h-1 rounded-full" style={{ left: `${6+i*7.5}%`, top: `${18+(i%5)*14}%`, background: 'rgba(234,179,8,0.5)' }} />
        ))}
      </div>

      {/* Header */}
      <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="relative z-20 backdrop-blur-xl border-b transition-colors duration-700"
        style={{ background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.8)', borderColor: dark ? 'rgba(120,53,15,0.22)' : 'rgba(209,213,219,0.6)' }}>
        <div className="container mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold transition-colors duration-700" style={{ color: dark ? '#fff' : '#111' }}>NoteVault</h1>
              <p className="text-xs text-yellow-600 hidden sm:block">Premium Access</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'EN' ? 'ES' : 'EN')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm transition-all text-sm"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', color: dark ? '#fff' : '#111' }}>
            <Globe className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{language}</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main split — stacks on mobile */}
      <main className="relative z-10 flex-1 flex flex-col sm:flex-row">
        {/* LEFT — Lamp panel (desktop) */}
        <div className="hidden sm:flex w-full sm:w-2/5 lg:w-1/2 flex-col items-center justify-center relative overflow-hidden">
          {/* Background light cone */}
          <motion.div className="absolute pointer-events-none"
            style={{ top: '4%', left: '50%', transform: 'translateX(-50%)', width: 400, height: '70%', clipPath: 'polygon(37% 0%,63% 0%,100% 100%,0% 100%)', background: 'linear-gradient(180deg,rgba(255,235,90,0.6) 0%,rgba(255,200,55,0.22) 55%,transparent 100%)', filter: 'blur(10px)' }}
            animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.75 }} />

          <div className="flex flex-col items-center" style={{ marginTop: '-6%' }}>
            {/* Ceiling wire */}
            <div style={{ width: 3, height: 92, background: lampOn ? '#b0a080' : (dark ? '#4b5563' : '#9ca3af'), borderRadius: 2, transition: 'background 0.7s' }} />

            {/* Lamp assembly */}
            <div className="relative flex flex-col items-center">
              {/* Halo glow */}
              <motion.div className="absolute pointer-events-none"
                style={{ width: 220, height: 220, top: -44, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,rgba(255,220,80,0.7) 0%,transparent 65%)', filter: 'blur(26px)' }}
                animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.55 }} />

              {/* Ceiling plate */}
              <div style={{ width: 60, height: 12, borderRadius: '4px 4px 0 0', background: lampOn ? 'linear-gradient(90deg,#6b3a10,#b06828,#6b3a10)' : (dark ? 'linear-gradient(90deg,#1c0f04,#3d1a08,#1c0f04)' : 'linear-gradient(90deg,#7c4a1e,#b06828,#7c4a1e)'), boxShadow: lampOn ? '0 2px 10px rgba(160,96,30,0.55)' : 'none', transition: 'background 0.7s, box-shadow 0.7s' }} />

              {/* Shade */}
              <div style={{ width: 158, height: 100, clipPath: 'polygon(11% 0%,89% 0%,100% 100%,0% 100%)', position: 'relative', overflow: 'hidden', background: lampOn ? 'linear-gradient(180deg,#a06030 0%,#d08840 55%,#a05020 100%)' : (dark ? 'linear-gradient(180deg,#180902 0%,#321408 60%,#1e0b02 100%)' : 'linear-gradient(180deg,#9a5520 0%,#c07030 60%,#8c4a18 100%)'), transition: 'background 0.7s', boxShadow: lampOn ? '0 10px 30px rgba(200,120,0,0.45)' : 'none' }}>
                <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,248,160,0.95) 0%,rgba(255,200,55,0.68) 55%,rgba(255,150,20,0.18) 100%)' }} animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.5 }} />
                {[...Array(7)].map((_, i) => <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 16}%`, width: 1, background: 'rgba(0,0,0,0.1)' }} />)}
                {/* Bottom rim */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: lampOn ? 'rgba(255,220,100,0.5)' : 'transparent', transition: 'background 0.5s' }} />
              </div>

              {/* Bulb */}
              <motion.div style={{ width: 28, height: 28, borderRadius: '50%', marginTop: -6, zIndex: 2 }}
                animate={{ background: lampOn ? 'radial-gradient(circle at 33% 28%,#fffde4,#ffd600 48%,#ff8c00)' : 'radial-gradient(circle at 33% 28%,#555,#2a2a2a)', boxShadow: lampOn ? '0 0 32px 14px rgba(255,220,40,0.95),0 0 70px 28px rgba(255,180,20,0.5)' : '0 2px 5px rgba(0,0,0,0.5)' }}
                transition={{ duration: 0.5 }} />
            </div>

            {/* Fixed cord */}
            <div style={{ width: 3, height: CORD_BASE, background: lampOn ? '#b0a080' : (dark ? '#6b7280' : '#9ca3af'), borderRadius: 2, transition: 'background 0.7s' }} />

            {/* Draggable knob */}
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${pullDistance}px)`, transition: isDragging ? 'none' : 'transform 0.52s cubic-bezier(0.34,1.56,0.64,1)', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
              onPointerDown={onKnobPointerDown} onPointerMove={onKnobPointerMove} onPointerUp={onKnobPointerUp} onPointerCancel={onKnobPointerUp}>
              {/* Stretching cord */}
              <div style={{ width: 3, height: 48 + pullDistance * 0.45, background: lampOn ? '#b0a080' : (dark ? '#6b7280' : '#9ca3af'), borderRadius: 2, transition: isDragging ? 'none' : 'height 0.52s cubic-bezier(0.34,1.56,0.64,1),background 0.7s' }} />
              {/* Knob */}
              <motion.div whileHover={{ scale: 1.15 }}
                style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2.5px solid ${lampOn ? '#ffd700' : (dark ? '#4b5563' : '#9ca3af')}`, background: lampOn ? 'radial-gradient(circle at 32% 28%,#fffde0,#ffd700 48%,#b8860b)' : (dark ? 'radial-gradient(circle at 32% 28%,#9ca3af,#4b5563)' : 'radial-gradient(circle at 32% 28%,#e5e7eb,#9ca3af)'), boxShadow: lampOn ? '0 0 22px 9px rgba(255,215,0,0.7),inset 0 1px 3px rgba(255,255,200,0.6)' : '0 4px 14px rgba(0,0,0,0.35),inset 0 1px 2px rgba(255,255,255,0.15)', transition: 'background 0.5s,border-color 0.5s,box-shadow 0.5s' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: lampOn ? 'rgba(255,255,220,0.95)' : 'rgba(255,255,255,0.25)', transition: 'background 0.5s' }} />
              </motion.div>
              {isDragging && pullDistance >= TRIGGER_THRESHOLD && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,215,0,0.18)', border: '1px solid rgba(255,215,0,0.5)', color: '#ffd700', whiteSpace: 'nowrap' }}>
                  {lampOn ? (language === 'EN' ? 'Release to turn off' : 'Suelta para apagar') : (language === 'EN' ? 'Release to turn on!' : '¡Suelta para encender!')}
                </motion.div>
              )}
            </div>
          </div>

          <motion.p className="absolute bottom-10 text-sm" style={{ color: lampOn ? '#ca8a04' : (dark ? '#4b5563' : '#9ca3af'), transition: 'color 0.7s' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.8, repeat: Infinity }}>
            {lampOn ? (language === 'EN' ? '↑ Pull to turn off' : '↑ Jala para apagar') : (language === 'EN' ? '↓ Pull to turn on' : '↓ Jala para encender')}
          </motion.p>
        </div>

        {/* RIGHT — Login form */}
        <div className="w-full sm:w-3/5 lg:w-1/2 relative flex items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-80px)] sm:min-h-0">
          <motion.div className="absolute inset-0 pointer-events-none z-30" animate={{ opacity: dark ? 1 : 0 }} transition={{ duration: 0.85 }} style={{ background: 'rgba(0,0,0,0.82)' }} />
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full max-w-md relative z-10">
            <div className="absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-700" style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.28),rgba(153,0,0,0.18),rgba(255,150,20,0.28))', opacity: lampOn ? 1 : 0.25 }} />
            <div className="relative backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border-2 transition-colors duration-700"
              style={{ background: lampOn ? 'linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,251,235,0.92))' : 'linear-gradient(135deg,rgba(0,0,0,0.84),rgba(60,0,0,0.32))', borderColor: lampOn ? 'rgba(209,213,219,0.8)' : 'rgba(120,53,15,0.32)' }}>
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-500/25 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-500/25 rounded-br-3xl" />

              <div className="text-center mb-6 sm:mb-8">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 mb-4 sm:mb-6 shadow-2xl shadow-yellow-500/50 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl blur-md opacity-50 animate-pulse" />
                  <BookOpen className="relative w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl mb-2 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 bg-clip-text text-transparent font-bold">
                  {language === 'EN' ? 'Welcome Back' : 'Bienvenido'}
                </h2>
                <p style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>{language === 'EN' ? 'Access your premium account' : 'Accede a tu cuenta premium'}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <label className="block mb-1.5 text-sm font-medium transition-colors duration-700" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                    {language === 'EN' ? 'Email Address' : 'Correo Electrónico'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-5 h-5 text-yellow-600" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                        style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : inputStyle.borderColor }}
                        placeholder={language === 'EN' ? 'your@email.com' : 'tu@email.com'} required />
                    </div>
                  </div>
                  {errors.email && <p className="text-xs mt-1 flex items-center gap-1 text-red-500"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
                  {!errors.email && emailType && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: emailType === 'professional' ? 'rgba(59,130,246,0.08)' : 'rgba(234,179,8,0.08)', border: `1px solid ${emailType === 'professional' ? 'rgba(59,130,246,0.22)' : 'rgba(234,179,8,0.28)'}` }}>
                      {emailType === 'professional' ? <Briefcase className="w-4 h-4 text-blue-500" /> : <Home className="w-4 h-4 text-yellow-500" />}
                      <span className="text-xs font-medium" style={{ color: emailType === 'professional' ? '#3b82f6' : '#ca8a04' }}>
                        {emailType === 'professional' ? (language === 'EN' ? 'Professional email' : 'Correo profesional') : (language === 'EN' ? 'Personal email' : 'Correo personal')}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <label className="block mb-1.5 text-sm font-medium transition-colors duration-700" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                    {language === 'EN' ? 'Password' : 'Contraseña'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-5 h-5 text-yellow-600" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                        style={{ ...inputStyle, borderColor: errors.pass ? '#ef4444' : inputStyle.borderColor }}
                        placeholder="Min. 8 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 transition-colors" style={{ color: '#6b7280' }}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {errors.pass && <p className="text-xs mt-1 flex items-center gap-1 text-red-500"><AlertCircle className="w-3.5 h-3.5" />{errors.pass}</p>}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer gap-2 transition-colors duration-700" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                    <input type="checkbox" className="w-4 h-4 rounded border-yellow-600 accent-yellow-500" />
                    {language === 'EN' ? 'Remember me' : 'Recordarme'}
                  </label>
                  <a href="#" className="text-yellow-600 hover:text-yellow-500 transition-colors font-medium">
                    {language === 'EN' ? 'Forgot Password?' : '¿Olvidaste tu contraseña?'}
                  </a>
                </motion.div>

                <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 25px 50px rgba(234,179,8,0.4)' }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={isLoading}
                  className="relative w-full overflow-hidden rounded-xl py-4 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-semibold disabled:opacity-50 shadow-lg shadow-yellow-500/30">
                  <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />}
                    {language === 'EN' ? 'Sign In' : 'Iniciar Sesión'}
                  </span>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center gap-4 mt-5">
                <div className="flex-1 h-px" style={{ background: lampOn ? 'rgba(209,213,219,0.6)' : 'rgba(120,53,15,0.32)' }} />
                <span className="text-sm whitespace-nowrap" style={{ color: lampOn ? '#9ca3af' : '#6b7280' }}>{language === 'EN' ? 'or continue with' : 'o continúa con'}</span>
                <div className="flex-1 h-px" style={{ background: lampOn ? 'rgba(209,213,219,0.6)' : 'rgba(120,53,15,0.32)' }} />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={() => setShowGoogle(true)}
                  className="relative flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all overflow-hidden text-sm font-medium"
                  style={{ background: '#ffffff', borderColor: lampOn ? 'rgba(209,213,219,0.8)' : 'rgba(120,53,15,0.32)', color: '#374151' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={() => setShowGitHub(true)}
                  className="relative flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all overflow-hidden text-sm font-medium"
                  style={{ background: dark ? '#21262d' : '#24292f', borderColor: dark ? '#30363d' : 'transparent', color: '#ffffff' }}>
                  <Github className="w-5 h-5 shrink-0" />
                  GitHub
                </motion.button>
              </div>

              <p className="text-center mt-5 text-sm" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                {language === 'EN' ? "Don't have an account?" : '¿No tienes cuenta?'}{' '}
                <button type="button" onClick={() => setShowSignUp(true)} className="text-yellow-600 hover:text-yellow-500 transition-colors font-semibold">
                  {language === 'EN' ? 'Sign up free' : 'Regístrate gratis'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-20 backdrop-blur-xl border-t transition-colors duration-700"
        style={{ background: dark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.8)', borderColor: dark ? 'rgba(120,53,15,0.22)' : 'rgba(209,213,219,0.5)' }}>
        <div className="container mx-auto px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-center sm:text-left transition-colors duration-700" style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
              © 2026 NoteVault. {language === 'EN' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
            </p>
            <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6">
              {[
                { en: 'Privacy', es: 'Privacidad', action: () => setShowPrivacy(true) },
                { en: 'Terms', es: 'Términos', action: () => setShowTerms(true) },
                { en: 'Support', es: 'Soporte', action: () => setShowSupport(true) },
                { en: 'Contact', es: 'Contacto', action: () => setShowContact(true) },
              ].map(item => (
                <button key={item.en} type="button" onClick={item.action}
                  className="text-sm font-medium transition-colors hover:text-amber-600"
                  style={{ color: dark ? '#6b7280' : '#9ca3af' }}>
                  {language === 'EN' ? item.en : item.es}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>

      {/* The full lamp occupies the desktop panel; this compact lamp is mobile-only. */}
      <LampCordRight lampOn={lampOn} onToggle={() => setLampOn(!lampOn)} className="sm:hidden" />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [lampOn, setLampOn] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [transitionKey, setTransitionKey] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);

  const [showGoogle, setShowGoogle] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nv_notes');
    if (saved) try { setNotes(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('nv_notes', JSON.stringify(notes)); }, [notes]);

  const handleLogin = useCallback((user: CurrentUser) => { setCurrentUser(user); setIsLoggedIn(true); }, []);
  const handleLogout = useCallback(() => { setIsLoggedIn(false); setCurrentUser(null); }, []);
  const handleToggleLamp = useCallback(() => { setLampOn(prev => !prev); setTransitionKey(k => k + 1); }, []);

  return (
    <>
      {/* Radial light/dark transition */}
      <AnimatePresence>
        <motion.div key={transitionKey}
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="fixed inset-0 pointer-events-none z-[99]"
          style={{ background: lampOn ? 'rgba(255,235,100,0.22)' : 'rgba(0,0,0,0.35)' }} />
      </AnimatePresence>

      {/* Modals */}
      <GoogleModal open={showGoogle} onClose={() => setShowGoogle(false)} lang={language} onLogin={handleLogin} onOpenSignUp={() => setShowSignUp(true)} />
      <GitHubModal open={showGitHub} onClose={() => setShowGitHub(false)} lang={language} onLogin={handleLogin} onOpenSignUp={() => setShowSignUp(true)} />
      <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} lang={language} lampOn={lampOn} onLogin={handleLogin} />
      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} lang={language} lampOn={lampOn} />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} lang={language} lampOn={lampOn} />
      <SupportModal open={showSupport} onClose={() => setShowSupport(false)} lang={language} lampOn={lampOn} onContact={() => setShowContact(true)} />
      <ContactModal open={showContact} onClose={() => setShowContact(false)} lang={language} lampOn={lampOn} />

      <AnimatePresence mode="wait">
        {!isLoggedIn || !currentUser ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <LoginPage
              lampOn={lampOn} setLampOn={setLampOn} language={language} setLanguage={setLanguage} onLogin={handleLogin}
              showGoogle={showGoogle} setShowGoogle={setShowGoogle}
              showGitHub={showGitHub} setShowGitHub={setShowGitHub}
              showSignUp={showSignUp} setShowSignUp={setShowSignUp}
              showPrivacy={showPrivacy} setShowPrivacy={setShowPrivacy}
              showTerms={showTerms} setShowTerms={setShowTerms}
              showSupport={showSupport} setShowSupport={setShowSupport}
              showContact={showContact} setShowContact={setShowContact}
            />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <NoteVaultApp
              lampOn={lampOn} onToggleLamp={handleToggleLamp}
              notes={notes} setNotes={setNotes}
              currentUser={currentUser} setCurrentUser={setCurrentUser}
              onLogout={handleLogout} language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
