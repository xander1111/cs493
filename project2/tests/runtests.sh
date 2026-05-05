#!/bin/sh

. ./curltest.sh

require_jq    # These tests assume jq is installed

#dotenv    # load .env

PORT=${PORT:-8000}  # Use port 8000 unless PORT env var specified

default_content_type="application/json"
default_base_url="http://localhost:$PORT"

#default_verbose=1

#########################################################################
status "Testing Businesses"

request "/businesses" \
    -l "Searching for all businessess" \
    --expect-code 200 \

request "/businesses/999" \
    -l "Searching for invalid business id" \
    --expect-code 400 \

request "/businesses/000000000000000000000000" \
    -l "Searching for non-existent business" \
    --expect-code 404 \

request "/businesses" \
    -l "Posting a new business" \
    -p '{"ownerid":"aaaaaaaaaaaaaaaaaaaaaaa0","name":"New business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    --expect-code 201 \

id=$(extract_field id)
info "Got ID $id"

request "/businesses/$id" \
    -l "Getting business $id" \
    --expect-code 200 \

request "/businesses/$id" \
    -l "Updating business $id name with invalid ownerid" \
    -m "PUT" \
    -p '{"ownerid":"1","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    --expect-code 400 \

request "/businesses/$id" \
    -l "Updating business $id name" \
    -m "PUT" \
    -p '{"ownerid":"aaaaaaaaaaaaaaaaaaaaaaa0","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    --expect-code 200 \

request "/businesses/$id" \
    -l "Deleting business $id" \
    -m "DELETE" \
    --expect-code 204

request "/businesses/$id" \
    -l "Verifying business $id deleted" \
    --expect-code 404 \

#########################################################################
status "Testing Photos"

request "/photos" \
    -l "Posting a new photo" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"Test caption"}' \
    --expect-code 201 \

photoid=$(extract_field id)
info "Got ID $photoid"

request "/photos/999" \
    -l "Searching for invalid photo id" \
    --expect-code 400 \

request "/photos/000000000000000000000000" \
    -l "Searching for non-existent photos" \
    --expect-code 404 \

request "/photos/$photoid" \
    -l "Getting photo $photoid" \
    --expect-code 200 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption with invalid userid" \
    -m "PUT" \
    -p '{"userid":"1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    --expect-code 400 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption with invalid businessid" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa1","businessid":"1","caption":"UPDATED Test caption"}' \
    --expect-code 400 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    --expect-code 200 \

request "/photos/$photoid" \
    -l "Deleting photo $photoid" \
    -m "DELETE" \
    --expect-code 204

request "/photos/$photoid" \
    -l "Verifying photo $photoid deleted" \
    --expect-code 404 \

#########################################################################
status "Testing Reviews"

request "/reviews" \
    -l "Posting a new review" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa2","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":1,"stars":5,"review":"Test review"}' \
    --expect-code 201 \

reviewid=$(extract_field id)
info "Got ID $reviewid"

request "/reviews/999" \
    -l "Searching for invalid review id" \
    --expect-code 400 \

request "/reviews/000000000000000000000000" \
    -l "Searching for non-existent reviews" \
    --expect-code 404 \

request "/reviews/$reviewid" \
    -l "Getting review $reviewid" \
    --expect-code 200 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid with invalid userid" \
    -m "PUT" \
    -p '{"userid":"1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    --expect-code 400 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid with invalid businessid" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa2","businessid":"1","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    --expect-code 400 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa2","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    --expect-code 200 \

request "/reviews/$reviewid" \
    -l "Deleting review $reviewid" \
    -m "DELETE" \
    --expect-code 204

request "/reviews/$reviewid" \
    -l "Verifying review $reviewid deleted" \
    --expect-code 404 \



#########################################################################
status "Testing Users"

request "/users/999/businesses" \
    -l "Searching for businesses under invalid user id" \
    --expect-code 400 \

request "/users/999/photos" \
    -l "Searching for photos under invalid user id" \
    --expect-code 400 \

request "/users/999/reviews" \
    -l "Searching for reviews under invalid user id" \
    --expect-code 400 \


request "/users/aaaaaaaaaaaaaaaaaaaaaaa0/businesses" \
    -l "Searching for businesses under specific user" \
    --expect-code 200 \

request "/users/aaaaaaaaaaaaaaaaaaaaaaa1/photos" \
    -l "Searching for photos under specific user" \
    --expect-code 200 \

request "/users/aaaaaaaaaaaaaaaaaaaaaaa2/reviews" \
    -l "Searching for reviews under specific user" \
    --expect-code 200 \

summary
