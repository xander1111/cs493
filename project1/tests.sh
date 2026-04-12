#!/bin/sh

. ../curltest.sh


# Businesses endpoints
request_json \
    "'GET /businesses' returns page 1" \
    GET \
    'http://localhost:8086/businesses' \
    '' \
    200 \
    '{"pageNumber":"1","totalPages":".*","pageSize":".*","totalCount":".*","businesses":".*","links":".*"}'

lastPage=$(extract_field 'totalPages')

request_json \
    "'GET /businesses?page=[lastPage]' doesn't include a nextPage field in links" \
    GET \
    'http://localhost:8086/businesses?page='$lastPage'' \
    '' \
    200 \
    '{"pageNumber":"2","totalPages":".*","pageSize":".*","totalCount":".*","businesses":".*","links":{"lastPage":".*"}}'


request_json \
    "GET /businesses/:id" \
    GET \
    'http://localhost:8086/businesses/6' \
    '' \
    200 \
    '{
        "id":"6",
        "name":".*",
        "address":".*",
        "city":".*",
        "state":".*",
        "zip":".*",
        "phone":".*",
        "category":".*",
        "subcategory":".*",
        "website":".*",
        "email":".*",
        "links":{"reviews":"/businesses/6/reviews","photos":"/businesses/6/photos"}
    }'

request_json \
    "POST /businesses" \
    POST \
    'http://localhost:8086/businesses' \
    '{
        "name": "My cool business",
        "address": "123 Main St",
        "city": "Bend",
        "state": "Oregon",
        "zip": "97702",
        "phone": "5555555555",
        "category": "store",
        "subcategory": "clothing"
    }' \
    201 \
    '{"id":".*",
        "name": "My cool business",
        "address": "123 Main St",
        "city": "Bend",
        "state": "Oregon",
        "zip": "97702",
        "phone": "5555555555",
        "category": "store",
        "subcategory": "clothing",
    "website":".*","email":".*","links":{"reviews":".*","photos":".*"}}'



request_json \
    "PATCH /businesses/:id" \
    PATCH \
    'http://localhost:8086/businesses/5' \
    '{
        "email": "exampleUpdatedEmail@example.com"
    }' \
    200 \
    '{
        "id": "5",
        "name": ".*",
        "address": ".*",
        "city": ".*",
        "state": ".*",
        "zip": ".*",
        "phone": ".*",
        "category": ".*",
        "subcategory": ".*",
        "website": ".*",
        "email": "exampleUpdatedEmail@example.com",
        "links": ".*"
    }'

