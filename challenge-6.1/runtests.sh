#!/bin/sh

HOST=localhost
PORT=8086

BASEURL="http://${HOST}:${PORT}"

GREEN=$(tput setaf 10)
RESET=$(tput sgr0)

status() {
    printf "\n%s+=====================================================\n" "$GREEN"
    printf "| %s\n" "$*"
    printf "+=====================================================\n%s" "$RESET"
}

status Creating user

curl -d '{"username": "user1", "password": "pw1"}' \
    -H 'Content-Type: application/json' \
    ${BASEURL}/users

status Logging in fail

curl -d '{"username": "user1", "password": "pwBAD1"}' \
    -H 'Content-Type: application/json' \
    ${BASEURL}/login

status Logging in success

curl -s -d '{"username": "user1", "password": "pw1"}' \
    -H 'Content-Type: application/json' \
    ${BASEURL}/login

for i in $(seq 5); do
    status Creating message...

    curl -s -X POST \
      -H 'Content-Type: application/json' \
      -d '{"message": "Message '$i'!"}' \
      ${BASEURL}/messages | tee curl.tmp.out

    if [ $i -eq 4 ]; then
        # extract ID #4
        id4=$(awk -F: '{print $2}' curl.tmp.out | awk -F, '{print $1}' | tr -d '"')
    fi

    rm -f curl.tmp.out
done

status Getting message id $id4
curl -X GET ${BASEURL}/messages/$id4

status Deleting message id $id4
curl -X DELETE ${BASEURL}/messages/$id4

status Deleting message id $id4 again
curl -X DELETE ${BASEURL}/messages/$id4

status Getting message id $id4 again
curl -X GET ${BASEURL}/messages/$id4

status Getting all messages
curl -X GET ${BASEURL}/messages
