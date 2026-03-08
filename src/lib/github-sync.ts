export interface RepoFile {
  path: string
  name: string
  content: string
}

/** Fetch all .md files from the Richard repo via our server-side API */
export async function syncFromGitHub(): Promise<RepoFile[]> {
  const res = await fetch('/api/sync')
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Sync API error: ${res.status}`)
  }

  const data = await res.json()
  console.log(`Synced ${data.count} files from GitHub`)
  return data.files
}
