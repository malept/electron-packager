#!/bin/bash -xe

GIT_REVISION="$1"

if test -z "$PUBLISH_BRANCH"; then
    PUBLISH_BRANCH=gh-pages
fi

# TODO move typedoc args + .typedoc.json into its own typedoc script
if test -z "$GIT_REVISION"; then
    TYPEDOC_ARGS="-- --gitRevision $GIT_REVISION"
    if test "${GIT_REVISION:0:1}" == "v"; then
        TYPEDOC_ARGS="$TYPEDOC_ARGS --includeVersion"
    fi
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
