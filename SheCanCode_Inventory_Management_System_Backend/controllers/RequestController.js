const requestModel = require("../models/requestModel");
const user = require("../models/userModel");
const Product = require("./../models/ProductModel");
const { createEmailTable } = require("./../services/email.service");
const express = require("express");
const account = require("./../models/Account");
const stockModel = require("./../models/sockModel")

const requestController = express();

requestController.createRequest = async (req, res) => {
  try {
    const userData = req.user;
    const productData = req.body.products;
    const finance = req.body.finance;
    const products = await Promise.all(
      productData.map(async (productItem) => {
        const product = await Product.findById(productItem.product);
        const findProductName = await Product.findById(product._id);
        // console.log(findProductName.productName);
        return {
          product: findProductName.productName,
          quantity: productItem.quantity,
          price: productItem.price,
          totalprice: productItem.quantity * productItem.price,
        };
      })
    );
    const financeUser = await user.findOne({ username: finance });
    if (!financeUser) {
      res.status(404).json({ message: "finance not found!" });
    }
    const totalAmount = products.reduce(
      (acc, product) => acc + product.quantity * product.price,
      0
    );
    const newRequest = new requestModel({
      products,
      totalAmount: totalAmount,
      finance: financeUser._id,
      username: userData.email,
    });

    await newRequest.save();
    const data = newRequest.products.map(item => ({ productId: item._id, name: item.product, quantity: item.quantity, unitPrice: item.price, totalPrice: item.totalprice }))
    const savedStocks = [];
    for (const stockData of data) {
      const newStock = new stockModel(stockData);
      const savedStock = await newStock.save();
      savedStocks.push(savedStock);
    }
    createEmailTable(newRequest, financeUser.email);
    res.status(201).json({
      message: "request is successfull",
      products: products,
      total: totalAmount,
    });
  } catch (error) { }
};

requestController.getAllRequest = async (req, res) => {
  try {
    const allRequests = await requestModel.find();

    res.status(200).json({
      requests: allRequests,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

requestController.updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { product, quantity, price } = req.body;

    const updatedData = {
      product,
      quantity,
      price,
      totalprice: quantity * price,
    };

    const updatedRequest = await requestModel.findByIdAndUpdate(
      requestId,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      message: "Request updated successfully",
      updatedRequest,
    });
    // console.log(updatedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

requestController.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    // console.log(requestId);
    await requestModel.findByIdAndDelete(requestId);

    res.status(200).json({
      message: "Request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

requestController.getOneRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const foundRequest = await requestModel.findById(requestId);

    if (!foundRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      request: foundRequest,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

requestController.approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, description } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }
    const updateFields = {};

    if (status) {
      updateFields.status = status;
    }

    if (description) {
      updateFields.description = description;
    }

    if (Object.keys(updateFields).length > 0) {
      const updateStatus = await requestModel.findByIdAndUpdate(
        { _id: requestId },
        { $set: updateFields },
        { new: true }
      );

      console.log(updateFields);

      if (updateFields.status === "approved") {
        const amount = updateStatus.totalAmount;
        const latestBalance = await account.findOne(
          {},
          {},
          { sort: { _id: -1 } }
        );
        if (latestBalance.balance < amount) {
          return res.status(404).json({ error: "Insuffience-amount" });
        }
        const payment = latestBalance.balance - amount;
        await account.create({
          name: updateStatus.username,
          moneyUsed: amount,
          description: "Request Approval",
          balance: payment,
        });
      }
      if (!updateStatus) {
        return res.status(404).json({ error: "Request not found" });
      }

      return res
        .status(200)
        .json({ message: "Request updated successfully", data: updateStatus });
    } else {
      return res.status(400).json({ error: "No fields to update" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = requestController;
