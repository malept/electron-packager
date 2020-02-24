#!/bin/bash -e

if test -z "$PUBLISH_BRANCH"; then
    PUBLISH_BRANCH=gh-pages
fi

npm run typedoc

if ! git branch --list | grep --quiet $PUBLISH_BRANCH; then
    git checkout --orphan $PUBLISH_BRANCH
    git rm --force -r '!typedoc'
    echo typedoc > .gitignore
    touch .nojekyll
fi

mv typedoc/* .

git add .
git config user.name "$GITHUB_ACTOR"
git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
git commit -m "Publish docs"
# git push $PUSH_ARGS origin $PUBLISH_BRANCH

git checkout -
