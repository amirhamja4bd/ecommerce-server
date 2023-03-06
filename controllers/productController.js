const fs =require("fs");
const slugify =require("slugify");
const Product = require("../models/ProductModel");

// Product Create
exports.create = async (req, res) => {
  try {
    console.log(req.fields);
    console.log(req.files);
    const { title, description, quantity, category, price } =
      req.fields;
    const { photo } = req.files;
    const email = req.user['email'];

    // validation
    switch (true) {
      case !title.trim():
        return res.json({ error: "Title is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !category.trim():
        return res.json({ error: "Category is required" });
      case !quantity.trim():
        return res.json({ error: "Quantity is required" });
      case !price.trim():
        return res.json({ error: "Price is required" });
      
      case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
    }

    // create product
    const slug = slugify(title) + '-' + Math.random().toString(36).substring(7);
    const product = new Product({ ...req.fields, email: email , slug });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;      
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

//Product List
exports.list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .populate("brand")
      .select("-photo")
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

// Product Read
exports.read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category")
      .populate("brand")

    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

// Product Photo
exports.photo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      res.set("Cross-Origin-Resource-Policy", "cross-origin")
      return res.send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

// Product Create
exports.update = async (req, res) => {
  try {
    const { title, description, quantity, category, price } = req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !title.trim():
        return res.json({ error: "Title is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !category.trim():
        return res.json({ error: "Category is required" });
      case !quantity.trim():
        return res.json({ error: "Quantity is required" });
      case !price.trim():
        return res.json({ error: "Price is required" });
      
      case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
    }

    // create product
    const slug = slugify(title) + '-' + Math.random().toString(36).substring(7);
    const product = await Product.findByIdAndUpdate( req.params.productId, { ...req.fields, slug },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;      
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

// Product remove
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete( req.params.productId
    ).select("-photo");
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

// Products Filter
exports.filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.unitPrice = { $gte: radio[0], $lte: radio[1] };

    const products = await Product.find(args);
    console.log("filtered products query => ", products.length);

    res.json(products);
  } 
  catch (err) {
    console.log(err);
  }
};

// List Products
exports.listProducts = async (req, res) => {
  try {
    const perPage = 1;
    const page = req.params.page ? req.params.page : 1;

    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

//Product Count
exports.productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    res.json(total);
  } catch (err) {
    console.log(err);
  }
};

// Product Search
exports.productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    res.json(results);
  } catch (err) {
    console.log(err);
  }
};

// Related Products
exports.relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    const related = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .populate("brand")
      .limit(4);

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};