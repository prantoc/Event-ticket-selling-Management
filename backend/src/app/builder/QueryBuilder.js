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

    // filter(filterableFields) {

    //     const queryObj = { ...this.query }; // copy

    //     if (queryObj.date) {
    //         queryObj.date = {
    //             $gte: new Date(queryObj.date).toISOString()
    //         }
    //     }

    //     if (queryObj.month) {
    //         const [year, month] = queryObj.month.split('-').map(Number);
    //         const startOfMonth = new Date(year, month - 1, 1);
    //         const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999); // last day of the month

    //         queryObj.date = { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() };
    //         delete queryObj.month; // Clean up query to avoid re-filtering
    //     }
    //     // Filtering
    //     const excludeFields = filterableFields ?? ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    //     excludeFields.forEach((el) => delete queryObj[el]);

    //     this.modelQuery = this.modelQuery.find(queryObj);

    //     return this;
    // }
    filter(filterableFields = []) {
        const queryObj = { ...this.query };

        const mongoQuery = {};


        for (const key of filterableFields) {

            if (queryObj[key] !== undefined) {
                if (key === 'date') {
                    // mongoQuery.date = {
                    //     $gte: new Date(queryObj.date).toISOString(),
                    // };
                    // mongoQuery.billingDate = {
                    //     $gte: new Date(queryObj.date).toISOString(),
                    // };
                    // const dateISO = new Date(queryObj.date).toISOString();
                    // mongoQuery.$or = [
                    //     { date: { $eq: dateISO } },
                    //     { billingDate: { $gte: dateISO } },
                    // ];
                    mongoQuery.$or = [
                        {
                            date: {
                                $gte: new Date(`${queryObj.date}T00:00:00.000Z`),
                                $lt: new Date(`${queryObj.date}T23:59:59.999Z`),
                            },
                        },
                        {
                            billingDate: {
                                $gte: new Date(`${queryObj.date}T00:00:00.000Z`),
                                $lt: new Date(`${queryObj.date}T23:59:59.999Z`),
                            },
                        },
                    ];
                } else if (key === 'month') {
                    const startDate = new Date(`${queryObj.month}-01`);
                    const endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + 1);

                    mongoQuery.date = {
                        $gte: startDate.toISOString(),
                        $lt: endDate.toISOString(),
                    };
                } else {
                    // mongoQuery[key] = queryObj[key];
                    const value = queryObj[key];

                    if (key !== 'limit' && key !== 'page' && key !== 'searchTerm') {
                        mongoQuery[key] =
                            typeof value === 'string'
                                ? { $regex: new RegExp(`^${value}$`, 'i') } // case-insensitive exact match
                                : value;
                    }

                }
            }
        }

        // this.modelQuery = this.modelQuery.find(mongoQuery);
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
