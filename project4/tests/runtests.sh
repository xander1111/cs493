#!/bin/sh

. ./curltest.sh

require_jq    # These tests assume jq is installed

#dotenv    # load .env

PORT=${PORT:-8000}  # Use port 8000 unless PORT env var specified

default_content_type="application/json"
default_base_url="http://localhost:$PORT"

#default_verbose=1


#########################################################################

status "Setting up test user"

request "/users" \
    -l "Creating test user" \
    -p '{"name":"Test User","email":"testuser@example.com","password":"password"}' \
    --expect-code 200 

userid=$(extract_field id)
info "Created user $userid"

request "/users/$userid" \
    -l "Logging in test user" \
    -m "POST" \
    -p '{"email":"testuser@example.com","password":"password"}' \
    --expect-code 200 

token=$(extract_field token)
info "Got token $token"

request "/users" \
    -l "Creating secondary test user" \
    -p '{"name":"Test User 2","email":"testuser2@example.com","password":"password2"}' \
    --expect-code 200 

userid_b=$(extract_field id)
info "Created user $userid_b"

request "/users/$userid_b" \
    -l "Logging in secondary test user" \
    -m "POST" \
    -p '{"email":"testuser2@example.com","password":"password2"}' \
    --expect-code 200 

token_b=$(extract_field token)
info "Got token $token_b"

#########################################################################
status "Testing user creation and info"

request "/users" \
    -l "Creating user with a username already in use" \
    -p '{"name":"Test User","email":"unused@example.com","password":"password"}' \
    --expect-code 409

request "/users" \
    -l "Creating user with an email already in use" \
    -p '{"name":"Test User 3","email":"testuser@example.com","password":"password"}' \
    --expect-code 409

request "/users/$userid" \
    -l "Logging in with invalid details" \
    -m "POST" \
    -p '{"email":"testuser@example.com","password":"incorrect"}' \
    --expect-code 401

request "/users/1" \
    -l "Logging in with invalid user id" \
    -m "POST" \
    -p '{"email":"testuser@example.com","password":"password"}' \
    --expect-code 400

request "/users/000000000000000000000000" \
    -l "Logging in to non-existent user" \
    -m "POST" \
    -p '{"email":"testuser@example.com","password":"password"}' \
    --expect-code 401


request "/users/$userid" \
    -l "Getting user information" \
    -a "$token" \
    --expect-code 200

request "/users/$userid" \
    -l "Getting user information without authorization" \
    --expect-code 401

request "/users/$userid" \
    -l "Getting user information from unauthorized user" \
    -a "$token_b" \
    --expect-code 401

request "/users/1" \
    -l "Getting user information for invalid user id" \
    -a "$token_b" \
    --expect-code 400


#########################################################################
status "Testing Businesses"

request "/businesses" \
    -l "Searching for all businessess" \
    --expect-code 200 \


request "/businesses" \
    -l "Posting a new business without authentication" \
    -p '{"ownerid":"'$userid'","name":"New business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    --expect-code 401 \

request "/businesses" \
    -l "Posting a new business with invalid owner id" \
    -p '{"ownerid":"1","name":"New business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 400 \

request "/businesses" \
    -l "Posting a new business with different owner id" \
    -p '{"ownerid":"aaaaaaaaaaaaaaaaaaaaaaa0","name":"New business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 400 \

request "/businesses" \
    -l "Posting a new business" \
    -p '{"ownerid":"'$userid'","name":"New business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 201 \

id=$(extract_field id)
info "Got ID $id"


request "/businesses/$id" \
    -l "Getting business $id" \
    --expect-code 200 \

request "/businesses/999" \
    -l "Searching for invalid business id" \
    --expect-code 400 \

request "/businesses/000000000000000000000000" \
    -l "Searching for non-existent business" \
    --expect-code 404 \


request "/businesses/$id" \
    -l "Updating business $id name without authentication" \
    -m "PUT" \
    -p '{"ownerid":"'$id'","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    --expect-code 401 \

request "/businesses/1" \
    -l "Updating business with invalid id" \
    -m "PUT" \
    -p '{"ownerid":"'$id'","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 400 \

request "/businesses/$id" \
    -l "Updating business $id name with invalid ownerid" \
    -m "PUT" \
    -p '{"ownerid":"'$id'","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 400 \

request "/businesses/$id" \
    -l "Updating business $id name with different ownerid" \
    -m "PUT" \
    -p '{"ownerid":"aaaaaaaaaaaaaaaaaaaaaaa0","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 400 \

request "/businesses/$id" \
    -l "Updating business $id name from unauthorized user" \
    -m "PUT" \
    -p '{"ownerid":"'$id'","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token_b" \
    --expect-code 401 \

request "/businesses/000000000000000000000000" \
    -l "Updating non-existent business" \
    -m "PUT" \
    -p '{"ownerid":"'$userid'","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 404 \

