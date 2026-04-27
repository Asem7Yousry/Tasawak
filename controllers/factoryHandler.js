const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

exports.createDoc = (service) =>
  asyncHandler(async (req, res, next) => {
    try {
      const newDocument = await service.create(req);
      res.status(201).json({
        success: true,
        message: "created successfully!",
        document: newDocument,
      });
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        // duplicate mongo error
        return next(new ApiError(`document data already exists`, 409));
      }
      return next(new ApiError(error.message, error.statusCode));
    }
  });

exports.getAllDoc = (service, documentName) =>
  asyncHandler(async (req, res) => {
    let allDocuments = await service.list(req);
    if (allDocuments.length === 0) {
      res.status(404).json({
        success: false,
        message: `no ${documentName} found`,
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: `got ${documentName} sccussfully!`,
      data: {
        length: allDocuments.length,
        page: req.query.pageNumber,
        allDocuments,
      },
    });
  });

exports.getSpecificDoc = (service, documentName, parameterId) =>
  asyncHandler(async (req, res, next) => {
    let document = await service.getById(req.params[parameterId]);
    if (!document) {
      return next(
        new ApiError(
          `${documentName} ID ${req.params[parameterId]} not exists`,
          404,
        ),
      );
    }
    res.status(200).json({ success: true, data: document });
  });

exports.updateSpecificDoc = (service, documentName, parameterId) =>
  asyncHandler(async (req, res, next) => {
    try {
      let document = await service.updateById(
        req.params[parameterId],
        req.body,
      );
      if (!document) {
        return next(
          new ApiError(
            `${documentName} ID ${req.params[parameterId]} not exists`,
            404,
          ),
        );
      }
      res.status(202).json({
        success: true,
        message: "updated Successfully!",
        Product: document,
      });
    } catch (error) {
      if (error.code === 11000) {
        // duplicate mongo error
        return next(new ApiError(`document data already exists`, 409));
      }
      return next(new ApiError(error.message, error.statusCode));
    }
  });

exports.deleteSpecificDoc = (service, documentName, parameterId) =>
  asyncHandler(async (req, res, next) => {
    let deletedProduct = await service.deleteById(req.params[parameterId]);
    if (!deletedProduct) {
      return next(
        new ApiError(
          `${documentName} ID ${req.params[parameterId]} not exists`,
          404,
        ),
      );
    }
    res.status(202).json({ success: true, message: "deleted successfully!" });
  });

exports.deleteAllDocs = (servise, documentName) =>
  asyncHandler(async (req, res, next) => {
    let deletedDocs = await servise.deleteAll();
    if (!deletedDocs) {
      return next(new ApiError(`there is no ${documentName}`, 404));
    }
    res.status(202).json({ success: true, message: "deleted successfully!" });
  });
