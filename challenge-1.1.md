## Add a new sighting

```
POST /sightings
{
    date: "2012-01-01",
    status: "suspected"
}
```

Return example:
```json
{
    id: 4,
    date: "2012-01-01",
    status: "suspected"
}
```



## List sightings

`GET /sightings`

Return example:
```json
[
    {
        id: 1,
        date: "2000-01-01",
        status: "suspected"
    },
    {
        1d: 2,
        date: "2010-01-01",
        status: "hoax"
    },
    {
        1d: 3,
        date: "1999-01-01",
        status: "hoax"
    }
]
```



### List a specific sighting

`GET /sightings/1`

Return example:
```json
{
    id: 1,
    date: "2000-01-01",
    status: "suspected"
}
```



### Get sightings sorted by date

`GET /sightings?sortBy=date`

Return example:
```json
[
    {
        1d: 3,
        date: "1999-01-01",
        status: "hoax"
    },
    {
        id: 1,
        date: "2000-01-01",
        status: "suspected"
    },
    {
        1d: 2,
        date: "2010-01-01",
        status: "hoax"
    }
]
```



## Change status of a sighting

```
PATCH /sightings/1
{
    status: "confirmed"
}
```

Return example:
```json
{
    id: 1,
    date: "2000-01-01",
    status: "confirmed"
}
```
