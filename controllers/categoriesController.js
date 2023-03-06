const Category = require("../models/CategoryModel");
const fs =require("fs");
const slugify =require("slugify");
const Product = require("../models/ProductModel");


exports.create = async (req, res) => {
  try {
    const { name } = req.fields;
    const { photo } = req.files;
    const email = req.user['email'];
    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }
    if (photo && photo.size > 1000000) {
      return res.json({ error: "Image should be less than 1mb in size" });
    }

    const slug = slugify(name) + '-' + Math.random().toString(36).substring(7);

    const category =  new Category({...req.fields, email: email, slug })
    if (photo) {
      category.photo.data = fs.readFileSync(photo.path);
      category.photo.contentType = photo.type;      
    }
    await category.save();
    res.json(category);
  } 
  catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
};

exports.list = async (req, res) => {
  try {
    const all = await Category.find({});
    res.json(all);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

exports.read = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    res.json(category);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

// category Photo
exports.photo = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId).select(
      "photo"
    );
    if (category.photo.data) {
      res.set("Content-Type", category.photo.contentType);
      res.set("Cross-Origin-Resource-Policy", "cross-origin")
      return res.send(category.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.fields;
    const { photo } = req.files || null;
    const { categoryId } = req.params;
    const slug = slugify(name) + '-' + Math.random().toString(36).substring(4);
    const category = await Category.findByIdAndUpdate( categoryId, {
      ...req.fields, slug }, { new: true } );
    if (photo) {
      category.photo.data = fs.readFileSync(photo.path);
      category.photo.contentType = photo.type;      
    }
    await category.save();
    res.json(category);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

exports.remove = async (req, res) => {
    try {
      const removed = await Category.findByIdAndDelete(req.params.categoryId);
      res.json(removed);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err.message);
    }
};

exports.productsByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    const products = await Product.find({ category }).populate("category").select("-photo");

    res.json({ category, products, });
  } catch (err) {
    console.log(err);
  }
};
