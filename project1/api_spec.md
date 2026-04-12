# API Specification

This file contains the endpoints available for the API this project implements

## Businesses

### `GET /businesses?page=[page]`

Returns a paginated list of all business.

Example return:

```json
{
    "pageNumber": 1,
    "totalPages": 10,
    "pageSize": 10,
    "totalCount": 97,
    "businesses": [
        {
            "id": 1
            "name": "Example business 1",
            "address": "123 Main St",
            "city": "Bend",
            "state": "Oregon",
            "zip": "97702",
            "phone": "5555555555",
            "category": "store",
            "subcategory": "clothing",
            "website": "example.com",
            "email": null,
            "links": {
                "reviews": "/businesses/1/reviews",
                "photos": "/businesses/1/photos"
            }
        },
        ...
        {
            "id": 10
            "name": "My cool business",
            "address": "123 Main St",
            "city": "Bend",
            "state": "Oregon",
            "zip": "97702",
            "phone": "5555555555",
            "category": "store",
            "subcategory": "clothing",
            "website": null
            "email": null,
            "links": {
                "reviews": "/businesses/10/reviews",
                "photos": "/businesses/10/photos"
            }
        }
    ],
    "links": {
        "nextPage": "/businesses?page=2",
        "lastPage": "/businesses?page=10"
    }
}
```

### `GET /businesses/:id`

Returns the business with the specified `id`, or an error if no business exists with that id.

Example return:

```json
{
    "id": 10
    "name": "My cool business",
    "address": "123 Main St",
    "city": "Bend",
    "state": "Oregon",
    "zip": "97702",
    "phone": "5555555555",
    "category": "store",
    "subcategory": "clothing",
    "website": null,
    "email": null,
    "links": {
        "reviews": "/businesses/10/reviews",
        "photos": "/businesses/10/photos"
    }
}
```

Or if no business exists with that id:

```json
{
    "message": "No business with id 12 found"
}
```


### `POST /businesses`

Creates a new business. Requires data for all fields except `website` and `email` to be provided.

Example request data:
```json
{
    "name": "My cool business",
    "address": "123 Main St",
    "city": "Bend",
    "state": "Oregon",
    "zip": "97702",
    "phone": "5555555555",
    "category": "store",
    "subcategory": "clothing"
}
```

Example return:
```json
{
    "id": 10,
    "name": "My cool business",
    "address": "123 Main St",
    "city": "Bend",
    "state": "Oregon",
    "zip": "97702",
    "phone": "5555555555",
    "category": "store",
    "subcategory": "clothing",
    "website": null,
    "email": null,
    "links": {
        "reviews": "/businesses/10/reviews",
        "photos": "/businesses/10/photos"
    }
}
```


### `PATCH /businesses/:id`

Updates information about an existing business. Requires the user to be authenticated and to be the owner of the business.

Example request data:
```json
{
    "email": "example@example.com"
}
```

Example return:
```json
{
    "id": 10,
    "name": "My cool business",
    "address": "123 Main St",
    "city": "Bend",
    "state": "Oregon",
    "zip": "97702",
    "phone": "5555555",
    "category": "store",
    "subcategory": "clothing",
    "website": null,
    "email": "example@example.com",
    "links": {
        "reviews": "/businesses/10/reviews",
        "photos": "/businesses/10/photos"
    }
}
```

Example return if the user is not authenticated, or if the user is not the owner of the business:
```json
{
    "message": "User not userized"
}
```


### `DELETE /businesses/:id`

Removes an existing business. Requires the user to be authenticated and to be the owner of the business.

Example return:
```json
{
    "message": "deleted successfully",
    "deleted": {
        "id": 10,
        "name": "My cool business",
        "address": "123 Main St",
        "city": "Bend",
        "state": "Oregon",
        "zip": "97702",
        "phone": "5555555555",
        "category": "store",
        "subcategory": "clothing",
        "website": null,
        "email": null,
        "links": {
            "reviews": "/businesses/10/reviews",
            "photos": "/businesses/10/photos"
        }
    }
}
```


## Reviews

### `GET /businesses/:id/reviews?page=[page]`

Gets a paginated list of reviews for a business.

Example return:
```json
{
    "pageNumber": 1,
    "totalPages": 3,
    "pageSize": 10,
    "totalCount": 24,
    "reviews": [
        {
            "id": 26,
            "business": 10,
            "user": 6,
            "rating": 3,
            "priceRating": 3,
            "comment": "Decent selection of stuff but pretty expensive",
            "links": {
                "business": "/businesses/10"
            }
        },
        ...
        {
            "id": 163,
            "business": 10,
            "user": 45,
            "rating": 4,
            "priceRating": 2,
            "comment": null,
            "links": {
                "business": "/businesses/10"
            }
        }
    ],
    "links": {
        "nextPage": "/businesses/10/reviews?page=2",
        "lastPage": "/businesses/10/reviews?page=3"
    }
}
```

### `GET /reviews?page=[page]`

Gets a paginated list of all reviews the currently authenticated user has created


