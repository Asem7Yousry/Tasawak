/// method for handle pagination ,sorting and filtration from request query parameters ///
exports.filterPagination = (query) => {
  // extract pagination parameter from request
  let limit = Math.min(parseInt(query.limit, 10) || 10, 50);
  let page = Math.max(parseInt(query.page, 10) || 1, 1);
  let skip = (page - 1) * limit;

  // extract only needed fields from query
  let fields = query.fields ? query.fields.replaceAll(",", " ") : {};

  // extract sort fields
  let sort = query.sort
    ? query.sort.trim().replace(/[ ,]/g, (char) => {
        if (char === " ") return "";
        if (char === ",") return " ";
      })
    : { createdAt: -1 };

  // extract filter query parameter from est query
  let filter = { ...query };
  const exculdes = ["page", "limit", "sort", "fields", "search"];
  exculdes.forEach((key) => delete filter[key]);

  // Convert operators (gte, lte, gt, lt, ...ets) to MongoDB syntax
  filter = JSON.stringify(filter);
  filter = filter.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => "$" + `${match}`,
  );
  filter = JSON.parse(filter);

  // fix '$in' , set value to array
  Object.values(filter).forEach((element) => {
    if (typeof element === "object" && "$in" == Object.keys(element)) {
      element["$in"] = element["$in"].split(",");
    }
  });

  /* add searching keyword to filter with it in its text index*/
  if (query.search) {
    filter['$text'] = { '$search': query.search };
    console.log("filter");
    console.log(filter);
  }

  return [limit, page, skip, filter, sort, fields];
};
