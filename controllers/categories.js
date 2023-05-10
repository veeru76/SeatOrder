"use strict";

// require libraries
const DB = require("./../lib/db.js");
const seatOrderObj = require("../lib/utils.js");
const snowflake = require("snowflake-id");

const categories = {
  post: async (req, res, next) => {
    var output;
    const con = new DB();

    try {

      //validation
      const schema = {
        properties: {
          store_id: {
            required: true,
            type: "string",
            minlength: 4,
            maxlength: 6,
          },
          category_name: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 50,
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
        "SELECT store_id FROM stores WHERE store_id = :store_id",
        {
          store_id: req.body.store_id,
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
                value: req.body.store_id,
                message: "Invalid Store ID",
              },
            ],
          },
        });
        return;
      }
      // check for duplicate category
      const [rowsCategoryIdDuplicationCheck] = await con.execute(
        "SELECT category_id FROM categories WHERE store_id = :store_id AND category_name = :category_name",
        {
          store_id: req.body.store_id,
          category_name: req.body.category_name,
        }
      );
      if (rowsCategoryIdDuplicationCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "category_name",
                value: req.body.category_name,
                message: "Duplication resource found",
              },
            ],
          },
        });
        return;
      }
      const uid = await snowflake.id();
      // console.log(await snowflake.id());
      // console.log(await snowflake.id());
      await con.execute(
        "INSERT INTO categories (category_id, store_id, category_name) VALUES(:category_id, :store_id, :category_name)",
        {
          category_id: uid,
          store_id: req.body.store_id,
          category_name: req.body.category_name,
        }
      );

      const [rowsStore] = await con.execute(
        "SELECT created_at FROM categories WHERE store_id = :store_id AND category_id = :category_id",
        {
          store_id: req.body.store_id,
          category_id: uid,
        }
      );
      if (rowsStore.length) {
        // output
        output = {
          message:
            "Category added succesfully with Category id: " +
            req.body.category_name,
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
                message: "Unable to create Category",
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
};

module.exports = {
  categories,
};
