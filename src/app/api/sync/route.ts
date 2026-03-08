import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const REPO_OWNER = 'Garthbid'
const REPO_NAME = 'richard'
const BRANCH = 'main'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }

  try {
    // Fetch the full tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`,
      { headers }
    )
    if (!treeRes.ok) {
      return NextResponse.json(
        { error: `GitHub tree API: ${treeRes.status}` },
        { status: treeRes.status }
      )
    }

    const treeData = await treeRes.json()
    const mdFiles: string[] = treeData.tree
      .filter((item: { type: string; path: string }) =>
        item.type === 'blob' && item.path.endsWith('.md')
      )
      .map((item: { path: string }) => item.path)

    // Fetch all file contents in parallel (batches of 15)
    const files: { path: string; name: string; content: string }[] = []

    for (let i = 0; i < mdFiles.length; i += 15) {
      const batch = mdFiles.slice(i, i + 15)
      const results = await Promise.all(
        batch.map(async (path: string) => {
          const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${encodeURI(path)}`
          const res = await fetch(rawUrl, { headers })
          if (!res.ok) return null
          const content = await res.text()
          const name = path.split('/').pop() || path
          return { path: `/${path}`, name, content }
        })
      )
      files.push(...results.filter(Boolean) as typeof files)
    }

    return NextResponse.json({ files, count: files.length })
  } catch (err) {
    return NextResponse.json(
      { error: `Sync failed: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 500 }
    )
  }
}
