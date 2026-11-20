import { useState } from 'react'

function LinkCard({ link, language, translations, onDelete }) {
  const [copyStatus, setCopyStatus] = useState(null)
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.shortUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <article className="link-card" lang={language} dir={direction}>
      <div className="link-card-url link-card-original-url">
        <span className="link-card-label">{translations.originalUrl}</span>
        <a href={link.longUrl} target="_blank" rel="noreferrer" dir="ltr">
          {link.longUrl}
        </a>
      </div>

      <div className="link-card-url link-card-short-url">
        <span className="link-card-label">{translations.shortUrl}</span>
        {link.shortUrl ? (
          <a href={link.shortUrl} target="_blank" rel="noreferrer" dir="ltr">
            {link.shortUrl}
          </a>
        ) : (
          <span className="link-card-unavailable">
            {translations.shortUrlUnavailable}
          </span>
        )}
      </div>

      <p className="link-card-clicks">
        <span>{link.clicks}</span>
        <span>{translations.clicks}</span>
      </p>

      <div className="link-card-actions">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={
            copyStatus === 'copied'
              ? translations.copiedLink
              : translations.copyLink
          }
          title={
            copyStatus === 'copied'
              ? translations.copiedLink
              : translations.copyLink
          }
          disabled={!link.shortUrl}
        >
          {copyStatus === 'copied' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m5 12 4 4L19 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={translations.deleteLink}
          title={translations.deleteLink}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" />
          </svg>
        </button>
      </div>

      {copyStatus === 'error' && (
        <p className="error-message" role="alert">
          {translations.copyError}
        </p>
      )}
    </article>
  )
}

export default LinkCard