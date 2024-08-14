const Checkout = require("../models/cartModel");
const Item = require("../models/itemModel");

// Handle checkout
exports.checkout = async (req, res) => {
  const { cartItems, date, time, totalAmount, buyerName } = req.body;

  if (!cartItems || !date) {
    return res
      .status(400)
      .json({ message: "Cart items and date are required" });
  }

  try {
    // Save the entire checkout session to the database
    const newCheckout = new Checkout({
      cartItems,
      date,
      time,
      totalAmount,
      buyerName,
    });
    await newCheckout.save();

    // Remove the cart items from the items collection and update quantities
    for (const cartItem of cartItems) {
      const item = await Item.findOne({ "cart._id": cartItem._id });
      if (item) {
        // Deduct quantities based on size and color
        const size = item.sizes.find((s) => s.size === cartItem.size);
        if (size) {
          const color = size.colors.find((c) => c.color === cartItem.color);
          if (color) {
            color.quantity -= cartItem.quantity;
            if (color.quantity < 0) {
              color.quantity = 0;
            }
          }
        }

        // Deduct quantities based on category
        const category = item.category.find(
          (c) => c.category === cartItem.category
        );
        if (category) {
          category.quantity -= cartItem.quantity;
          if (category.quantity < 0) {
            category.quantity = 0;
          }
        }

        // Save the updated item
        await item.save();

        // Remove the cart item from the cart array
        await Item.updateOne(
          { "cart._id": cartItem._id },
          { $pull: { cart: { _id: cartItem._id } } }
        );
      }
    }

    res.status(200).json({
      message: "Checkout successful and cart cleared, quantities updated",
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Error during checkout", error });
  }
};

// Get Report By Date
exports.getReportByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const checkouts = await Checkout.find({ date });
    res.status(200).json(checkouts);
  } catch (error) {
    console.error("Error fetching report by date:", error);
    res.status(500).json({ message: "Error fetching report by date", error });
  }
};

// Delete a checkout record by ID
exports.deleteCheckoutData = async (req, res) => {
  const { id } = req.params;

  try {
    const checkout = await Checkout.findById(id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout record not found" });
    }

    // Remove cart items from the Item collection
    for (const cartItem of checkout.cartItems) {
      const item = await Item.findOne({ "cart._id": cartItem._id });
      if (item) {
        // Deduct quantities based on size and color
        const size = item.sizes.find((s) => s.size === cartItem.size);
        if (size) {
          const color = size.colors.find((c) => c.color === cartItem.color);
          if (color) {
            color.quantity += cartItem.quantity;
          }
        }

        // Deduct quantities based on category
        const category = item.category.find(
          (c) => c.category === cartItem.category
        );
        if (category) {
          category.quantity += cartItem.quantity;
        }

        // Save the updated item
        await item.save();
      }
    }

    // Delete the checkout record
    await Checkout.findByIdAndDelete(id);

    res.status(200).json({ message: "Checkout record deleted successfully" });
  } catch (error) {
    console.error("Error deleting checkout record:", error);
    res.status(500).json({ message: "Error deleting checkout record", error });
  }
};
