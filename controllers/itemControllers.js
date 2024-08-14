const Item = require("../models/itemModel");
const cloudinary = require("cloudinary").v2;

// Create a new item
exports.createItem = async (req, res) => {
  const { name, sizes, category } = req.body;
  const { file } = req;

  let imageUrl; // Define imageUrl and publicId outside the try block
  let publicId;

  // Check if the item already exists
  const existingItem = await Item.findOne({ name });
  if (existingItem) {
    return res.status(404).send({
      success: false,
      message: "Item with this name already exists, please use another name",
    });
  }

  const newItem = new Item({
    name,
    sizes: JSON.parse(sizes), // Assuming sizes is sent as a JSON string
    category: JSON.parse(category),
  });

  try {
    if (file) {
      const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
        folder: "sales-preset", // Specify the folder where you want to store the image
      });
      imageUrl = cloudinaryResponse.secure_url;
      publicId = cloudinaryResponse.public_id;
      newItem.image = { url: imageUrl, public_id: publicId };
    }

    await newItem.save();

    res.json({
      message: "Item created successfully",
      item: {
        id: newItem._id,
        name,
        sizes: newItem.sizes,
        category: newItem.category,
        image: newItem.image,
      },
    });
  } catch (error) {
    // If there was an error, delete the uploaded image from Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
  const { id } = req.params;
  const { size, color, category, quantity, totalPrice } = req.body;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    let cartItem;

    if (size && color) {
      const selectedSize = item.sizes.find((s) => s.size === size);
      if (!selectedSize) {
        return res
          .status(404)
          .json({ message: "Selected size not available for this item" });
      }

      const selectedColor = selectedSize.colors.find((c) => c.color === color);
      if (!selectedColor) {
        return res
          .status(404)
          .json({ message: "Selected color not available for this size" });
      }

      if (selectedColor.quantity < quantity) {
        return res
          .status(400)
          .json({ message: "Selected quantity exceeds available stock" });
      }

      cartItem = {
        name: item.name,
        size: selectedSize.size,
        color: selectedColor.color,
        quantity,
        totalPrice,
      };
    } else if (category) {
      const selectedCategory = item.category.find(
        (cat) => cat.category === category
      );
      if (!selectedCategory) {
        return res
          .status(404)
          .json({ message: "Selected category not available for this item" });
      }

      if (selectedCategory.quantity < quantity) {
        return res
          .status(400)
          .json({ message: "Selected quantity exceeds available stock" });
      }

      cartItem = {
        name: item.name,
        category: selectedCategory.category,
        quantity,
        totalPrice,
      };
    } else {
      return res.status(400).json({ message: "Invalid item selection" });
    }

    // Add cart item to user's cart
    item.cart.push(cartItem);
    await item.save();

    res.status(200).json(item.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeItemFromCart = async (req, res) => {
  const { itemId } = req.params; // itemId to identify which cart item to remove

  try {
    const item = await Item.findOneAndUpdate(
      { "cart._id": itemId },
      { $pull: { cart: { _id: itemId } } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};

// Controller to get cart items
exports.getCartItems = async (req, res) => {
  try {
    const items = await Item.find();
    const cartItems = items.map((item) => item.cart);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCartItemsCount = async (req, res) => {
  try {
    const items = await Item.find();
    const cartItems = items.flatMap((item) => item.cart); // Flatten the cart items
    const cartItemCount = cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    ); // Count total quantity of items in the cart
    res.status(200).json({ cartItems, cartItemCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Items
exports.updateItem = async (req, res) => {
  const { name, sizes, category } = req.body;
  const { id } = req.params;

  const { file } = req;

  try {
    const item = await Item.findById(id);

    // Update image if file is provided
    if (file) {
      if (item.image && item.image.public_id) {
        // If there is a previous image, delete it from Cloudinary
        await cloudinary.uploader.destroy(item.image.public_id);
      }
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: "sales_preset" } // Specify the folder where you want to store the image
      );
      item.image = { url, public_id };
    }

    // Update the other fields
    if (name) item.name = name;
    if (sizes) item.sizes = JSON.parse(sizes);
    if (category) item.category = JSON.parse(category);

    // Save the updated item
    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {
    // Find the item by ID
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete the image from Cloudinary if it exists
    if (item.image && item.image.public_id) {
      await cloudinary.uploader.destroy(item.image.public_id);
    }

    // Delete the item from the database
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Delete successful",
      item,
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
