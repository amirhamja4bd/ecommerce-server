const fs =require("fs");
const slugify =require("slugify");
const Product = require("../models/ProductModel");
const mongoose = require("mongoose");

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

exports.duplicate = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ error: "Product not found" });
    }
    // create duplicate product
    const newProduct = new Product({
      ...product.toObject(),
      _id: mongoose.Types.ObjectId(),
      slug: slugify(product.title) + "-" + Math.random().toString(36).substring(7), sku: product.sku + Math.floor(Math.random() * 99),
      status: "Published",
    });
    // save duplicate product
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

//Product List
exports.list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate({ path: "category", select: "-photo" })
      .populate({ path: "brand", select: "-photo" })
      .select("-photo")
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
      .populate({ path: "category", select: "-photo" })
      .populate({ path: "brand", select: "-photo" })

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

// Product Update
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
exports.filterProducts = async (req, res) => {
try {
  const {  page, perPage, } = req.query;
  const { minPrice, maxPrice, category, brand, bestSell, sort, keyword} = req.body;

  const filter = {};
  if (minPrice && maxPrice) {
    filter.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
  } 
  else if (minPrice) {
    filter.price = { $gte: parseInt(minPrice) };
  } 
  else if (maxPrice) {
    filter.price = { $lte: parseInt(maxPrice) };
  }
  // if (category && Array.isArray(category)) {
  //   filter.category = { $in: category };
  // } else if (category) {
  //   filter.category = category;
  // }
  if (category.length > 0) {
    filter.category = {$in: category}
  };
  if (brand.length > 0) {
    filter.brand = {$in: brand}
  };
  if (bestSell) {
    filter.sold = { $gte: 10 }; // Display products that have sold at least 10 units.
  }
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  if (sort === 'price_asc') {
    sortOptions.price = 1;
  } else if (sort === 'price_desc') {
    sortOptions.price = -1;
  } else if (sort === 'date_asc') {
    sortOptions.createdAt = 1;
  } else if (sort === 'date_desc') {
    sortOptions.createdAt = -1;
  } else if (sort === 'popular_product') {
    sortOptions.sold = -1;
  }

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / perPage);

  const products = await Product.find(filter)
    .select("-photo")
    .populate({ path: "category", select: "-photo" })
    .populate({ path: "brand", select: "-photo" })
    .sort(sortOptions)
    .skip((page - 1) * perPage)
    .limit(perPage);

    console.log("product",products)
  res.json({ products, totalPages });
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
};

// Products Filtered
exports.filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let filter = {};
  if (checked.length > 0) {filter.category = {$in: checked}};
    if (radio.length) filter.price = { $gte: radio[0], $lte: radio[1] };

    const products = await Product.find(filter)
    .populate("category")
    .populate("brand")
    console.log( products.length);

    res.json(products);
  } 
  catch (err) {
    console.log(err);
  }
};

// List Products
exports.listProducts = async (req, res) => {
  try {
    const perPage = 8;
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