request "/businesses/$id" \
    -l "Updating business $id name" \
    -m "PUT" \
    -p '{"ownerid":"'$userid'","name":"Renamed business 1","address":"123 Sample Ave.","city":"Sample City","state":"OR","zip":"97333","phone":"541-758-9999","category":"Restaurant","subcategory":"Brewpub","website":"http://example.com/1"}' \
    -a "$token" \
    --expect-code 200 \


request "/businesses/$id" \
    -l "Deleting business $id without authentication" \
    -m "DELETE" \
    --expect-code 401

request "/businesses/1" \
    -l "Deleting business with invalid id" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 400

request "/businesses/$id" \
    -l "Deleting business $id from unauthorized user" \
    -m "DELETE" \
    -a "$token_b" \
    --expect-code 401

request "/businesses/000000000000000000000000" \
    -l "Deleting non-existent business" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 404

request "/businesses/$id" \
    -l "Deleting business $id" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 204

request "/businesses/$id" \
    -l "Verifying business $id deleted" \
    --expect-code 404 \

#########################################################################
status "Testing Photos"

photo_upload_file="test_images/test.png"

if [ ! -f "$photo_upload_file" ]; then
    warning "Required upload fixture missing: $photo_upload_file"
    exit 1
fi

request "/photos" \
    -l "Posting a new photo without authentication" \
    -f "$photo_upload_file" \
    -F "userid=$userid" \
    -F "businessid=bbbbbbbbbbbbbbbbbbbbbbbb" \
    -F "caption=Test caption" \
    --expect-code 401 \

request "/photos" \
    -l "Posting a new photo with invalid businessid" \
    -f "$photo_upload_file" \
    -F "userid=$userid" \
    -F "businessid=1" \
    -F "caption=Test caption" \
    -a "$token" \
    --expect-code 400 \

request "/photos" \
    -l "Posting a new photo with invalid userid" \
    -f "$photo_upload_file" \
    -F "userid=1" \
    -F "businessid=1" \
    -F "caption=Test caption" \
    -a "$token" \
    --expect-code 400 \

request "/photos" \
    -l "Posting a new photo with different userid" \
    -f "$photo_upload_file" \
    -F "userid=aaaaaaaaaaaaaaaaaaaaaaa0" \
    -F "businessid=bbbbbbbbbbbbbbbbbbbbbbbb" \
    -F "caption=Test caption" \
    -a "$token" \
    --expect-code 400 \

request "/photos" \
    -l "Posting a new photo" \
    -f "$photo_upload_file" \
    -F "userid=$userid" \
    -F "businessid=bbbbbbbbbbbbbbbbbbbbbbbb" \
    -F "caption=Test caption" \
    -a "$token" \
    --expect-code 201 \

photoid=$(extract_field id)
info "Got ID $photoid"


request "/media/photos/$photoid" \
    -l "Verifying photo $photoid exists" \
    --expect-code 200 \


status "Waiting for thumbnail to generate"

sleep 5


request "/media/thumbs/$photoid" \
    -l "Verifying thumb $photoid exists" \
    --expect-code 200 \


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
    -l "Updating photo $photoid caption without authentication" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    --expect-code 401 \

request "/photos/1" \
    -l "Updating photo with invalid id" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa0","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 400 \

request "/photos/$photoid" \
    -l "Updating photo $photoid from unauthorized user" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    -a "$token_b" \
    --expect-code 401 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption with different userid" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa0","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 400 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption with different businessid" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"000000000000000000000000","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 400 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption with invalid userid" \
    -m "PUT" \
    -p '{"userid":"1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 400 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption with invalid businessid" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"1","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 400 \

request "/photos/000000000000000000000000" \
    -l "Updating non-existent photo" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"1","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 404 \

request "/photos/$photoid" \
    -l "Updating photo $photoid caption" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","caption":"UPDATED Test caption"}' \
    -a "$token" \
    --expect-code 200 \


request "/photos/$photoid" \
    -l "Deleting photo $photoid without authentication" \
    -m "DELETE" \
    --expect-code 401

request "/photos/1" \
    -l "Deleting photo with invalid id" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 400

request "/photos/$photoid" \
    -l "Deleting photo $photoid from unauthorized user" \
    -m "DELETE" \
    -a "$token_b" \
    --expect-code 401

request "/photos/000000000000000000000000" \
    -l "Deleting nonexistent photo" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 404

request "/photos/$photoid" \
    -l "Deleting photo $photoid" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 204

request "/photos/$photoid" \
    -l "Verifying photo $photoid deleted" \
    --expect-code 404 \

request "/media/photos/$photoid" \
    -l "Verifying photo $photoid deleted" \
    --expect-code 404 \

request "/media/thumbs/$photoid" \
    -l "Verifying thumb $photoid deleted" \
    --expect-code 404 \

#########################################################################
status "Testing Reviews"

request "/reviews" \
    -l "Posting a new review without authentication" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":1,"stars":5,"review":"Test review"}' \
    --expect-code 401 \

