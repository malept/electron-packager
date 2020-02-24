#!/bin/bash -xe

GIT_REVISION="$1"

if test -z "$PUBLISH_BRANCH"; then
    PUBLISH_BRANCH=gh-pages
fi

if test -z "$GIT_REVISION"; then
    TYPEDOC_ARGS="-- --gitRevision $GIT_REVISION"
    # TODO: if git revision looks like a version, set --includeVersion
fi

npm run typedoc $TYPEDOC_ARGS

if ! git branch --list | grep --quiet $PUBLISH_BRANCH; then
    git checkout --orphan $PUBLISH_BRANCH
    git rm --cached .gitignore
    git rm --force -r .
    touch .nojekyll
fi

mv typedoc/* .

git add .
git config user.name "$GITHUB_ACTOR"
git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
git commit -m "Publish docs"
# git push $PUSH_ARGS origin $PUBLISH_BRANCH

git checkout -
