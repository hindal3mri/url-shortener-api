
import { useState } from 'react'
import './App.css'
import translations from './translations'

function App() {
  const [language, setLanguage] = useState('en')
  const t = translations[language]
  const isArabic = language === 'ar'

  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const descriptions = isArabic
    ? [
        'للاستخدام في أي وقت',
        'ابدأ مباشرة دون حساب',
        'روابطك جاهزة خلال ثوانٍ',
      ]
    : [
        'Free to use anytime',
        'Start without an account',
        'Your links ready in seconds',
      ]

  const icons = ['✧', '↗', 'ϟ']

  const handleShorten = async (event) => {
    event.preventDefault()

    setError('')
    setShortUrl('')
    setCopied(false)

    const trimmedUrl = longUrl.trim()

    try {
      const parsedUrl = new URL(trimmedUrl)

      if (
        !['http:', 'https:'].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname.includes('.') ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        throw new Error('Invalid URL')
      }
    } catch {
      setError(t.invalid)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: trimmedUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL.')
      }

      setShortUrl(data.shortUrl)
      setLongUrl('')
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? t.connectionError
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
    } catch {
      setError(t.copyError)
    }
  }

  return (
    <div className="page" dir={isArabic ? 'rtl' : 'ltr'}>
      <nav className="navbar">
        <a className="brand" href="/" aria-label="Shortly">
          <img
            src="/shortly-logo.png"
            alt="Shortly logo"
            className="brand-logo"
          />
        </a>

        <div className="nav-actions">
          <button
            type="button"
            className="language-button"
            onClick={() => {
              setLanguage(isArabic ? 'en' : 'ar')
              setError('')
            }}
          >
            {isArabic ? 'EN' : 'AR'}
          </button>
        </div>
      </nav>

      <main className="hero">
        <h1>
          {t.title}
          <span>{t.subtitle}</span>
        </h1>

        <p className="hero-description">
          {t.description}
        </p>

        <form className="shortener-form" onSubmit={handleShorten}>
          <label className="sr-only" htmlFor="longUrl">
            {t.placeholder}
          </label>

          <input
            id="longUrl"
            type="text"
            inputMode="url"
            placeholder={t.placeholder}
            value={longUrl}
            onChange={(event) => {
              setLongUrl(event.target.value)
              setError('')
            }}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? t.loading : t.shorten}
          </button>
        </form>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {loading && (
          <p className="loading-message" role="status">
            {t.loading}
          </p>
        )}

        {shortUrl && (
          <div className="result-card">
            <div className="result-info">
              <span className="result-label">{t.result}</span>

              <a href={shortUrl} target="_blank" rel="noreferrer">
                {shortUrl}
              </a>
            </div>

            <button
              type="button"
              className="copy-button"
              onClick={handleCopy}
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        )}

        <div className="trust-note">
          {t.benefits.map((benefit, index) => (
            <div className="benefit-card" key={benefit}>
              <div className="benefit-icon" aria-hidden="true">
                {icons[index]}
              </div>

              <div className="benefit-text">
                <strong>{benefit}</strong>
                <span>{descriptions[index]}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Shortly. Simple links, made easy.
      </footer>
    </div>
  )
}

export default App
