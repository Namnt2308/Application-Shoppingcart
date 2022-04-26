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
    if (orderDB == null )  {
      res.redirect("/");
    }
    const tax = orderDB.totalPrice / 100;
    const Total = orderDB.totalPrice + tax;
    res.render("CheckOut", { books: orderDB, tax: tax, Total: Total });
  });
  router.post("/pay", async (req, res) => {
    const id = req.body.userOrder;
    const newTotal = Number.parseFloat(req.body.totalPrice);
    let date = new Date();
    const orderDB = await dbHandler.getDocumentById(id, "Order");
    orderDB["time"] = date;
    orderDB["Status"] = "Confirming";
    orderDB["totalPrice"] = newTotal;
    await dbHandler.insertObject("Customer Order", orderDB);
    await dbHandler.deleteDocumentById("Order", id);
    req.session["cart"] = null;
    res.redirect("/shoppingCart/viewCart");
  });
  router.get("/productOder", async (req, res) => {
    const orderID = req.query.orderID;
    const orderP = await dbHandler.getDocumentById(orderID, "Customer Order");
    console.log(orderP, req.session.user);
    res.render("productOder", {
      user: req.session.user,
      orderP: orderP,
    });
  });
  router.get("/viewProfile", async (req, res) => {
    const user = await dbHandler.getUser(req.session.user.name);
    res.render("profile", { user: user });
});
router.get("/Pushase", async (req, res) => {
  const orderDB = await dbHandler.searchOderByUser(
    "Customer Order",
    req.session.user.name
  );
  console.log(orderDB, req.session.user);
  res.render("Pushase", {
    user: req.session.user,
    orderDB: orderDB,
  });
});

router.get("/updateProfile", async (req, res) => {
    const user = await dbHandler.getUser(req.session.user.name);
    res.render("UpDateProfile", { user: user });
  });
