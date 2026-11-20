const URLS_ENDPOINT = '/api/urls'

export async function getLinks() {
  const response = await fetch(URLS_ENDPOINT)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load links.')
  }

  return data.urls
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
