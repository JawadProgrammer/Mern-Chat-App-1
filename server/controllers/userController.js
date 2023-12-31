import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import validator from "validator";

export const register = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Required Fields",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please Valid Email Address",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(401).json({
      success: false,
      message: "Email Not Available",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user);

  // res.cookie("token", token, { path: "/", secure: true });

  return res.status(201).json({
    success: true,
    message: "Register Successfully",
    user,
    token,
  });
});

export const login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Please Provide Required Fields",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please Valid Email Address",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({
      success: false,
      message: "Email Not Registered",
    });
  }

  const isPasswordValid = await user.matchPasswords(password);

  if (!isPasswordValid) {
    res.status(400).json({
      success: false,
      message: "Invalid Email OR Password",
    });
  }

  const token = generateToken(user);

  // res.cookie("token", token, { path: "/", secure: true });

  res.status(200).json({
    success: true,
    message: "Login Successfully",
    user,
    token,
  });
});

export const logout = expressAsyncHandler(async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
});

export const getProfile = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User Not Found",
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export const getOnlinePeople = expressAsyncHandler(async (req, res) => {
  const users = await User.find({}, { _id: 1, name: 1, email: 1, image: 1 });
  res.json(users);
});
