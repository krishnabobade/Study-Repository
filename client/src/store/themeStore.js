import { create } from 'zustand'

const useThemeStore = create((set) => ({
  mode: localStorage.getItem('theme-mode') || 'dark',
  
  toggleTheme: () => set((state) => {
    const newMode = state.mode === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme-mode', newMode)
    
    // Apply class to document element
    if (newMode === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
    
    return { mode: newMode }
  }),

  initTheme: () => {
    const mode = localStorage.getItem('theme-mode') || 'dark'
    if (mode === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
    set({ mode })
  }
}))

export default useThemeStore
