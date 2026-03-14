exports.QueryListing = class QueryListing {
  /* class for listing documents 
  and handel all its filter, pagination,
  sort, projection and search */
  constructor(model, requestQeury) {
    this.model = model;
    this.requestQeury = requestQeury;
    this.dbQuery = null;
  }

  filter() {
    // Copy request query
    const queryObj = { ...this.requestQeury };

    // Remove non-filter fields
    const excludedFields = [
      "pageNumber",
      "pageSize",
      "sort",
      "project",
      "populate",
    ];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let filter = JSON.parse(queryStr);
    if (this.requestQeury.search) {
      filter["$text"] = { $search: this.requestQeury.search };
    }

    // Apply filter to mongoose query
    this.dbQuery = this.model.find(filter);

    return this;
  }

  paginate(pageNumber = 1, pageSize = 10) {
    pageNumber = Number(this.requestQeury.pageNumber) || pageNumber;
    pageSize = Number(this.requestQeury.pageSize) || pageSize;
    let skip = 0;
    if (pageNumber !== 1) skip = (pageNumber - 1) * pageSize;
    this.dbQuery.skip(skip).limit(pageSize).sort({ _id: -1 });
    return this;
  }
  sort() {
    if (this.requestQeury.sort) {
      const sortBy = this.requestQeury.sort.split(",").join(" ");
      this.dbQuery.sort(sortBy);
    }
    return this;
  }
  projection() {
    if (this.requestQeury.project) {
      const projectionStr = this.requestQeury.project.split(",").join(" ");
      console.log(projectionStr);
      this.dbQuery.select(projectionStr);
    }
    return this;
  }
  populate() {
    if (this.requestQeury.populate) {
      const populateOptions = this.requestQeury.populate.split(",").join(" ");

      this.dbQuery.populate(populateOptions);
    }
    return this;
  }
  apply() {
    this.filter();
    this.paginate();
    this.sort();
    this.projection();
    this.populate();
  }
};
