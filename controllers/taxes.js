"use strict";

// require libraries
const DB = require("./../lib/db.js");
const seatOrderObj = require("../lib/utils.js");
const snowflake = require("snowflake-id");

const taxes = {
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
          tax_1: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 6,
          },
          tax_2: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 6,
          },
          tax_3: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 6,
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

      const uid = await snowflake.id();

      await con.execute(
        "INSERT INTO taxes (tax_id, store_id, tax_1, tax_2, tax_3) VALUES(:tax_id, :store_id, :tax_1, :tax_2, :tax_3)",
        {
          tax_id: uid,
          store_id: req.body.store_id,
          tax_1: req.body.tax_1,
          tax_2: req.body.tax_2,
          tax_3: req.body.tax_3,
        }
      );

      const [rowsStore] = await con.execute(
        "SELECT created_at FROM taxes WHERE store_id = :store_id AND tax_id = :tax_id",
        {
          store_id: req.body.store_id,
          tax_id: uid,
        }
      );
      if (rowsStore.length) {
        // output
        output = {
          message: "Tax added succesfully with Tax id: " + uid,
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
  taxes,
};
