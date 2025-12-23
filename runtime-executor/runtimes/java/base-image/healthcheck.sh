#!/bin/sh
# Health check script for Java runtime container

if command -v java >/dev/null 2>&1; then
    java -version >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "OK"
        exit 0
    fi
fi
echo "ERROR: Java runtime not available"
exit 1

