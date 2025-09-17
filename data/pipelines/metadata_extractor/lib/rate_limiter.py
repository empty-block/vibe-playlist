"""
Simple rate limiting for web requests
"""

import asyncio
import random
from typing import Dict
from urllib.parse import urlparse

# Simple domain delay tracking
_last_request_times: Dict[str, float] = {}

def get_domain(url: str) -> str:
    """Extract domain from URL"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except Exception:
        return 'unknown'

async def wait_for_rate_limit(url: str, delay: float = 0.1) -> None:
    """Simple rate limiting with jitter"""
    # Add small jitter to avoid predictable patterns
    actual_delay = delay + random.uniform(0.05, 0.15)
    await asyncio.sleep(actual_delay)

def get_request_headers() -> Dict[str, str]:
    """Get basic request headers"""
    return {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    } 