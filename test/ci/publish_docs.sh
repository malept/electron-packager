#!/bin/bash -xe

GIT_REVISION="$1"

if test -z "$PUBLISH_BRANCH"; then
    PUBLISH_BRANCH=gh-pages
fi

npm run typedoc -- $GIT_REVISION

if test -n "$GIT_REVISION"; then
    DOC_TARGET_DIR="$GIT_REVISION"
else
    DOC_TARGET_DIR=master
    $(npm bin)/marked --gfm < README.md > index.html
    $(npm bin)/marked --gfm < docs/faq.md > faq.html
fi

if ! git branch --list | grep --quiet $PUBLISH_BRANCH; then
    git checkout --orphan $PUBLISH_BRANCH
    git rm --cached .gitignore
    git rm --force -r .
    touch .nojekyll
fi

mv typedoc "$DOC_TARGET_DIR"

git add .
git config user.name "$GITHUB_ACTOR"
git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
git commit -m "Publish docs"
# git push $PUSH_ARGS origin $PUBLISH_BRANCH

git checkout -
