"use strict";

// require libraries
const DB = require("./../lib/db.js");
const seatOrderObj = require("../lib/utils.js");

const stores = {
  post: async (req, res, next) => {
    var output;
    const con = new DB();

    const state = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttarakhand",
      "Uttar Pradesh",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli",
      "Daman and Diu",
      "Delhi",
      "Lakshadweep",
      "Puducherry",
    ];

    const store_types = ["theatre", "restaurant", "store"];
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
          store_name: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 50,
          },
          store_type: {
            required: true,
            type: "string",
            minlength: 0,
            maxlength: 50,
            values: store_types,
          },
          address: {
            required: true,
            type: "string",
            minlength: 10,
            maxlength: 256,
          },
          state: {
            required: true,
            type: "string",
            minlength: 0,
            maxlength: 50,
            values: state,
          },
          pincode: {
            required: true,
            type: "integer",
            minlength: 6,
            maxlength: 6,
          },
          city: {
            required: true,
            type: "string",
            minlength: 1,
            maxlength: 50,
          },
          lat: {
            required: true,
            type: "string",
            minlength: 5,
            maxlength: 16,
          },
          lon: {
            required: true,
            type: "string",
            minlength: 5,
            maxlength: 16,
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

      // check for duplicate store id
      const [rowsStoreIdDuplicationCheck] = await con.execute(
        "SELECT store_id FROM stores WHERE store_id = :store_id",
        {
          store_id: req.body.store_id,
        }
      );
      if (rowsStoreIdDuplicationCheck.length) {
        res.status(422).json({
          error: {
            type: "UNPROCESSABLE_ENTITY",
            sub_type: "DATA_ERROR",
            message: [
              {
                property: "store_id",
                value: req.body.store_id,
                message: "Duplication resource found",
              },
            ],
          },
        });
        return;
      }

      await con.execute(
        "INSERT INTO stores (store_id, store_name, store_type, address, city, state, pincode, lat, lon) VALUES(:store_id, :store_name, :store_type, :address, :city, :state, :pincode, :lat, :lon)",
        {
          store_id: req.body.store_id,
          store_name: req.body.store_name,
          store_type: req.body.store_type,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          lat: req.body.lat,
          lon: req.body.lon,
        }
      );

      const [rowsStore] = await con.execute(
        "SELECT created_at FROM stores WHERE store_id = :store_id",
        {
          store_id: req.body.store_id,
        }
      );
      if (rowsStore.length) {
        // output
        output = {
          message:
            "Store added succesfully with store id: " + req.body.store_id,
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
                message: "Unable to create store",
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
  stores,
};
