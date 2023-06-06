const Review = require("../models/ReviewModel");
const Order = require("../models/OrderModel");

exports.create = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        // Get the Order document
    const order = await Order.findOne({ user: userId });

    // Check if the productId matches any product in the Order
    const isProductInOrder = order.products.some(
      (product) => product.product.toString() === productId
    );

    if (!isProductInOrder) {
      return res.status(400).json({error: "Your are not eligible for this comment"});
    }
      const review = new Review({ ...req.body, product: productId,  user: userId });
        
      const reviewDoc = await review.save();
  
      res.status(200).json({
        success: true,
        message: `Your review has been added successfully and will appear when approved!`,
        review: reviewDoc
      });
    } catch (error) {
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
}

exports.allReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: '-photo -password' })
      .populate({ path: 'product', select: '-photo' })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Review.countDocuments();

    // Extracting product data from uniqueProducts array
    // const products = reviews.map(review => review.product);
    const products = [...new Set(reviews.map(review => review.product._id))]
  .map(productId => reviews.find(review => review.product._id === productId).product);

    res.status(200).json({
      reviews,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count,
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.',
    });
  }
};


  // Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { productId } = req.params;
    const review = await Review.find({ product: productId })
    .populate({ path: 'user', select: '-photo -password' })
    .populate({ path: 'product', select: '-photo' });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateReviewById = async (req , res) => {
  try {
    const userId = req.user._id;
    const { productId, reviewId } = req.params;
    const { rating, content } = req.body;
    const review = await Review.findOne({
      user: userId,
      _id: reviewId,
      product: productId,
    });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    review.rating = rating || review.rating;
    review.content = content || review.comment;
    await review.save();
    return res.status(200).json({ message: 'Review updated successfully' , review});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Review updated Failed' });
  }
}

// Delete a review by ID
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

