"use strict";

//required libraries
const DB = require("./../lib/db.js");
const seatOrderObj = require("../lib/utils.js");
const snowflake = require("snowflake-id");

const cart = {
  post: async (req, res, next) => {
    var output;
    const con = new DB();
    try {
      //validation
      const schema = {
        properties: {
          size_id: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },
          store_id: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 6,
          },
          uid: {
            required: true,
            type: "string",
            minlength: 16,
            maxlength: 20,
          },
          count: {
            required: true,
            type: "number",
            minlength: 1,
            maxlength: 3,
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

      // validate product and store
      const [rowsProductIdCheck] = await con.execute(
        "SELECT size_id FROM product_sizes WHERE size_id = :size_id",
        {
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
                property: "size_id",
                value: req.body.size_id,
                message: "Invalid Size doesn't exist for product",
              },
            ],
          },
        });
        return;
      }
      const uid = await snowflake.id();
      // inserting new line after disabling the previous size
      await con.execute(
        "INSERT INTO carts (cart_id, uid, size_id, count) VALUES(:cart_id, :uid, :size_id, :count)",
        {
          cart_id: uid,
          uid: req.body.uid,
          size_id: req.body.size_id,
          count: req.body.count,
        }
      );

      const [rowsProducts] = await con.execute(
        "SELECT created_at FROM carts WHERE cart_id = :cart_id",
        {
          cart_id: uid,
        }
      );
      if (rowsProducts.length) {
        // output
        output = {
          message: "Product added to cart successfully",
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

  get: async (req, res, next) => {
    var output;
    const con = new DB();
    try {
      // con
      await con.getConnection();
      console.log(req.params.uid);
      // validate store id
      const [rowsStoreIdCheck] = await con.execute(
        "SELECT uid FROM users WHERE uid = :uid",
        {
          uid: req.params.uid,
        }
      );
      if (!rowsStoreIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "uid",
                value: req.params.uid,
                message: "Invalid uid ID",
              },
            ],
          },
        });
        return;
      }

      //get cart items
      const [rowsProducts] = await con.execute(
        "SELECT ca.cart_id, ca.size_id, ca.count, " +
          "c.store_id, c.category_id, c.category_name, " +
          "p.product_id, p.product_name, p.product_description, p.product_type, p.product_status, " +
          "ps.size_id, ps.size_name, ps.price, ps.quantity " +
          "FROM carts ca " +
          "INNER JOIN product_sizes ps on ca.size_id = ps.size_id " +
          "INNER JOIN products p on ps.product_id = p.product_id " +
          "INNER JOIN categories c on p.category_id = c.category_id " +
          "WHERE uid = :uid",
        {
          uid: req.params.uid,
        }
      );
      if (rowsProducts.length) {
        output = { cart: rowsProducts };
      } else {
        output = { cart: [] };
        return;
      }
      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },

  put: async (req, res, next) => {
    var output;
    const con = new DB();

    try {
      const schema = {
        properties: {
          cart_id: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 20,
          },
          uid: {
            required: true,
            type: "string",
            minlength: 18,
            maxlength: 20,
          },
          count: {
            required: true,
            type: "number",
            minlength: 1,
            maxlength: 3,
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

      // validate cart id
      const [rowsCartIdCheck] = await con.execute(
        "SELECT cart_id FROM carts WHERE cart_id = :cart_id",
        {
          cart_id: req.body.cart_id,
        }
      );
      if (!rowsCartIdCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "cart_id",
                value: req.body.cart_id,
                message: "Invalid Cart ID",
              },
            ],
          },
        });
        return;
      } else {
        if (req.body.count > 0) {
          // updating count
          await con.execute(
            "UPDATE carts SET count=" +
              req.body.count +
              "  WHERE cart_id = :cart_id",
            {
              cart_id: req.body.cart_id,
            }
          );
          output = { mesage: "Cart updated succesfully" };
        } else {
          // deleting cart item
          await con.execute("DELETE FROM carts WHERE cart_id = :cart_id", {
            cart_id: req.body.cart_id,
          });
          output = { mesage: "Cart item deleted succesfully" };
        }
      }
      res.status(200).json(output);
    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
  },
};

const orders = {
  post: async (req, res, next) => {
    var output;
    const con = new DB();

    try {
      //validation
    

    } catch (err) {
      next(err);
    } finally {
      await con.release();
    }
    res.status(200).json(output);
  },
};

module.exports = {
  cart,
  orders
};
