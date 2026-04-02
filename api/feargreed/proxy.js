export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const path = url.searchParams.get('p') || '/fng/?limit=1'
  const target = `https://api.alternative.me${path}`

  try {
    const res = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CryptoPulse/1.0',
      },
    })

    const body = await res.text()

    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control':
          res.status === 200
            ? 's-maxage=300, stale-while-revalidate=600'
            : 'no-store',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'proxy_error', detail: e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
