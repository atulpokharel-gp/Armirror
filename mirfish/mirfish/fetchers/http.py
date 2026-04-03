from __future__ import annotations

import asyncio

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from mirfish.fetchers.base import BaseFetcher, FetchResult


class HttpFetcher(BaseFetcher):
    def __init__(
        self,
        user_agent: str = "mirfish/0.1.0",
        timeout: float = 30.0,
        retries: int = 3,
        rate_limit_rps: float = 2.0,
    ) -> None:
        self.user_agent = user_agent
        self.timeout = timeout
        self.retries = retries
        self._min_interval = 1.0 / rate_limit_rps if rate_limit_rps > 0 else 0.0
        self._last_request_time: float = 0.0
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                http2=True,
                follow_redirects=True,
                timeout=self.timeout,
                headers={"User-Agent": self.user_agent},
            )
        return self._client

    async def __aenter__(self) -> "HttpFetcher":
        self._client = httpx.AsyncClient(
            http2=True,
            follow_redirects=True,
            timeout=self.timeout,
            headers={"User-Agent": self.user_agent},
        )
        return self

    async def __aexit__(self, *args: object) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def _rate_limit(self) -> None:
        if self._min_interval <= 0:
            return
        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_request_time
        if elapsed < self._min_interval:
            await asyncio.sleep(self._min_interval - elapsed)
        self._last_request_time = asyncio.get_event_loop().time()

    async def fetch(self, url: str) -> FetchResult:
        client = await self._get_client()

        @retry(
            stop=stop_after_attempt(self.retries),
            wait=wait_exponential(multiplier=1, min=1, max=10),
            retry=retry_if_exception_type((httpx.TransportError, httpx.TimeoutException)),
            reraise=True,
        )
        async def _do_fetch() -> FetchResult:
            await self._rate_limit()
            response = await client.get(url)
            if response.status_code in (429, 503):
                raise httpx.TransportError(f"Rate limited: {response.status_code}")
            return FetchResult(
                html=response.text,
                status_code=response.status_code,
                headers=dict(response.headers),
                final_url=str(response.url),
            )

        return await _do_fetch()
