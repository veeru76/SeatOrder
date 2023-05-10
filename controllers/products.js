"use strict";

// require libraries
const DB = require("./../lib/db.js");
const seatOrderObj = require("../lib/utils.js");
const snowflake = require("snowflake-id");

const products = {
  post: async (req, res, next) => {
    var output;
    const con = new DB();

    try {
      //validation
      const schema = {
        properties: {
          category_id: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },
          product_name: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 50,
          },
          product_description: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 256,
          },

          tax_id: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },
          product_type: {
            required: true,
            type: "string",
            values: ["Vegetarian", "Non-Vegetarian", "Eggetarian"],
          },
        },
      };

      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "SCHEMA_ERROR",
            message: err,
          },
        });
        return;
      }

      // con
      await con.getConnection();

      // validate store id
      const [rowsStoreIdCheck] = await con.execute(
        "SELECT category_id FROM categories WHERE category_id = :category_id",
        {
          store_id: req.body.category_id,
        }
      );
      if (!rowsStoreIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "category_id",
                value: req.body.category_id,
                message: "Invalid category_id ",
              },
            ],
          },
        });
        return;
      }

      // check for duplicate product for same store
      const [rowsProductDuplicationCheck] = await con.execute(
        "SELECT product_id FROM products WHERE category_id = :category_id AND product_name = :product_name",
        {
          category_id: req.body.category_id,
          product_name: req.body.product_name,
        }
      );
      if (rowsProductDuplicationCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "product_name",
                value: req.body.product_name,
                message: "Duplication resource found",
              },
            ],
          },
        });
        return;
      }
      const uid = await snowflake.id();
      await con.execute(
        "INSERT INTO products (product_id, product_name, product_description, category_id, product_type, tax_id) VALUES(:product_id, :product_name, :product_description, :category_id, :product_type, :tax_id)",
        {
          product_id: uid,
          product_name: req.body.product_name,
          product_description: req.body.product_description,
          category_id: req.body.category_id,
          product_type: req.body.product_type,
          tax_id: req.body.tax_id,
        }
      );

      const [rowsProducts] = await con.execute(
        "SELECT created_at FROM products WHERE product_id = :product_id",
        {
          product_id: uid,
        }
      );
      if (rowsProducts.length) {
        // output
        output = {
          message:
            "Product added succesfully with Product id: " +
            req.body.product_name,
        };
      } else {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                // property: 'email_id',
                // value: req.body.email_id,
                message: "Unable to create Product",
              },
            ],
          },
        });
        return;
      }
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
    res.status(200).json(output);
  },

  get: async (req, res, next) => {
    var output = [];
    const con = new DB();

    try {
      // con
      await con.getConnection();

      // validate store id
      const [rowsStoreIdCheck] = await con.execute(
        "SELECT store_id FROM stores WHERE store_id = :store_id",
        {
          store_id: req.params.store_id,
        }
      );
      if (!rowsStoreIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "store_id",
                value: req.params.store_id,
                message: "Invalid Store ID",
              },
            ],
          },
        });
        return;
      }

      console.log(req.params.store_id);

      //select products using joins
      const [rowsProduct] = await con.execute(
        "SELECT c.category_id, c.category_name, c.status, " +
          "p.product_id, p.product_name, p.product_description, p.product_type, p.product_status, " +
          "ps.size_id, ps.size_name, ps.price, ps.quantity " +
          "FROM stores s " +
          "INNER JOIN categories c on s.store_id = c.store_id " +
          "INNER JOIN products p on c.category_id = p.category_id " +
          "INNER JOIN product_sizes ps on p.product_id = ps.product_id " +
          "WHERE s.store_id = :store_id AND c.internal_status = 1 AND p.internal_status = 1 AND ps.internal_status = 1 " +
          "ORDER BY c.category_id",
        { store_id: req.params.store_id }
      );

      if (!rowsProduct.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "store_id",
                value: req.params.store_id,
                message:
                  "No products available for store_id " + req.params.store_id,
              },
            ],
          },
        });
        return;
      } else {
        // Group products by category
        const groupedData = rowsProduct.reduce((acc, item) => {
          const {
            category_id,
            category_name,
            status,
            product_id,
            product_name,
            product_description,
            product_type,
            product_status,
            size_id,
            size_name,
            price,
            quantity,
          } = item;

          const categoryIndex = acc.findIndex(
            (c) => c.category_id === category_id
          );
          const product = {
            product_id,
            product_name,
            product_description,
            product_type,
            product_status,
            sizes: [{ size_id, size_name, price, quantity }],
          };

          if (categoryIndex === -1) {
            acc.push({
              category_id,
              category_name,
              status,
              products: [product],
            });
          } else {
            const productIndex = acc[categoryIndex].products.findIndex(
              (p) => p.product_id === product_id
            );

            if (productIndex === -1) {
              acc[categoryIndex].products.push(product);
            } else {
              acc[categoryIndex].products[productIndex].sizes.push({
                size_id,
                size_name,
                price,
                quantity,
              });
            }
          }

          return acc;
        }, []);

        output = {
          products: groupedData,
        };
      }
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
    res.status(200).json(output);
  },

  put: async (req, res, next) => {
    var output;
    const con = new DB();

    try {
      //validation
      const schema = {
        properties: {
          product_id: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 20,
          },
          product_name: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 50,
          },
          product_description: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 256,
          },
          category_id: {
            required: true,
            type: "string",
            minlength: 18,
            maxlength: 20,
          },
          tax_id: {
            required: true,
            type: "string",
            minlength: 18,
            maxlength: 20,
          },
          product_type: {
            required: true,
            type: "string",
            values: ["Vegetarian", "Non-Vegetarian", "Eggetarian"],
          },
        },
      };

      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "SCHEMA_ERROR",
            message: err,
          },
        });
        return;
      }
      //con
      await con.getConnection();

      // validate product id
      const [rowsProductIdCheck] = await con.execute(
        "SELECT product_id FROM products WHERE product_id = :product_id",
        {
          product_id: req.body.product_id,
        }
      );
      if (!rowsProductIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "product_id",
                value: req.body.product_id,
                message: "Invalid product ID",
              },
            ],
          },
        });
        return;
      }

      // setting internal_status as 2 when ever there is changes in sizes
      await con.execute(
        "UPDATE products SET internal_status=" +
          2 +
          "  WHERE product_id = :product_id",
        {
          product_id: req.body.product_id,
        }
      );

      const uid = await snowflake.id();
      // inserting product with new product ID
      await con.execute(
        "INSERT INTO products (product_id, product_name, product_description, category_id, product_type, tax_id) VALUES(:product_id, :product_name, :product_description, :category_id, :product_type, :tax_id)",
        {
          product_id: uid,
          product_name: req.body.product_name,
          product_description: req.body.product_description,
          category_id: req.body.category_id,
          product_type: req.body.product_type,
          tax_id: req.body.tax_id,
        }
      );

      const [rowsProducts] = await con.execute(
        "SELECT product_id, created_at FROM products WHERE product_id = :product_id",
        {
          product_id: uid,
        }
      );
      if (rowsProducts.length) {
        // updating product_id in sizes with new product_id
        await con.execute(
          "UPDATE product_sizes SET product_id=" +
            uid +
            "  WHERE product_id = :product_id",
          {
            product_id: req.body.product_id,
          }
        );
        output = {
          message:
            "Product updated successfully with Product id: " +
            rowsProducts[0].product_id,
        };
      } else {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                // property: 'email_id',
                // value: req.body.email_id,
                message: "Unable to create Product",
              },
            ],
          },
        });
        return;
      }
      res.status(200).json(output);
    } catch (error) {
      next(error);
    } finally {
      await con.release();
    }
  },
};

