#!/bin/sh

HOST=localhost
PORT=8086

BASEURL="http://${HOST}:${PORT}"

GREEN=$(tput setaf 10)
RESET=$(tput sgr0)

status() {
    printf "\n%s╓─────────────────────────────────────────────────────\n" "$GREEN"
    printf "║ %s\n" "$*"
    printf "╙─────────────────────────────────────────────────────\n%s" "$RESET"
}

tempfile=curl.out.$$.tmp

status Creating user

curl -d '{"username": "user1", "password": "pw1"}' \
    -H 'Content-Type: application/json' \
    ${BASEURL}/users

status Logging in fail

curl -d '{"username": "user1", "password": "pwBAD1"}' \
    -H 'Content-Type: application/json' \
    ${BASEURL}/login

status Get messages auth fail

curl ${BASEURL}/messages

status Get single message auth fail

curl ${BASEURL}/messages/3490

status Post message auth fail

curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{"message": "Message fail!"}' \
    ${BASEURL}/messages

status Get messages bad token auth fail

curl -H 'Authorization: Bearer 1234badtoken' ${BASEURL}/messages

status Logging in success

curl -s -d '{"username": "user1", "password": "pw1"}' \
    -H 'Content-Type: application/json' \
    -o "$tempfile"\
    ${BASEURL}/login

cat "$tempfile"
token=$(awk -F'"token":"' '{print $2}' "$tempfile" | awk -F'"' '{print $1}')
rm -f "$tempfile"

auth="Authorization: Bearer $token"
for i in $(seq 5); do
    status Creating message $i...

    curl -s -X POST \
      -H "$auth" \
      -H 'Content-Type: application/json' \
      -d '{"message": "Message '$i'!"}' \
      ${BASEURL}/messages | tee "$tempfile"

    if [ $i -eq 4 ]; then
        # extract ID #4
        id4=$(awk -F'"id":"' '{print $2}' "$tempfile" | awk -F'"' '{print $1}')
    fi

    rm -f "$tempfile"
done

status Getting message id $id4
curl -X GET -H "$auth" ${BASEURL}/messages/$id4

status Deleting message id $id4
curl -X DELETE -H "$auth" ${BASEURL}/messages/$id4

status Deleting message id $id4 again
curl -X DELETE -H "$auth" ${BASEURL}/messages/$id4

status Getting message id $id4 again
curl -X GET -H "$auth" ${BASEURL}/messages/$id4

status Getting all messages
curl -X GET -H "$auth" ${BASEURL}/messages
