import { NextFunction, Request, Response } from "express";
import * as ProductService from "../../services/admin/product";
import { ApiResponse } from "../../utils/ApiResponse";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // optimize query here to just return active & published products
    const data = await ProductService.getAllProducts(
      search,
      Number(page),
      Number(limit)
    );

    // or filter data here

    res.status(200).json(
      // new ApiResponse(200, { products: data.products, categories: data.categories }, "Products fetched successfully")
      new ApiResponse(200, data, "Products fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  } catch (error) {
    next(error);
  }
};
