import { useEffect, useMemo, useState } from 'react'
import { deleteLink, getLinks } from '../services/urls'
import translations from '../translations'
import EmptyState from './EmptyState'
import LinkCard from './LinkCard'

function Dashboard({ language = 'en', refreshKey = 0, onNewLink }) {
  const t = translations[language]
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortByClicks, setSortByClicks] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadLinks = async () => {
      try {
        const data = await getLinks()

        if (isActive) {
          setLinks(
            data.map((link) => ({
              longUrl: link.longUrl,
              shortCode: link.shortCode,
              shortUrl: link.shortUrl,
              clicks: link.clicks,
              createdAt: link.createdAt,
            }))
          )
          setError(null)
        }
      } catch {
        if (isActive) {
          setError('fetch')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadLinks()

    return () => {
      isActive = false
    }
  }, [refreshKey])

  const sortedLinks = useMemo(() => {
    if (!sortByClicks) {
      return links
    }

    return [...links].sort((a, b) => b.clicks - a.clicks)
  }, [links, sortByClicks])

  const totalClicks = links.reduce(
    (total, link) => total + (Number(link.clicks) || 0),
    0
  )
  const mostClicked = links.reduce(
    (topLink, link) =>
      !topLink || Number(link.clicks) > Number(topLink.clicks)
        ? link
        : topLink,
    null
  )

  const handleDelete = async (shortCode) => {
    if (!window.confirm(t.deleteConfirm)) {
      return
    }

    setError(null)

    try {
      await deleteLink(shortCode)
      setLinks((currentLinks) =>
        currentLinks.filter((link) => link.shortCode !== shortCode)
      )
    } catch {
      setError('delete')
    }
  }

  const errorMessage =
    error === 'fetch' ? t.fetchError : error === 'delete' ? t.deleteError : null

  return (
    <section
      className="dashboard"
      id="dashboard"
      aria-labelledby="dashboard-title"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      aria-busy={loading}
    >
      <header className="dashboard-header">
        <div className="dashboard-heading-copy">
          <h1 id="dashboard-title">{t.dashboard}</h1>
          <p>{t.dashboardDescription}</p>
        </div>
        <button
          type="button"
          className="dashboard-new-link"
          onClick={onNewLink}
        >
          <span aria-hidden="true">+</span>
          {t.newLink}
        </button>
      </header>

      <div
        className="dashboard-summary"
        role="group"
        aria-label={t.dashboardSummary}
      >
        <article className="summary-card">
          <div className="summary-card-content">
            <p>{t.totalClicks}</p>
            <strong>{totalClicks}</strong>
          </div>
          <span className="summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3 4 13h6l-1 8 11-12h-7z" />
            </svg>
          </span>
        </article>

        <article className="summary-card">
          <div className="summary-card-content">
            <p>{t.totalLinks}</p>
            <strong>{links.length}</strong>
          </div>
          <span className="summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.72-1.71" />
            </svg>
          </span>
        </article>

        <article className="summary-card summary-card-most-clicked">
          <div className="summary-card-content">
            <p>{t.mostClicked}</p>
            {mostClicked ? (
              <>
                <a
                  href={mostClicked.shortUrl || undefined}
                  dir="ltr"
                  title={mostClicked.shortUrl || mostClicked.shortCode}
                >
                  {mostClicked.shortUrl || mostClicked.shortCode}
                </a>
                <span>
                  {Number(mostClicked.clicks) || 0} {t.clicks}
                </span>
              </>
            ) : (
              <strong>—</strong>
            )}
          </div>
          <span className="summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m3 17 6-6 4 4 8-9" />
              <path d="M15 6h6v6" />
            </svg>
          </span>
        </article>
      </div>

      {loading && (
        <p className="loading-message" role="status">
          {t.dashboardLoading}
        </p>
      )}

      {errorMessage && (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="dashboard-toolbar">
        <h2>{t.yourLinks}</h2>
        <button
          type="button"
          className="dashboard-sort-button"
          onClick={() => setSortByClicks((current) => !current)}
          aria-pressed={sortByClicks}
          disabled={links.length < 2}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 7h12M8 12h8M8 17h4M4 5v14m0 0-2-2m2 2 2-2" />
          </svg>
          {t.sortByClicks}
        </button>
      </div>

      {!loading && !error && links.length === 0 && (
        <EmptyState
          title={t.emptyState}
          description={t.emptyDescription}
          language={language}
        />
      )}

      {!loading && links.length > 0 && (
        <div className="dashboard-list">
          {sortedLinks.map((link) => (
            <LinkCard
              key={link.shortCode}
              link={link}
              language={language}
              translations={t}
              onDelete={() => handleDelete(link.shortCode)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Dashboard