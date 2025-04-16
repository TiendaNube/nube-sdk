import type { BrowserTheme } from '@/contexts/devtools-theme-context'

export function getBrowserTheme(): BrowserTheme {
  return chrome.devtools.panels.themeName === 'dark' ? 'dark' : 'light';
}
