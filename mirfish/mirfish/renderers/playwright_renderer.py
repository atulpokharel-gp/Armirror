from __future__ import annotations

from typing import Any

from playwright.async_api import (
    Browser,
    BrowserContext,
    async_playwright,
)

from mirfish.fetchers.base import FetchResult
from mirfish.renderers.base import BaseRenderer


class PlaywrightRenderer(BaseRenderer):
    def __init__(self, timeout: float = 30.0, headless: bool = True) -> None:
        self.timeout = timeout
        self.headless = headless
        self._playwright: Any = None
        self._browser: Browser | None = None
        self._context: BrowserContext | None = None

    async def __aenter__(self) -> "PlaywrightRenderer":
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(headless=self.headless)
        self._context = await self._browser.new_context(
            user_agent="mirfish/0.1.0",
        )
        return self

    async def __aexit__(self, *args: object) -> None:
        if self._context:
            await self._context.close()
            self._context = None
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None

    async def render(self, url: str) -> FetchResult:
        if self._context is None:
            raise RuntimeError("PlaywrightRenderer must be used as a context manager")

        page = await self._context.new_page()
        try:
            response = await page.goto(
                url,
                wait_until="networkidle",
                timeout=self.timeout * 1000,
            )
            html = await page.content()
            return FetchResult(
                html=html,
                status_code=response.status if response else 200,
                headers=dict(await response.all_headers()) if response else {},
                final_url=page.url,
            )
        except Exception as exc:
            html = await page.content() if page else ""
            return FetchResult(
                html=html,
                status_code=0,
                headers={},
                final_url=url,
            )
        finally:
            await page.close()
