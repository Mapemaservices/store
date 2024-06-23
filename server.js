const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// MongoDB connection

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
});

const soldItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  seller: String,
  time: String,
  paymentMode: String,
});

const Item = mongoose.model("Item", itemSchema);
const SoldItem = mongoose.model("SoldItem", soldItemSchema);

// Routes
app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post("/api/items", async (req, res) => {
  const newItem = new Item(req.body);
  await newItem.save();
  res.json(newItem);
});

app.put("/api/items/:id", async (req, res) => {
  const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedItem);
});

app.delete("/api/items/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted" });
});

app.post("/api/items/:id/sell", async (req, res) => {
  const qty = req.body.quantity;
  const item = await Item.findById(req.params.id);
  if (item && item.quantity > 0) {
    item.quantity -= qty;
    await item.save();

    const soldItem = new SoldItem({
      name: item.name,
      quantity: req.body.quantity,
      price: item.price,
      seller: req.body.seller,
      time: new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
      paymentMode: req.body.paymentMode,
    });
    await soldItem.save();

    res.json(item);
  } else {
    res.status(400).json({ message: "Item not available or out of stock" });
  }
});

app.get("/api/sold-items", async (req, res) => {
  const soldItems = await SoldItem.find();
  res.json(soldItems);
});
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
};

connectDB();
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