Example return:
```json
{
    "pageNumber": 1,
    "totalPages": 2,
    "pageSize": 10,
    "totalCount": 12,
    "reviews": [
        {
            "id": 26,
            "business": 10,
            "user": 6,
            "rating": 3,
            "priceRating": 3,
            "comment": "Decent selection of stuff but pretty expensive",
            "links": {
                "business": "/businesses/10"
            }
        },
        ...
        {
            "id": 964,
            "business": 5,
            "user": 6,
            "rating": 5,
            "priceRating": 2,
            "comment": null,
            "links": {
                "business": "/businesses/6"
            }
        }
    ],
    "links": {
        "nextPage": "/reviews?page=2",
        "lastPage": "/reviews?page=2"
    }
}
```


### `POST businesses/:id/reviews`

Creates a new review for a business, from the currently authenticated user. Requires the `rating` and `priceRating` fields, and optionally contains the `comment` field. If the user already has a review for the business, the review will not be created. In this case, the id of the existing review is also returned.

Example request data:
```json
{
    "rating": 3,
    "priceRating": 4
}
```

Example return:
```json
{
    "id": 2934,
    "business": 73,
    "user": 6,
    "rating": 3,
    "priceRating": 4,
    "comment": null,
    "links": {
        "business": "/businesses/73"
    }
}
```

Example return if the user already has a review for the business:
```json
{
    "message": "User already has a review for business [id]",
    "id": 2934
}
```


### `PATCH /reviews/:id`

Updates an exising review. Requires the user to be authenticated and to be the author of the review.

Example request data:
```json
{
    "rating": 4
}
```

Example return:
```json
{
    "id": 2934,
    "business": 73,
    "user": 6,
    "rating": 4,
    "priceRating": 4,
    "comment": null,
    "links": {
        "business": "/businesses/73"
    }
}
```


### `DELETE /reviews/:id`

Removes an exising review. Requires the user to be authenticated and to be the user of the review.

Example return:
```json
{
    "message": "deleted successfully",
    "deleted": {
        "id": 2934,
        "business": 73,
        "user": 6,
        "rating": 4,
        "priceRating": 4,
        "comment": null,
        "links": {
            "business": "/businesses/73"
        }
    }
}
```


## Photos

### `GET /businesses/:id/photos?page=[page]`

Gets a paginated list of photos for a business.

Example return:
```json
{
    "pageNumber": 1,
    "totalPages": 2,
    "pageSize": 10,
    "totalCount": 13,
    "photos": [
        {
            "id": 14,
            "business": 10,
            "user": 14,
            "imageUrl": "/photos/14",
            "caption": null,
            "links": {
                "business": "/businesses/10"
            }
        },
        ...
        {
            "id": 32,
            "business": 10,
            "user": 29,
            "imageUrl": "/photos/32",
            "caption": "Example caption",
            "links": {
                "business": "/businesses/10"
            }
        },
    ],
    "links": {
        "nextPage": "/businesses/33/photos?page=2",
        "lastPage": "/businesses/33/photos?page=2"
    }
}
```


### `GET /photos?page=[page]`

Gets a paginated list of all photos the currently authenticated user has created


Example return:
```json
{
    "pageNumber": 1,
    "totalPages": 1,
    "pageSize": 10,
    "totalCount": 6,
    "reviews": [
        {
            "id": 3,
            "business": 7,
            "user": 85,
            "imageUrl": "/photos/3",
            "caption": null,
            "links": {
                "business": "/businesses/10"
            }
        },
        ...
        {
            "id": 15,
            "business": 51,
            "user": 85,
            "imageUrl": "/photos/15",
            "caption": null,
            "links": {
                "business": "/businesses/10"
            }
        }
    ],
    "links": {
        "nextPage": "/reviews?page=2",
        "lastPage": "/reviews?page=2"
    }
}
```


### `POST /businesses/:id/photos`

Creates a new photo for a business, from the currently authenticated user. Requires content type `multipart/form-data` with an `image` field and optionally a `metadata` field of type `application/json` with the `caption` field.

Example request JSON data:
```json
{
    "caption": "Example caption"
}
```

Example return:
```json
{
    "id": 712,
    "business": 16,
    "user": 85,
    "imageUrl": "/photos/712",
    "caption": "Example caption",
    "links": {
        "business": "/businesses/16"
    }
}
```

### `PATCH /photos/:id`

Updates an exising photo's caption. Requires the user to be authenticated and to be the owner of the photo.

Example request data:
```json
{
    "caption": "New caption"
}
```

Example return:
```json
{
    "id": 712,
    "business": 16,
    "user": 85,
    "imageUrl": "/photos/712",
    "caption": "New caption",
    "links": {
        "business": "/businesses/16"
    }
}
```


### `DELETE /reviews/:id`

Removes an exising review. Requires the user to be authenticated and to be the owner of the photo.

Example return:
```json
{
    "message": "deleted successfully",
    "deleted": {
        "id": 712,
        "business": 16,
        "user": 85,
        "imageUrl": "/photos/712",
        "caption": "Example caption",
        "links": {
            "business": "/businesses/16"
        }
    }
}
```
