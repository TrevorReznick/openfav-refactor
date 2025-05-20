import { atom } from 'nanostores'

export const themeStore = atom({
  theme: 'system',
  systemTheme: 'light',
})
