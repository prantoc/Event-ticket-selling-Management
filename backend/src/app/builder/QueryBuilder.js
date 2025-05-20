const { Query } = require('mongoose');

class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    search(searchableFields) {
        const searchTerm = this?.query?.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(
                    (field) =>
                    ({
                        [field]: { $regex: searchTerm, $options: 'i' },
                    })
                ),
            });
        }

        return this;
    }

   
  filter(filterableFields = []) {
  const queryObj = { ...this.query };
  const mongoQuery = {};

  for (const key of filterableFields) {
    if (queryObj[key] !== undefined) {
      const value = queryObj[key];

      // Date filtering (day-based)
      if (key === 'date') {
        mongoQuery.$or = [
          {
            date: {
              $gte: new Date(`${value}T00:00:00.000Z`),
              $lt: new Date(`${value}T23:59:59.999Z`),
            },
          },
          {
            billingDate: {
              $gte: new Date(`${value}T00:00:00.000Z`),
              $lt: new Date(`${value}T23:59:59.999Z`),
            },
          },
        ];
      }

      // Month filtering
      else if (key === 'month') {
        const startDate = new Date(`${value}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        mongoQuery.date = {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        };
      }

      // Exact match for ObjectId-like filters
      else if (
        ['_id', 'id', 'eventCategory', 'organizerId', 'userId', 'category','eventId'].includes(key)
      ) {
        mongoQuery[key] = value;
      }

      // Case-insensitive match for strings
      else if (typeof value === 'string') {
        mongoQuery[key] = { $regex: new RegExp(`^${value}$`, 'i') };
      }

      // Default: use raw value
      else {
        mongoQuery[key] = value;
      }
    }
  }

  this.modelQuery = this.modelQuery.find({
    ...this.modelQuery.getFilter(),
    ...mongoQuery,
  });

  return this;
}


    sort() {
        const sort =
            (this?.query?.sort)?.split(',')?.join(' ') || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);

        return this;
    }

    paginate() {
        if (this.query.month) {
            return this;
        }
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }

    fields() {
        const fields =
            (this?.query?.fields)?.split(',')?.join(' ') || '-__v';

        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

    async countTotal() {
        const totalQueries = this.modelQuery.getFilter();
        const total = await this.modelQuery.model.countDocuments(totalQueries);
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const totalPage = Math.ceil(total / limit);
        const hasNextPage = page < totalPage;
        const hasPreviousPage = page > 1;
        return {
            page,
            limit,
            total,
            totalPage,
            hasNextPage,
            hasPreviousPage,
        };
    }
}

module.exports = QueryBuilder;
