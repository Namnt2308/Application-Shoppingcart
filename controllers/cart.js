const express = require("express");
const async = require("hbs/lib/async");
const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

router.use((req, res, next) => {
  console.log(req.session);
  const { user } = req.session;
  if (user) {
    if (user.role == "Customer") {
      next("route");
    } else {
      res.sendStatus(404);
    }
  } else {
    res.redirect("/login");
  }
});
router.get("/viewCart", async (req, res) => {
    const cart = req.session["cart"];
    if (cart) {
      res.render("ShoppingCart", { order: cart, user: req.session.user });
    } else {
      const orderDB = await dbHandler.getCart(req.session.user.name);
      if (orderDB == null) {
        res.redirect("/");
      } else {
        res.render("ShoppingCart", { order: orderDB, user: req.session.user });
      }
    }
  });
  router.get("/payCart", async (req, res) => {
    const orderDB = await dbHandler.getCart(req.session.user.name);
    if (orderDB == null) {
      res.redirect("/");
    }
    const tax = orderDB.totalPrice / 100;
    const Total = orderDB.totalPrice + tax;
    res.render("CheckOut", { books: orderDB, tax: tax, Total: Total });
  });

