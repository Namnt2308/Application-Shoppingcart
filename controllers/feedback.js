const express = require('express');
const router = express.Router();
const dbHandler = require('../databaseHandler');

// Middleware
router.use((req, res, next) => {
    if (req.session.user == null) {
        res.redirect("/login");
    } else {
        if (req.session.user.role == 'Customer') {
            next();
        }
        else {
            res.redirect("/admin");
        }
    }
})

router.get("/", async (req, res) => {
    const result = await dbHandler.getAll("Feedback");
    id=req.query.id;
    info= await dbHandler.getDocumentById(id,"Book");

    res.render("feedback", {info:info, list:result}); 
});