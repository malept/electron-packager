#!/bin/bash -xe

if test -n "$1"; then
    GIT_REVISION="$1"
elif test -n "$GITHUB_REF"; then
    GIT_REVISION="$(echo $GITHUB_REF | sed -e 's:refs/\(head\|tag\)s/::g')"
fi

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

git fetch origin
if ! git branch --list --remote | grep --quiet $PUBLISH_BRANCH; then
    git checkout --orphan $PUBLISH_BRANCH
    git rm --cached .gitignore
    git rm --force -r .
    touch .nojekyll
else
    git checkout $PUBLISH_BRANCH
    if test -d "$DOC_TARGET_DIR"; then
        rm -r "$DOC_TARGET_DIR"
    fi
fi

mv typedoc "$DOC_TARGET_DIR"

mkdir ~/.ssh
echo "$DOCS_SSH_DEPLOY_KEY" > ~/.ssh/deploy_key
chmod 400 ~/.ssh/deploy_key

git remote rm origin
git remote add origin "git@github.com:$GITHUB_REPOSITORY.git"

git add .
git config user.name "$GITHUB_ACTOR"
git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
git commit -m "Publish docs"
GIT_SSH_COMMAND="ssh -i ~/.ssh/deploy_key" git push origin $PUBLISH_BRANCH
