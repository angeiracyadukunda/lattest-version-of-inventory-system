const express = require("express");
const mongoose = require("mongoose");
const userController = express();
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signUpSchema = require("../utils/user.validate");
const { sendWelcomeEmail, sendOTPEmail } = require("../services/email.service");
const { StatusCodes } = require("http-status-codes");

const {
  findUserByUsername,
  generateRandomPassword,
} = require("../services/app.services");

userController.signUp = async (req, res, next) => {
  try {
    const { error, value } = signUpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { username, email, password } = value;
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with the provided username or email already exists",
      });
    }
    const newPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: newPassword,
    });
    sendWelcomeEmail(email, username, password);
    return res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
  }
};

userController.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        const token = await jwt.sign(
          { email: user.username, role: user.role },
          "SECRET"
        );
        req.user = token;
        res.status(200).json({ token });
      } else {
        res.status(400).json({ error: "password doesn't match" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    console.log(error);
  }
};

userController.getUsers = (req, res) => {
  console.log(req.user);
  return res.status(200).json({ user: "" });
};

userController.resetPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const newPassword = await generateRandomPassword();
    console.log(newPassword);
    const hashPassword = await bcrypt.hash(newPassword, 10);

    const updatedPassword = await userModel.findByIdAndUpdate(
      user.id,
      { $set: { password: hashPassword } },
      { new: true }
    );
    await sendOTPEmail(user.email, user.username, newPassword);
    return res
      .status(201)
      .json({ message: "Password updated check your email for new password" });
  } catch (error) {}
};
userController.getUsers = async (req, res, next) => {
  try {
    const allUsers = await userModel.find();
    res.status(200).json({ message: "Available Users", allUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
userController.deleteUser = async (req, res, next) => {
  try {
    const id = req.query._id;
    console.log(id);
    const deleteduser = await userModel.findByIdAndDelete(id);
    if (deleteduser) {
      res.status(200).json({ message: "User deleted seccessufully" });
    }
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

userController.updatePassword = async (req, res, next) => {};


userController.addUser = async (req, res, next) => {
  try {
    console.log(req.body)
    const { error, value } = signUpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { username, email, password, role} = value;
   
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with the provided username or email already exists",
      });
    }
    const newPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: newPassword,
      role:role
    });
    sendWelcomeEmail(email, username,password);
    return res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
  }
};
module.exports = userController;
