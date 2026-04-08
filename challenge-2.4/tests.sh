#!/bin/sh

. ../curltest.sh


request_json \
    "Test messages start empty" \
    GET \
    'http://localhost:8086/messages/' \
    '' \
    200 \
    '[]'


request_json \
    "Can POST new message" \
    POST \
    'http://localhost:8086/messages/' \
    '{"message": "Test message number 1"}' \
    201 \
    '{"id":".*","links": {"self":"/messages/.*"}}'

id=$(extract_field 'id')


request_json \
    "Newly POSTed message can be found by id" \
    GET \
    'http://localhost:8086/messages/'$id'' \
    '' \
    200 \
    '{"id":"'$id'","message": "Test message number 1"}'


request_json \
    "Message can be deleted by id" \
    DELETE \
    'http://localhost:8086/messages/'$id'' \
    '' \
    200 \
    '{"message":"Deleted successfully","deleted": {"id":"'$id'","message":"Test message number 1"}}'


request_json \
    "Message can't be deleted multiple times" \
    DELETE \
    'http://localhost:8086/messages/'$id'' \
    '' \
    404 \
    '{"error": "Message '${id}' not found"}'

request_json \
    "Message can't be found after it's deleted" \
    GET \
    'http://localhost:8086/messages/'$id'' \
    '' \
    404 \
    '{"error": "Message '${id}' not found"}'