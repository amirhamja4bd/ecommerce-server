const express = require('express');
const { create, allReviews, getReviewById, deleteReview } = require('../controllers/reviewController');
const { isSignIn } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/review", isSignIn, create);
router.get("/reviews", isSignIn, allReviews);
router.get("/review/:productId", isSignIn, getReviewById);
router.delete("/review/:id", isSignIn, deleteReview);

module.exports = router;