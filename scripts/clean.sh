#!/bin/bash
# clean.sh - 새 프로젝트 시작 전 불필요한 파일 정리
#
# 사용법: ./scripts/clean.sh
#
# 이 repository를 clone한 후, 새 프로젝트를 시작하기 전에 실행하세요.

set -e

echo "🧹 Cleaning up for new project..."

# GSD 계획 파일 (사용자 확인 후 제거)
PLANNING_CLEANED=""
if [ -d .planning ]; then
    echo ""
    echo "⚠️  GSD 계획 파일이 있습니다:"
    echo "   - .planning/"
    echo ""
    read -p "삭제할까요? [y/N] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        rm -rf .planning/
        PLANNING_CLEANED="yes"
    fi
fi

# 프로젝트별 문서 (사용자 확인 후 제거)
HOWTO_CLEANED=""
if [ -d docs/howto ]; then
    echo ""
    echo "⚠️  Howto 문서가 있습니다:"
    echo "   - docs/howto/"
    echo ""
    read -p "삭제할까요? [y/N] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        rm -rf docs/howto/
        HOWTO_CLEANED="yes"
    fi
fi

# 프로젝트 메타 파일 (사용자 확인 후 제거)
META_CLEANED=""
if [ -f CHANGELOG.md ] || [ -f README.md ] || [ -f VERSION ]; then
    echo ""
    echo "⚠️  프로젝트 메타 파일이 있습니다:"
    [ -f CHANGELOG.md ] && echo "   - CHANGELOG.md"
    [ -f README.md ] && echo "   - README.md"
    [ -f VERSION ] && echo "   - VERSION"
    echo ""
    read -p "삭제할까요? [y/N] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        rm -f CHANGELOG.md
        rm -f README.md
        rm -f VERSION
        META_CLEANED="yes"
    fi
fi

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
[ "$PLANNING_CLEANED" = "yes" ] && echo "   - .planning/"
[ "$HOWTO_CLEANED" = "yes" ] && echo "   - docs/howto/"
[ "$META_CLEANED" = "yes" ] && echo "   - CHANGELOG.md, README.md, VERSION"
[ "$GIT_CLEANED" = "yes" ] && echo "   - .git/, .gitignore"
echo ""
echo "📝 Next steps:"
echo "   1. Create your README.md"
echo "   2. Run /gsd:new-project to start planning"
echo "   3. git add -A && git commit -m 'chore: Initialize new project'"
