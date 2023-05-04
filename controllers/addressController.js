const Address = require("../models/AddressModel");
const fs =require("fs");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.createAddress = async (req, res) => {
  try {
    const user = req.user;
    const address = new Address({ ...req.body, user: user._id });
    await address.save();
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find();
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const id  = req.user._id;
    const address = await Address.find({ user: id })
      .populate({ path: 'user', select: '-photo  -password' });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.getAddressById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const address = await Address.find({ user: id })
//     if (!address) {
//       return res.status(404).json({ message: 'Address not found' });
//     }
//     res.status(200).json(address);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate( req.params.id , req.body, { new: true });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ address });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};