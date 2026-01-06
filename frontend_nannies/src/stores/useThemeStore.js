import create from 'zustand';

const THEME_KEY = 'hn_theme_mode';

const getInitialMode = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
  } catch (e) {}
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const useThemeStore = create((set) => ({
  mode: getInitialMode(),
  setMode: (mode) => {
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
    set({ mode });
  },
  toggleMode: () => set((state) => {
    const next = state.mode === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    return { mode: next };
  })
}));

export default useThemeStore;
