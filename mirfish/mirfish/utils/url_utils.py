from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse, urlunparse, urlencode, parse_qs, quote

import httpx


def normalize_url(url: str, base: str = "") -> str:
    url = url.strip()
    if not url:
        return ""
    if url.startswith("//"):
        scheme = urlparse(base).scheme if base else "https"
        url = f"{scheme}:{url}"
    elif url.startswith("/") and base:
        url = urljoin(base, url)
    elif not url.startswith(("http://", "https://")) and base:
        url = urljoin(base, url)
    parsed = urlparse(url)
    if not parsed.scheme:
        url = "https://" + url
    return url


def is_same_domain(url: str, domain: str) -> bool:
    parsed = urlparse(url)
    netloc = parsed.netloc.lower().lstrip("www.")
    domain = domain.lower().lstrip("www.")
    return netloc == domain or netloc.endswith("." + domain)


def is_excluded(url: str, patterns: list[str]) -> bool:
    import fnmatch
    for pattern in patterns:
        if fnmatch.fnmatch(url, pattern) or re.search(pattern, url):
            return True
    return False


async def fetch_sitemap_urls(base_url: str, client: httpx.AsyncClient) -> list[str]:
    urls: list[str] = []
    for path in ["/sitemap.xml", "/sitemap_index.xml"]:
        try:
            resp = await client.get(base_url.rstrip("/") + path, follow_redirects=True)
            if resp.status_code == 200:
                found = re.findall(r"<loc>(.*?)</loc>", resp.text)
                for u in found:
                    u = u.strip()
                    if u.endswith(".xml"):
                        try:
                            sub = await client.get(u, follow_redirects=True)
                            if sub.status_code == 200:
                                sub_urls = re.findall(r"<loc>(.*?)</loc>", sub.text)
                                urls.extend(s.strip() for s in sub_urls if not s.strip().endswith(".xml"))
                        except Exception:
                            pass
                    else:
                        urls.append(u)
                if urls:
                    break
        except Exception:
            continue
    return list(dict.fromkeys(urls))


def canonicalize(url: str) -> str:
    parsed = urlparse(url.lower())
    utm_params = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"}
    params = parse_qs(parsed.query)
    filtered = {k: v for k, v in params.items() if k not in utm_params}
    sorted_query = urlencode(sorted(filtered.items()), doseq=True)
    canonical = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip("/") or "/", "", sorted_query, ""))
    return canonical
