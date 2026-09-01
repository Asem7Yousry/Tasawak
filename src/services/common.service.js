const { QueryListing } = require("../utils/queryListing");

// object to apply generic crud operations for any db model
module.exports = class CommonService {
  constructor(model) {
    this.model = model;
  }

  create(req) {
    return this.model.create(req.body);
  }

  list(req) {
    return QueryListing(this.model, req.query);
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