const sizes = {
  post: async (req, res, next) => {
    var output;
    const con = new DB();

    try {
      //validation
      const schema = {
        properties: {
          product_id: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },

          size_name: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 50,
          },
          price: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 10,
          },
          quantity: {
            required: true,
            type: "string",
            minlength: 2,
            maxlength: 40,
          },
        },
      };

      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "SCHEMA_ERROR",
            message: err,
          },
        });
        return;
      }

      // con
      await con.getConnection();

      // validate product id
      const [rowsProductIdCheck] = await con.execute(
        "SELECT product_id FROM products WHERE AND product_id = :product_id",
        {
          product_id: req.body.product_id,
        }
      );
      if (!rowsProductIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "product_id",
                value: req.body.product_id,
                message: "Invalid product ID",
              },
            ],
          },
        });
        return;
      }

      // check for duplicate size for same product
      const [rowsProductSizeDuplicationCheck] = await con.execute(
        "SELECT size_id FROM product_sizes WHERE product_id = :product_id AND size_name = :size_name",
        {
          product_id: req.body.product_id,
          size_name: req.body.size_name,
        }
      );
      if (rowsProductSizeDuplicationCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "size_name",
                value: req.body.size_name,
                message: "Duplication resource found",
              },
            ],
          },
        });
        return;
      }

      const uid = await snowflake.id();
      await con.execute(
        "INSERT INTO product_sizes (size_id, product_id, size_name, price, quantity) VALUES(:size_id, :product_id, :size_name, :price, :quantity)",
        {
          size_id: uid,
          product_id: req.body.product_id,
          size_name: req.body.size_name,
          price: req.body.price,
          quantity: req.body.quantity,
        }
      );

      const [rowsProducts] = await con.execute(
        "SELECT created_at FROM product_sizes WHERE product_id = :product_id AND size_id = :size_id",
        {
          product_id: req.body.product_id,
          size_name: uid,
        }
      );
      if (!rowsProducts.length) {
        // output
        output = {
          message:
            "Size added succesfully to " +
            req.body.product_id +
            "with Size name: " +
            req.body.size_name,
        };
      } else {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                // property: 'email_id',
                // value: req.body.email_id,
                message: "Unable to create Product",
              },
            ],
          },
        });
        return;
      }
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
    res.status(200).json(output);
  },

  get: async (req, res, next) => {
    var output;
    const con = new DB();

    // get sizes
    try {
      // con
      await con.getConnection();

      // validate product id
      const [rowsProductIdCheck] = await con.execute(
        "SELECT product_id FROM products WHERE product_id = :product_id",
        {
          product_id: req.params.product_id,
        }
      );
      if (!rowsProductIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "product_id",
                value: req.params.product_id,
                message: "Invalid product ID",
              },
            ],
          },
        });
        return;
      }
      // select sizes
      const [rows] = await con.execute(
        "SELECT size_id, size_name, price, quantity FROM product_sizes WHERE product_id = :product_id AND internal_status != 2",
        {
          product_id: req.params.product_id,
        }
      );
      if (!rows.length) {
        throw new Error(
          `No sizes available for product_id ${req.params.product_id} `
        );
      } else {
        output = rows;
      }
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
    res.status(200).json(output);
  },

  put: async (req, res, next) => {
    var output;
    const con = new DB();

    // update sizes
    try {
      //validation
      const schema = {
        properties: {
          product_id: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },
          size_name: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 50,
          },
          size_id: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },
          price: {
            required: true,
            type: "string",
            minlength: 3,
            maxlength: 10,
          },
          quantity: {
            required: true,
            type: "string",
            minlength: 2,
            maxlength: 40,
          },
        },
      };

      const err = seatOrderObj.jsonSchema.validate(schema, req.body);
      if (err.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "SCHEMA_ERROR",
            message: err,
          },
        });
        return;
      }

      // con
      await con.getConnection();

      // validate product id
      const [rowsProductIdCheck] = await con.execute(
        "SELECT product_id, size_id FROM product_sizes WHERE size_id = :size_id AND product_id = :product_id",
        {
          product_id: req.body.product_id,
          size_id: req.body.size_id,
        }
      );
      if (!rowsProductIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "product_id",
                value: req.body.product_id,
                message: "Invalid product ID or Size doesn't exist for product",
              },
            ],
          },
        });
        return;
      }
      // setting internal_status as 2 when ever there is changes in sizes
      await con.execute(
        "UPDATE product_sizes SET internal_status=" +
          2 +
          "  WHERE size_id = :size_id",
        {
          size_id: req.body.size_id,
        }
      );

      const uid = await snowflake.id();
      // inserting new line after disabling the previous size
      await con.execute(
        "INSERT INTO product_sizes (size_id, product_id, size_name, price, quantity) VALUES(:size_id, :product_id, :size_name, :price, :quantity)",
        {
          size_id: uid,
          product_id: req.body.product_id,
          size_name: req.body.size_name,
          price: req.body.price,
          quantity: req.body.quantity,
        }
      );

      const [rowsProducts] = await con.execute(
        "SELECT created_at FROM product_sizes WHERE product_id = :product_id AND size_id = :size_id",
        {
          product_id: req.body.product_id,
          size_id: uid,
        }
      );
      if (rowsProducts.length) {
        // output
        output = {
          message:
            "Size added succesfully to " +
            req.body.product_id +
            "with Size name: " +
            req.body.size_name,
        };
      } else {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                // property: 'email_id',
                // value: req.body.email_id,
                message: "Unable to create Product",
              },
            ],
          },
        });
        return;
      }
      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },
};

module.exports = {
  products,
  sizes,
};
