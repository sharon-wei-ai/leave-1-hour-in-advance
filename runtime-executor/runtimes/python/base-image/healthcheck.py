#!/usr/bin/env python3
"""Health check script for Python runtime container."""
import sys

try:
    # 简单检查 Python 环境是否正常
    import sys
    assert sys.version_info >= (3, 11)
    print("OK")
    sys.exit(0)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

