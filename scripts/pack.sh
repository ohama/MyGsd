#!/bin/bash
# pack.sh - .claude/ 디렉토리를 dist/*.tgz로 패키징
#
# 사용법: ./scripts/pack.sh

set -e

# 버전 읽기
VERSION=$(cat VERSION 2>/dev/null || echo "0.0.0")

# dist 디렉토리 생성
mkdir -p dist

# 출력 파일명
OUTPUT="dist/claude-gsd-${VERSION}.tgz"

# 패키징
tar -czf "$OUTPUT" .claude/

echo "✅ Packed: $OUTPUT"
echo "   $(du -h "$OUTPUT" | cut -f1)"
