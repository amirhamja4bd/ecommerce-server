const Review = require("../models/ReviewModel");

exports.create = async (req, res) => {
    try {
        const user = req.user;
    
        const review = new Review({ ...req.body,  user: user._id });
    
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

// all reviews 
exports.allReviews = async (req, res) => {
    try {
      const { page = 1, limit = 5 } = req.query;
  
      const reviews = await Review.find({})
        .sort({createdAt: -1})
        .populate({ path: 'user', select: '-photo -password' })
        .populate({ path: 'product', select: '-photo' })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
  
      const count = await Review.countDocuments();
  
      res.status(200).json({
        reviews,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        count
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  };

  // Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { productId } = req.params;
    const review = await Review.find({ product: productId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

