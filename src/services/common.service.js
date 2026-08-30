const { QueryListing } = require("../utils/queryListing");

// object to apply generic crud operations for any db model
module.exports = class CommonService {
  constructor(model) {
    this.model = model;
  }

  create(data) {
    return this.model.create(data);
  }

  list(query) {
    return QueryListing(this.model, query);
  }

  getById(id) {
    return this.model.findById(id);
  }

  updateById(id, updates) {
    return this.model.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  }

  deleteAll() {
    return this.model.deleteMany({});
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
};
