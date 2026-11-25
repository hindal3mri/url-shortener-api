import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import translations from './translations'

function App() {
  const [language, setLanguage] = useState('en')
  const [activeView, setActiveView] = useState('home')
  const [linksRefreshKey, setLinksRefreshKey] = useState(0)
  const t = translations[language]
  const isArabic = language === 'ar'

  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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
      const response = await fetch('https://url-shortener-api-production-18900921.up.railway.app/api/urls', {
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
      setLinksRefreshKey((currentKey) => currentKey + 1)
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
    <div
      className={`page page-${activeView}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <nav className="navbar" aria-label={t.navigation}>
        <button
          type="button"
          className="brand"
          onClick={() => setActiveView('home')}
          aria-label="Shortly"
        >
          <img
            src="/shortly-logo.png"
            alt="Shortly logo"
            className="brand-logo"
          />
        </button>

        <div className="nav-links">
          <button
            type="button"
            className={`nav-link ${activeView === 'home' ? 'nav-link-active' : ''}`}
            onClick={() => setActiveView('home')}
            aria-current={activeView === 'home' ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
            <span>{t.home}</span>
          </button>
          <button
            type="button"
            className={`nav-link ${activeView === 'dashboard' ? 'nav-link-active' : ''}`}
            onClick={() => setActiveView('dashboard')}
            aria-current={activeView === 'dashboard' ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
            <span>{t.dashboard}</span>
          </button>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="language-button"
            aria-label={isArabic ? 'تغيير اللغة إلى الإنجليزية' : 'Switch language to Arabic'}
            onClick={() => {
              setLanguage(isArabic ? 'en' : 'ar')
              setError('')
            }}
          >
            <svg
              className="language-globe-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <span dir="auto">{isArabic ? 'العربية' : 'English'}</span>
            <svg
              className="language-chevron-icon"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>
        </div>
      </nav>

      {activeView === 'dashboard' ? (
        <Dashboard
          language={language}
          refreshKey={linksRefreshKey}
          onNewLink={() => setActiveView('home')}
        />
      ) : (
        <main className="hero" id="shortener">
          <h2>
            {t.title}
            <span>{t.subtitle}</span>
          </h2>

          <p className="hero-description">{t.description}</p>

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
              {t.shorten}
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
                  <span>{t.benefitDescriptions[index]}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} {t.footer}
      </footer>
    </div>
  )
}

export default App