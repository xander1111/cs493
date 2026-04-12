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
    '{"pageNumber":"'$lastPage'","totalPages":".*","pageSize":".*","totalCount":".*","businesses":".*","links":{"lastPage":".*"}}'


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
    '{    
        "message": "successfully created",
        "business": {
            "id": ".*",
            "name": "My cool business",
            "address": "123 Main St",
            "city": "Bend",
            "state": "Oregon",
            "zip": "97702",
            "phone": "5555555555",
            "category": "store",
            "subcategory": "clothing",
            "website": ".*",
            "email": ".*",
            "links": {
                "reviews": ".*",
                "photos": ".*"
            }
        },
        "link": ".*"
    }'


request_json \
    "PATCH /businesses/:id" \
    PATCH \
    'http://localhost:8086/businesses/5' \
    '{
        "email": "exampleUpdatedEmail@example.com"
    }' \
    200 \
    '{    
        "message": "successfully updated",
        "business": {
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
            "links": {
                "reviews": ".*",
                "photos": ".*"
            }
        },
        "link": ".*"
    }'


request_json \
    "DELETE /businesses/:id" \
    DELETE \
    'http://localhost:8086/businesses/5' \
    '' \
    200 \
    '{
        "message": "deleted successfully",
        "deleted": {
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
            "email": ".*",
            "links": ".*"
        }
    }'



# Reviews endpoints
request_json \
    "TEST" \
    GET \
    'http://localhost:8086/businesses/1/reviews' \
    '' \
    200 \
    '".*"'


request_json \
    "'GET /businesses/:id/reviews' returns page 1" \
    GET \
    'http://localhost:8086/businesses/1/reviews' \
    '' \
    200 \
    '{"pageNumber":"1","totalPages":".*","pageSize":".*","totalCount":".*","reviews":".*","links":".*"}'

lastPage=$(extract_field 'totalPages')

request_json \
    "'GET /businesses/:id/reviews?page=[lastPage]' doesn't include a nextPage field in links" \
    GET \
    'http://localhost:8086/businesses/1/reviews?page='$lastPage'' \
    '' \
    200 \
    '{"pageNumber":"'$lastPage'","totalPages":".*","pageSize":".*","totalCount":".*","reviews":".*","links":{"lastPage":".*"}}'


request_json \
    "'GET /reviews' returns page 1" \
    GET \
    'http://localhost:8086/reviews' \
    '' \
    200 \
    '{"pageNumber":"1","totalPages":".*","pageSize":".*","totalCount":".*","reviews":".*","links":".*"}'

lastPage=$(extract_field 'totalPages')

request_json \
    "'GET /reviews?page=[lastPage]' doesn't include a nextPage field in links" \
    GET \
    'http://localhost:8086/reviews?page='$lastPage'' \
    '' \
    200 \
    '{"pageNumber":"'$lastPage'","totalPages":".*","pageSize":".*","totalCount":".*","reviews":".*","links":{"lastPage":".*"}}'


request_json \
    "GET /reviews/:id" \
    GET \
    'http://localhost:8086/reviews/5' \
    '' \
    200 \
    '{
        "id": "5",
        "business": ".*",
        "user": ".*",
        "rating": ".*",
        "priceRating": ".*",
        "comment": ".*",
        "links": {
            "business": ".*"
        }
    }'


request_json \
    "POST /businesses/:id/reviews" \
    POST \
    'http://localhost:8086/businesses/1/reviews' \
    '{
        "rating": 3,
        "priceRating": 4
    }' \
    201 \
    '{    
        "message": "successfully created",
        "review": {
            "id": ".*",
            "business": "1",
            "user": ".*",
            "rating": "3",
            "priceRating": "4",
            "comment": ".*",
            "links": {
                "business": ".*"
            }
        },
        "link": ".*"
    }'


request_json \
    "PATCH /reviews/:id" \
    PATCH \
    'http://localhost:8086/reviews/5' \
    '{
        "rating": "4"
    }' \
    200 \
    '{    
        "message": "successfully updated",
        "review": {
            "id": "5",
            "business": ".*",
            "user": ".*",
            "rating": "4",
            "priceRating": ".*",
            "comment": ".*",
            "links": {
                "business": ".*"
            }
        },
        "link": ".*"
    }'


request_json \
    "DELETE /reviews/:id" \
    DELETE \
    'http://localhost:8086/reviews/5' \
    '' \
    200 \
    '{
        "message": "deleted successfully",
        "deleted": {
            "id": "5",
            "business": ".*",
            "user": ".*",
            "rating": ".*",
            "priceRating": ".*",
            "comment": ".*",
            "links": ".*"
        }
    }'



# Photos endpoints
request_json \
    "'GET /businesses/:id/photos' returns page 1" \
    GET \
    'http://localhost:8086/businesses/1/photos' \
    '' \
    200 \
    '{"pageNumber":"1","totalPages":".*","pageSize":".*","totalCount":".*","photos":".*","links":".*"}'

lastPage=$(extract_field 'totalPages')

request_json \
    "'GET /businesses/:id/photos?page=[lastPage]' doesn't include a nextPage field in links" \
    GET \
    'http://localhost:8086/businesses/1/photos?page='$lastPage'' \
    '' \
    200 \
    '{"pageNumber":"'$lastPage'","totalPages":".*","pageSize":".*","totalCount":".*","photos":".*","links":{"lastPage":".*"}}'


request_json \
    "'GET /photos' returns page 1" \
    GET \
    'http://localhost:8086/photos' \
    '' \
    200 \
    '{"pageNumber":"1","totalPages":".*","pageSize":".*","totalCount":".*","photos":".*","links":".*"}'

lastPage=$(extract_field 'totalPages')

request_json \
    "'GET /photos?page=[lastPage]' doesn't include a nextPage field in links" \
    GET \
    'http://localhost:8086/photos?page='$lastPage'' \
    '' \
    200 \
    '{"pageNumber":"'$lastPage'","totalPages":".*","pageSize":".*","totalCount":".*","photos":".*","links":{"lastPage":".*"}}'


request_json \
    "GET /photos/:id" \
    GET \
    'http://localhost:8086/photos/3' \
    '' \
    200 \
    '{
        "id": "3",
        "business": ".*",
        "user": ".*",
        "imageUrl": ".*",
        "caption": ".*",
        "links": {
            "business": ".*"
        }
    }'


request_json \
    "POST /businesses/:id/photos" \
    POST \
    'http://localhost:8086/businesses/1/photos' \
    '{
        "caption": "Example caption"
    }' \
    201 \
    '{    
        "message": "successfully created",
        "photo": {
            "id": ".*",
            "business": "1",
            "user": ".*",
            "imageUrl": ".*",
            "caption": "Example caption",
            "links": {
                "business": ".*"
            }
        },
        "link": ".*"
    }'


request_json \
    "PATCH /photos/:id" \
    PATCH \
    'http://localhost:8086/photos/3' \
    '{
        "caption": "New caption"
    }' \
    200 \
    '{    
        "message": "successfully updated",
        "photo": {
            "id": "3",
            "business": ".*",
            "user": ".*",
            "imageUrl": ".*",
            "caption": "New caption",
            "links": {
                "business": ".*"
            }
        },
        "link": ".*"
    }'


request_json \
    "DELETE /photos/:id" \
    DELETE \
    'http://localhost:8086/photos/3' \
    '' \
    200 \
    '{
        "message": "deleted successfully",
        "deleted": {
            "id": "3",
            "business": ".*",
            "user": ".*",
            "imageUrl": ".*",
            "caption": ".*",
            "links": ".*"
        }
    }'
