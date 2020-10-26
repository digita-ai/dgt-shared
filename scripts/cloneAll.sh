#!/bin/bash
LOCAL_PATH="/Users/sander/digita"
declare -a arr=("git@github.com:digita-ai/dgt-shared.git" "git@github.com:digita-ai/dgt-platform-api.git" "git@github.com:digita-ai/dgt-browser.git" "git@github.com:digita-ai/dgt-platform-web.git" "git@github.com:digita-ai/dgt-platform-public.git" "git@github.com:digita-ai/dgt-docs.git" "git@github.com:digita-ai/dgt-platform-blazegraph.git")
USERNAME="John Doe"
EMAIL="john@digita.ai"

# git config --global user.name $USERNAME
# git config --global user.email $EMAIL


if [[ ! -e $LOCAL_PATH ]]; then
    mkdir -p $LOCAL_PATH
elif [[ ! -d $LOCAL_PATH ]]; then
    echo "$LOCAL_PATH already exists but is not a directory" 1>&2
fi
cd $LOCAL_PATH

for i in "${arr[@]}"
do
        echo git clone $i
   git clone $i
done

