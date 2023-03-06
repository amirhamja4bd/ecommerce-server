
const slugify =require("slugify");
const Brand = require("../models/BrandModel");
const fs =require("fs");

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

    const brand = new Brand({ ...req.fields, email: email , slug })
    if (photo) {
      brand.photo.data = fs.readFileSync(photo.path);
      brand.photo.contentType = photo.type;      
    }
    await brand.save();
    res.json(brand);
  } 
  catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
};


exports.list = async (req, res) => {
  try {
    const all = await Brand.find({});
    res.json(all);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};


exports.read = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });
    res.json(brand);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

// brand Photo
exports.photo = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.brandId).select(
      "photo"
    );
    if (brand.photo.data) {
      res.set("Content-Type", brand.photo.contentType);
      res.set("Cross-Origin-Resource-Policy", "cross-origin")
      return res.send(brand.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.fields;
    const { photo } = req.files || null;
    const { brandId } = req.params;
    const slug = slugify(name) + '-' + Math.random().toString(36).substring(4);
    const brand = await Brand.findByIdAndUpdate( brandId, {
      ...req.fields, slug }, { new: true } );
    if (photo) {
      brand.photo.data = fs.readFileSync(photo.path);
      brand.photo.contentType = photo.type;      
    }
    else{

    }
    await brand.save();
    res.json(brand);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};


exports.remove = async (req, res) => {
    try {
      const removed = await Brand.findByIdAndDelete(req.params.brandId);
      res.json(removed);
    } catch (err) {
      console.log(err);
      return res.status(400).json(err.message);
    }
  };