#!/bin/bash
# clean.sh - 새 프로젝트 시작 전 불필요한 파일 정리
#
# 사용법: ./scripts/clean.sh
#
# 이 repository를 clone한 후, 새 프로젝트를 시작하기 전에 실행하세요.

set -e

echo "🧹 Cleaning up for new project..."

# 프로젝트 메타 파일
rm -f CHANGELOG.md
rm -f README.md
rm -f VERSION

# GSD 계획 파일
rm -rf .planning/

# 프로젝트별 문서
rm -rf docs/howto/

# Git 태그 제거 (로컬)
git tag -l | xargs -r git tag -d 2>/dev/null || true

echo ""
echo "✅ Cleaned:"
echo "   - CHANGELOG.md, README.md, VERSION"
echo "   - .planning/"
echo "   - docs/howto/"
echo "   - Git tags (local)"
echo ""
echo "📝 Next steps:"
echo "   1. Create your README.md"
echo "   2. Run /gsd:new-project to start planning"
echo "   3. git add -A && git commit -m 'chore: Initialize new project'"
