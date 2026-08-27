exports.QueryListing = (model, query) => {
  const filterOperators = new Set([
    "gte",
    "gt",
    "lte",
    "lt",
    "in",
    "ne",
    "nin",
  ]);
  const queryOperators = new Set(["sort", "project", "populate"]);

  const filter = {};
  const options = {
    sort: { _id: -1 },
    pageNumber: 1,
    pageSize: 10,
  };

  Object.entries(query).forEach(([key, value]) => {
    // Pagination
    if (key === "pageNumber" || key === "pageSize") {
      options[key] = Number(value);
      return;
    }

    // Text Search
    if (key === "search") {
      filter.$text = { $search: value };
      return;
    }

    // Query Operators (sort, projection, populate)
    if (queryOperators.has(key)) {
      options[key] = value.split(",").join(" ");
      return;
    }

    // Advanced filtering
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const operatorFilter = {};

      Object.entries(value).forEach(([op, val]) => {
        if (filterOperators.has(op)) {
          operatorFilter[`$${op}`] = op === "in" ? val.split(",") : val;
        }
      });

      if (Object.keys(operatorFilter).length) {
        filter[key] = operatorFilter;
      }

      return;
    }

    // Normal filter
    filter[key] = value;
  });

  // Pagination calculation
  const skip = (options.pageNumber - 1) * options.pageSize;

  // Build mongoose query
  let dbQuery = model
    .find(filter)
    .skip(skip)
    .limit(options.pageSize)
    .sort(options.sort);

  if (options.project) dbQuery = dbQuery.select(options.project);
  if (options.populate) dbQuery = dbQuery.populate(options.populate);

  return dbQuery;
};
