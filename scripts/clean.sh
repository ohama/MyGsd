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

# Git 관련 파일 (사용자 확인 후 제거)
GIT_CLEANED=""
if [ -d .git ] || [ -f .gitignore ]; then
    echo ""
    echo "⚠️  Git 관련 파일이 있습니다:"
    [ -d .git ] && echo "   - .git/ (git history)"
    [ -f .gitignore ] && echo "   - .gitignore"
    echo ""
    read -p "삭제할까요? [y/N] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        rm -rf .git/
        rm -f .gitignore
        GIT_CLEANED="yes"
    fi
fi

echo ""
echo "✅ Cleaned:"
echo "   - CHANGELOG.md, README.md, VERSION"
echo "   - .planning/"
echo "   - docs/howto/"
[ "$GIT_CLEANED" = "yes" ] && echo "   - .git/, .gitignore"
echo ""
echo "📝 Next steps:"
echo "   1. Create your README.md"
echo "   2. Run /gsd:new-project to start planning"
echo "   3. git add -A && git commit -m 'chore: Initialize new project'"
