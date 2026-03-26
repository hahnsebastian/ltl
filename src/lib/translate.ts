'use client'

import { useState, useCallback } from 'react'

export interface TranslationState {
  isTranslating: boolean
  currentLang: string
  error: string | null
}

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'sv', name: 'Svenska' },
]

export const SUPPORTED_LANGS = LANGS

async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en') return text
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'en', target: targetLang, format: 'text' }),
    })
    if (!res.ok) throw new Error('Translation failed')
    const data = await res.json()
    return data.translatedText ?? text
  } catch {
    return text
  }
}

export { translateText }

export function useTranslation() {
  const [state, setState] = useState<TranslationState>({
    isTranslating: false,
    currentLang: 'en',
    error: null,
  })

  const translate = useCallback(async (texts: string[], targetLang: string) => {
    if (targetLang === 'en') {
      setState(s => ({ ...s, currentLang: 'en', error: null }))
      return texts
    }
    setState(s => ({ ...s, isTranslating: true, error: null }))
    try {
      const translated = await Promise.all(texts.slice(0, 20).map(t => translateText(t, targetLang)))
      setState(s => ({ ...s, isTranslating: false, currentLang: targetLang }))
      return translated
    } catch {
      setState(s => ({ ...s, isTranslating: false, error: 'LibreTranslate unavailable' }))
      return texts
    }
  }, [])

  return { ...state, translate }
}
