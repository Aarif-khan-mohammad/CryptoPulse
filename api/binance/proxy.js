export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url    = new URL(req.url)
  const path   = url.searchParams.get('p') || ''
  const target = `https://api.binance.com${path}`

  try {
    const res  = await fetch(target, { headers: { Accept: 'application/json' } })
    const body = await res.text()
    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': res.status === 200
          ? 's-maxage=600, stale-while-revalidate=3600'
          : 'no-store',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'proxy_error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
