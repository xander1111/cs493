const router = require('express').Router();
const { ObjectId } = require('mongodb');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const { reviews } = require('./reviews');
const { photos } = require('./photos');

exports.router = router;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res) {
  const collection = req.app.locals.db.collection('businesses');

  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1;
  const numPerPage = 10;
  const totalCount = await collection.countDocuments({});
  const lastPage = Math.ceil(totalCount / numPerPage);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;

  /*
   * Calculate starting and ending indices of businesses on requested page and
   * slice out the corresponsing sub-array of busibesses.
   */
  const start = (page - 1) * numPerPage;

  const pipeline = [
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "businessid",
        as: "photos"
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "businessid",
        as: "reviews"
      }
    }
  ];
  const pageBusinesses = await collection.aggregate(pipeline)
    .sort({ _id: 1 })
    .skip(start)
    .limit(numPerPage)
    .toArray();

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const links = {};
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`;
    links.lastPage = `/businesses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`;
    links.firstPage = '/businesses?page=1';
  }

  /*
   * Construct and send response.
   */
  res.status(200).json({
    businesses: pageBusinesses,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: totalCount,
    links: links
  });

});

/*
 * Route to create a new business.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
    const business = extractValidFields(req.body, businessSchema);
    try {
      business.ownerid = new ObjectId (business.ownerid);
    } catch {
      res.status(400).json({
        error: "Invalid ownerid"
      });
      return;
    }
    
    const collection = req.app.locals.db.collection('businesses');

    const result = await collection.insertOne(business);

    res.status(201).json({
      id: result.insertedId,
      links: {
        business: `/businesses/${result.insertedId}`
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  let businessid = null;
  try {
    businessid = new ObjectId(req.params.businessid);
  } catch (error) {
    res.status(400).json({
      error: "Invalid businessid"
    });
    return;
  }

  const businessesCollection = req.app.locals.db.collection('businesses');
  const pipeline = [
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "businessid",
        as: "photos"
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "businessid",
        as: "reviews"
      }
    }
  ];
  const business = await businessesCollection.aggregate(pipeline).toArray()[0];
  if (business) {
    res.status(200).json(business);
  } else {
    next();
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', async function (req, res, next) {
  let businessid = null;
  try {
    businessid = new ObjectId(req.params.businessid);
  } catch (error) {
    res.status(400).json({
      error: "Invalid businessid"
    });
    return;
  }

  const businessesCollection = req.app.locals.db.collection('businesses');
  const business = await businessesCollection.findOne({ _id: businessid });

  if (business) {
    if (validateAgainstSchema(req.body, businessSchema)) {
      const newBusiness = extractValidFields(req.body, businessSchema);
      try {
        newBusiness.ownerid = new ObjectId (newBusiness.ownerid);
      } catch {
        res.status(400).json({
          error: "Invalid ownerid"
        });
        return;
      }

      const result = await businessesCollection.replaceOne({ _id: businessid }, newBusiness);

      res.status(200).json({
        links: {
          business: `/businesses/${businessid}`
        }
      });
    } else {
      res.status(400).json({
        error: "Request body is not a valid business object"
      });
    }

  } else {
    next();
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async function (req, res, next) {
  let businessid = null;
  try {
    businessid = new ObjectId(req.params.businessid);
  } catch (error) {
    res.status(400).json({
      error: "Invalid businessid"
    });
    return;
  }

  const collection = req.app.locals.db.collection('businesses');
  const result = await collection.deleteOne({ _id: new ObjectId(businessid) });

  if (result.deletedCount > 0) {
    res.status(204).end();
  } else {
    next();
  }
});
