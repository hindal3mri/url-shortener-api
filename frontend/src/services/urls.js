const URLS_ENDPOINT = '/api/urls'

export async function getLinks() {
  const response = await fetch(URLS_ENDPOINT)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load links.')
  }

  if (!Array.isArray(data.urls)) {
    throw new Error('Invalid response while loading links.')
  }

  const links = data.urls.map((link) => ({
    longUrl: link.longUrl,
    shortCode: link.shortCode,
    shortUrl: link.shortUrl || '',
    clicks: Number(link.clicks) || 0,
    createdAt: link.createdAt,
  }))

  if (
    links.some(
      (link) =>
        typeof link.longUrl !== 'string' ||
        typeof link.shortCode !== 'string'
    )
  ) {
    throw new Error('Invalid link in response.')
  }

  return links
}

export async function deleteLink(shortCode) {
  const response = await fetch(
    `${URLS_ENDPOINT}/${encodeURIComponent(shortCode)}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to delete link.')
  }
}
