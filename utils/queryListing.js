exports.QueryListing = (model, query) => {
  // declare parameters
  let filterOperators = ["gte", "gt", "lte", "lt", "in"];
  let queryOperators = ["sort", "project", "populate"];
  let filter = {};
  let constData = { sort: { _id: -1 } };

  // map on query object to get extract attribute
  Object.entries(query).map(([key, value]) => {
    if (key === "pageNumber" || key === "pageSize") {
      constData[key] = value;
    } else if (queryOperators.includes(key)) {
      constData[key] = value.split(",").join(" ");
    } else if (typeof value === "object") {
      Object.keys(value).forEach((op) => {
        if (filterOperators.includes(op)) {
          if (op === "in") {
            value[op] = value[op].split(",");
          }
          value[`$${op}`] = value[op];
          delete value[op];
          filter[key] = value;
        }
      });
    } else {
      filter[key] = value;
    }
  });

  // enhance pagination parameters
  const pageNumber = Number(constData.pageNumber) || 1;
  const pageSize = Number(constData.pageSize) || 10;
  let skip = 0;
  if (pageNumber !== 1) skip = (pageNumber - 1) * pageSize;
  
  // final query on model
  const listQuery = model
    .find(filter)
    .skip(skip)
    .limit(pageSize)
    .sort(constData.sort)
    .select(constData.project)
    .populate(constData.populate);

  return listQuery;
};
