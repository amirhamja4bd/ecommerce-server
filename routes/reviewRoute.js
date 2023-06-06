const express = require('express');
const { create, allReviews, getReviewById, deleteReview, updateReview, updateReviewById } = require('../controllers/reviewController');
const { isSignIn } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/review/:productId", isSignIn, create);
router.get("/reviews", isSignIn, allReviews);
router.put("/review/:reviewId/:productId", isSignIn, updateReviewById);
router.get("/review/:productId", isSignIn, getReviewById);
router.delete("/review/:id", isSignIn, deleteReview);

module.exports = router;