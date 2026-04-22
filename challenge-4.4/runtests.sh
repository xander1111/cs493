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

for i in $(seq 5); do
    status Creating message...

    curl -X POST \
      -H 'Content-Type: application/json' \
      -d '{"message": "Message '$i'!"}' \
      ${BASEURL}/messages
done

status Getting message id 4
curl -X GET ${BASEURL}/messages/4

status Deleting message id 4
curl -X DELETE ${BASEURL}/messages/4

status Deleting message id 4 again
curl -X DELETE ${BASEURL}/messages/4

status Getting message id 4 again
curl -X GET ${BASEURL}/messages/4

status Getting all messages
curl -X GET ${BASEURL}/messages