request "/reviews" \
    -l "Posting a new review with an invalid businessid" \
    -p '{"userid":"'$userid'","businessid":"1","dollars":1,"stars":5,"review":"Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews" \
    -l "Posting a new review with an invalid userid" \
    -p '{"userid":"1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":1,"stars":5,"review":"Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews" \
    -l "Posting a new review with different userid" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa0","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":1,"stars":5,"review":"Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews" \
    -l "Posting a new review" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":1,"stars":5,"review":"Test review"}' \
    -a "$token" \
    --expect-code 201 \

reviewid=$(extract_field id)
info "Got ID $reviewid"

request "/reviews" \
    -l "Posting a new review to already reviewed business" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":1,"stars":5,"review":"Test review"}' \
    -a "$token" \
    --expect-code 403 \


request "/reviews/999" \
    -l "Searching for invalid review id" \
    --expect-code 400 \

request "/reviews/000000000000000000000000" \
    -l "Searching for non-existent review" \
    --expect-code 404 \

request "/reviews/$reviewid" \
    -l "Getting review $reviewid" \
    --expect-code 200 \


request "/reviews/1" \
    -l "Updating review with invalid review id" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid without authentication" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    --expect-code 401 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid from unauthorized user" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token_b" \
    --expect-code 401 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid with different userid" \
    -m "PUT" \
    -p '{"userid":"aaaaaaaaaaaaaaaaaaaaaaa0","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid with different businessid" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"000000000000000000000000","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid with invalid userid" \
    -m "PUT" \
    -p '{"userid":"1","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid with invalid businessid" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"1","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 400 \

request "/reviews/000000000000000000000000" \
    -l "Updating non-existent review" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 404 \

request "/reviews/$reviewid" \
    -l "Updating review $reviewid" \
    -m "PUT" \
    -p '{"userid":"'$userid'","businessid":"bbbbbbbbbbbbbbbbbbbbbbbb","dollars":4,"stars":3,"review":"UPDATED Test review"}' \
    -a "$token" \
    --expect-code 200 \


request "/reviews/$reviewid" \
    -l "Deleting review $reviewid without authentication" \
    -m "DELETE" \
    --expect-code 401

request "/reviews/1" \
    -l "Deleting review with invalid id" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 400

request "/reviews/$reviewid" \
    -l "Deleting review $reviewid from unauthorized user" \
    -m "DELETE" \
    -a "$token_b" \
    --expect-code 401

request "/reviews/000000000000000000000000" \
    -l "Deleting non-existent review" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 404

request "/reviews/$reviewid" \
    -l "Deleting review $reviewid" \
    -m "DELETE" \
    -a "$token" \
    --expect-code 204

request "/reviews/$reviewid" \
    -l "Verifying review $reviewid deleted" \
    --expect-code 404 \



#########################################################################
status "Testing user owned items"

request "/users/$userid/businesses" \
    -l "Searching for businesses under specific user without authentication" \
    --expect-code 401 \
    
request "/users/$userid/businesses" \
    -l "Searching for businesses under specific user from unauthorized user" \
    -a "$token_b" \
    --expect-code 401 \

request "/users/999/businesses" \
    -l "Searching for businesses under invalid user id" \
    -a "$token" \
    --expect-code 400 \

request "/users/$userid/businesses" \
    -l "Searching for businesses under specific user" \
    -a "$token" \
    --expect-code 200 \


request "/users/$userid/photos" \
    -l "Searching for photos under specific user without authentication" \
    --expect-code 401 \

request "/users/$userid/photos" \
    -l "Searching for photos under specific user from unauthorized user" \
    -a "$token_b" \
    --expect-code 401 \

request "/users/999/photos" \
    -l "Searching for photos under invalid user id" \
    -a "$token" \
    --expect-code 400 \

request "/users/$userid/photos" \
    -l "Searching for photos under specific user" \
    -a "$token" \
    --expect-code 200 \


request "/users/$userid/reviews" \
    -l "Searching for reviews under specific user without authentication" \
    --expect-code 401 \

request "/users/$userid/reviews" \
    -l "Searching for reviews under specific user from unauthorized user" \
    -a "$token_b" \
    --expect-code 401 \

request "/users/999/reviews" \
    -l "Searching for reviews under invalid user id" \
    -a "$token" \
    --expect-code 400 \

request "/users/$userid/reviews" \
    -l "Searching for reviews under specific user" \
    -a "$token" \
    --expect-code 200 \

#########################################################################
status "Testing media items"

request "/media/photos/123" \
    -l "Searching for media/photo with invalid id" \
    --expect-code 400 \

request "/media/thumbs/123" \
    -l "Searching for media/thumb with invalid id" \
    --expect-code 400 \


request "/media/photos/000000000000000000000000" \
    -l "Searching for non-existant media/photo" \
    --expect-code 404 \

request "/media/thumbs/000000000000000000000000" \
    -l "Searching for non-existant media/thumb" \
    --expect-code 404 \

summary

