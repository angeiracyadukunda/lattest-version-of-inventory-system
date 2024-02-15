// productModel.js

const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    productId :{
        type:String,
        required:false,
    },
    name: {
      type: String,
      require:true
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: false,
    },
    status:{
        type: String,
        enum: ["pending","approved","rejected"],
        default:"pending"
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Stock", stockSchema);

module.exports = Product;

