const express = require("express");

const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

router.get("/", async (req, res) => {
  const truyen = await dbHandler.searchObjectbyCategory(
    "Book",
    "61e570c7ba41b21dee1346b3"
  );
  const ITbook = await dbHandler.searchObjectbyCategory(
    "Book",
    "61e570ddba41b21dee1346b4"
  );
  const hotBook = await dbHandler.searchHotBooks();

  if (!req.session.user) {
    res.render("index", { truyens: truyen, ITbooks: ITbook, hotBook: hotBook });
  } else {
    res.render("index", {
      truyens: truyen,
      ITbooks: ITbook,
      hotBook: hotBook,
      user: req.session.user,
    });
  }
});