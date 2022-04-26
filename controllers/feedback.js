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