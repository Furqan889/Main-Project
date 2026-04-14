let selectedSize = "";

const buttons = document.querySelectorAll(".size-btn");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSize = btn.innerText;
  });
});

function addToCart() {
  if (!selectedSize) {
    alert("Please select a size!");
    return;
  }

  document.getElementById("selected-size").innerText =
    "Added to cart (Size: " + selectedSize + ")";
}
function addToCart(productName, price, size) {
  if (!size) {
    alert("Please select a size!");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const product = {
    id: Date.now(),
    name: productName,
    price: price,
    size: size,
    quantity: 1
  };

  // Check if same product + size already exists
  const existing = cart.find(item => 
    item.name === productName && item.size === size
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to cart!");
  function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("total");

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>Size: ${item.size}</p>
        <p>Price: $${item.price}</p>
        <p>
          Quantity: 
          <button onclick="changeQty(${index}, -1)">-</button>
          ${item.quantity}
          <button onclick="changeQty(${index}, 1)">+</button>
        </p>
        <button onclick="removeItem(${index})">Remove</button>
        <hr>
      </div>
    `;
  });

  totalDisplay.innerText = "Total: $" + total;
}

function changeQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

loadCart();
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("total");

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>Size: ${item.size}</p>
        <p>Price: $${item.price}</p>
        <p>
          Quantity: 
          <button onclick="changeQty(${index}, -1)">-</button>
          ${item.quantity}
          <button onclick="changeQty(${index}, 1)">+</button>
        </p>
        <button onclick="removeItem(${index})">Remove</button>
        <hr>
      </div>
    `;
  });

  totalDisplay.innerText = "Total: $" + total;
}

function changeQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

loadCart();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");

// User Schema
const User = mongoose.model("User", {
  email: String,
  password: String,
  cart: Array
});

// 🔐 Register
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    password: hashed,
    cart: []
  });

  await user.save();
  res.send("User created");
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: user._id }, "secretkey");
  res.json({ token });
});

// Middleware
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch {
    res.status(400).send("Invalid token");
  }
}

// 🛒 Add to cart
app.post("/cart/add", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  user.cart.push(req.body);
  await user.save();

  res.send(user.cart);
});

// 📦 Get cart
app.get("/cart", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.send(user.cart);
});

app.listen(3000, () => console.log("Server running on port 3000"));