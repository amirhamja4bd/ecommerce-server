const WishList = require("../models/WishListModel");

exports.create = async (req, res) => {
    try {
      const { product, isLiked } = req.body;
      const user = req.user;
      const update = { product, isLiked };
      
      const query = { product: update.product, user: user._id };

      const updatedWishlist = await WishList.findOneAndUpdate(query, update, { new: true });
      
      if (updatedWishlist !== null) {
        res.status(200).json({
          success: true,
          message: 'Your Wishlist has been updated successfully!',
          wishlist: updatedWishlist
        });
      } 
      else {
        const wishList = new WishList({ product, isLiked , user: user._id });
  
        const wishListDoc = await wishList.save();
  
        res.status(200).json({ success: true, message: `Added to your Wishlist successfully!`,  wishlist: wishListDoc });
      }
    } 
    catch (err) {
        return res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
    }
};

exports.list = async (req, res) => {
    try{
        const user = req.user._id;

    const wishlist = await WishList.find({ user, isLiked: true })
    .populate({ path: 'product', select: '-photo' })
    .populate({ path: 'user', select: '-photo -password' })
      .sort('-updatedAt')

    res.status(200).json({ wishlist }); }
    catch(error){
        res.status(400).json({ error: 'Your request could not be processed. Please try again.' });
    }
}

exports.findByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishListItems = await WishList.find({ product: productId });
    return res.status(200).json(wishListItems);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteWish = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWishList = await WishList.findByIdAndDelete(id);
    if (!deletedWishList) {
      return res.status(404).json({ message: 'WishItem not found' });
    }
    res.status(200).json({ message: 'WishItem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};