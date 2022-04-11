const express = require('express')
const { insertObject, getAll, deleteDocumentById, getDocumentById, updateDocument, } = require('../databaseHandler')
const router = express.Router()
const dbHandler = require("../databaseHandler");
const { ObjectId } = require("mongodb");
const async = require('hbs/lib/async');
router.use(express.static("public"));

//middleware
router.use((req, res, next) => {
    const { user } = req.session; //same as: user = req.session.user
    if (user) { //if have an account
        if (user.role == "Admin") { //if role = admin
            next("route"); //next to the same URL
        } else { res.sendStatus(404); }
    } else { //don't have an account
        res.redirect('/login');
    }
})


//neu request la: /admin
router.get('/', async (req, res) => {
    if (req.query.sortBy == "today") { //if user choose today
        res.redirect("/admin/today");
    } else if (req.query.sortBy == 'week') { //if user choose week
        res.redirect("/admin/week");
    } else {
        const customerOrder = await dbHandler.getAll("Customer Order") //get all database in Customer order and set is customerOrder
        customerOrder.forEach((element) => { //use loop in Customer Order 
            element.time = element.time.toLocaleString("vi"); //convert time to vietnam
            element.itemString = ""; //tao bien itemString de hien thi cac phan tu trong element (them item va amount)
            element.books.forEach(e => { //use loop in books in customerorder
                element.itemString += e.name + " - (" + e.qty + ")"; //display name + qty 
            })
        });
        res.render('adminPage', {
            customerOrder: customerOrder,//truyen vao adminPage giá trị của customerorder
            user: req.session.user//
        })
    // }
}})

router.get("/:sortBy", async (req, res, next) => { //sortby same tham số
    let result = await dbHandler.getAll("Customer Order");
    if (req.params.sortBy === "today") {
        let today = new Date().toLocaleDateString("vi");//lưu new Date.toLocaledatestring = today; today ở dạng stirng
        result = result.filter((item) => { //dùng filter cho biến result lọc ra các phần từ có đk là dòng 53. sau đó gán lại vào result
            item.itemString = "";
            item.books.forEach(e => {//tao bien itemString de hien thi cac phan tu trong element (them item va amount)
                item.itemString += e.name + " - (" + e.qty + ")";
            })
            return item.time.toLocaleDateString("vi") === today
        });
        result.forEach((element) => { //dùng loop cho tất cả result để hiển thị time theo dang string
            element.time = element.time.toLocaleString("vi");
        });
        res.render("adminPage", { customerOrder: result }); //truyền vào tất cả các result vừa được xử lý

    } else if (req.params.sortBy === "week") {
        let today = new Date(); //gán today bằng ngày hn
        let week = new Date(today.setDate(today.getDate() - 7)); //week = lấy (today.getDate -7) là dạng số. sau đó setDate lại về dạng thời gian
        result = result.filter((item) => { //item là 1 phần tử của result
            item.itemString = "";
            item.books.forEach(e => {//tao bien itemString de hien thi cac phan tu trong element (them item va amount)
                item.itemString += e.name + " - (" + e.qty + ")";
            })
            return item.time > week //dk ptu có điều kiện item > week
        });
        result.forEach((element) => {//dùng loop cho result sau đó chuyển element.time về dạng string theo keieur vn
            element.time = element.time.toLocaleString("vi");
        });
        res.render("adminPage", { customerOrder: result }); //truyền vào tất cả result vừa được xử lý
    }
    else if (req.params.sortBy === "delete") {//tham số sortby là delete
        let { id } = req.query; // same as: let id = req.query.id;
        let result = await dbHandler.deleteOne("Customer Order", { _id: ObjectId(id) });//dùng hàm deOne để xóa 1 document trong collection customer order
        if (result == null) { 
           res.send("Cancel error!"); 
        } else {
            res.redirect("/admin");
        }
    }
    else {
        next("route");
    }
});

router.get('/manageCustomer', async (req, res) => {
    result = await dbHandler.getAll("Users");
    const arr = result.filter((element) => {
        return element.role === 'Customer'
    });
    arr.forEach((element, index) => {
        element.index = index+1;
        delete element.password;
        delete element.role;
    })
    res.render('adminPage', { Customer: arr})//truyền vào property Customer với values =arr
    
})

// /deleteCustomer/abcxyz
router.get('/deleteCustomer/:id', async(req, res) => {
    await dbHandler.deleteDocumentById('Users', req.params.id);//dugf dDBI để xóa 1 doc với tham số là req.pấm.id
    res.redirect('/admin/manageCustomer')
    
})

router.get("/feedbackManage", async (req, res) => {
    let result = await dbHandler.getAllFeedback();
    res.render('adminPage', { feedback: result, user: req.session.user })//truyền vào
});

// /feedbackManage/delete?id=abcxyz
router.get('/feedbackManage/delete', async (req, res) => {
    await dbHandler.deleteDocumentById('Feedback', req.query.id);//dùng req.id để nhận id của doc truyền vào hàm delete
    res.redirect('/admin/feedbackManage');
})

router.get("/feedbackManage/:day", async (req, res, next) => {
    let result = await dbHandler.getAllFeedback();
    const today = new Date();
    if (req.params.day === "today") {
        result = result.filter((e) => {
            return new Date(e.time).toDateString() === today.toDateString();//chuyển e.time về string dạng ngày 
        });
        res.render("adminPage", {
            feedback: result,
            user: req.session.user,
        });
    } else if (req.params.day === "2days") {
        const queryDay = new Date(today.setDate(today.getDate() - 2));//setdate = getdate -2 
        result = result.filter((e) => new Date(e.time) > queryDay);
        res.render("adminPage", {
            feedback: result,
            user: req.session.user,
        });
    } else if (req.params.day === "2weeks") {
        const queryDay = new Date(today.setDate(today.getDate() - 14));
        result = result.filter((e) => new Date(e.time) > queryDay);
        res.render("adminPage", {
            feedback: result,
            user: req.session.user,
        });
    } else if (req.params.day === "2months") {
        const queryDay = new Date(today.setMonth(today.getMonth() - 2));
        result = result.filter((e) => new Date(e.time) > queryDay);
        res.render("adminPage", {
            feedback: result,
            user: req.session.user,
        });
    } else {
        next("route");
    }
});

router.get("/feedbackManage/specifyDay/:day", async (req, res) => {
    let result = await dbHandler.getAllFeedback();
    const specifyDay = new Date(req.params.day).toDateString();//chuyển tham số day về dáng tring
    result = result.filter((e) => new Date(e.time).toDateString() === specifyDay);
    res.render("adminPage", { feedback: result, user: req.session.user });
});

// router.get('/feedbackManage/bookName', async (req, res) =>{
//     let result = await dbHandler.getAllFeedback();
//     const arr = result.filter(element => {
//         return element.name === req.query.bookName;
//     })
//     res.render('adminPage', {feedback: arr})
// })

router.get("/feedbackManage/searchFeedback", async (req, res) => {
    const searchInput = req.query.bookName;
    const result = await dbHandler.searchObjectbyName("Feedback", searchInput)
    res.render('adminpage', {feedback: result})
  });





//neu request la: /admin/addUser
router.get('/addUser', (req, res) => {
    res.send("This is add user page!")
    // res.render('addUser')
})

//Submit add User
router.post('/addUser', (req, res) => {
    const name = req.body.txtName
    const role = req.body.Role
    const pass = req.body.txtPassword
    const objectToInsert = {
        userName: name,
        role: role,
        password: pass
    }
    insertObject("Users", objectToInsert)
    res.render('adminIndex')
})


router.get('/product', async (req, res) => {
    const book = await dbHandler.getAll("Book")

    res.render("Admin_Product", {book:book})
    
});
//addbook
router.get('/addbook', async (req, res)=> {
    res.render("AddBook")
})
router.post('/addbook', async (req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const Category = req.body.Category
    const CategoryID = await dbHandler.getDocumentByName("Category" , Category)
    const newBook = {name:nameInput, des:Description, price:Number.parseFloat(priceInput), pic:image, category:CategoryID._id}
    await dbHandler.insertObject("Book", newBook)
    res.redirect('/admin/product')
})
//delete book
router.get('/deletebook', async (req, res) => {
    const id = req.query.id
    console.log(id)
    await dbHandler.deleteDocumentById("Book", id)
    res.redirect('/admin/product')
})
//update book in product
router.get('/updatebook', async (req, res) => {
    const id = req.query.id
    const result = await getDocumentById(id,"Book")
    res.render('updatebook', {book:result})
})
router.post('/updatebook', async (req, res) => {
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const image = req.body.txtImage
    const Description = req.body.txtDescription
    const Category = req.body.Category
    const CategoryID = await dbHandler.getDocumentByName("Category" , Category)
    const UpdateValue = {$set: {name:nameInput, des:Description, price:Number.parseFloat(priceInput), pic:image, category:CategoryID._id}}
    const id = req.body.txtid
    console.log(UpdateValue)
    console.log(id)
    await dbHandler.updateDocument(id, UpdateValue,"Book")
    res.redirect('/admin/product')
})
//update profile for admin
router.get('/updateprofile', async (req, res)=>{
    const result = await dbHandler.getUser(req.session.user.name)
    res.render('Updateprofileadmin', {user:result})
})
router.post("/updateprofile", async (req,res)=>{
    const phone = req.body.txtPhone
    const fullName = req.body.txtName
    const email = req.body.txtEmail
    const user = await dbHandler.getUser(req.session.user.name)
    const updateValue = {$set: {userName: user.userName, email: email, Name: fullName, phone: phone, role: user.role, password: user.password}}
    await dbHandler.updateDocument(user._id, updateValue, "Users")
    res.redirect('/admin')
})

//update status shopping cart
router.post("/updatestatus", async (req,res)=>{
    const id = req.body.id
    const status = req.body.status
    const order = await dbHandler.getDocumentById(id,"Customer Order")
    order["Status"] = status
    const neworder = {$set:{user:order.user, books:order.books, totalPrice:order.totalPrice, time:order.time, Status:order.Status}}
    await dbHandler.updateDocument(id, neworder, "Customer Order")

    res.redirect('/admin')
})




// router.get("/admin", async (req, res) => {
//     let result = await dbHandler.getAll("Customer Order");
//     result.forEach((element) => (element.time = element.time.toLocaleString("vi")));
//     res.render("adminPage", { demo: result, next: true });
// });


router.get("/:sortBy", async (req, res, next) => {
    let result = await dbHandler.getAll("Customer Order");
    if (req.params.sortBy === "today") {
        let today = new Date().toLocaleDateString("vi");
        result = result.filter((item) => {
            return item.time.toLocaleDateString("vi") === today
        });
        result.forEach((element) => {
            element.time = element.time.toLocaleString("vi");
        });
        res.render("adminPage", { customerOrder: result });
    } else if (req.params.sortBy === "week") {
        let today = new Date();
        let week = new Date(today.setDate(today.getDate() - 7));
        result = result.filter((item) => item.time > week);
        result.forEach((element) => (element.time = element.time.toLocaleString("vi")));
        res.render("adminPage", { customerOrder: result });
    }
    else if (req.params.sortBy === "delete") {
        let { id } = req.query; // same as: let id = req.query.id;
        let result = await dbHandler.deleteOne("Customer Order", { _id: ObjectId(id) });
        if (result) {
            res.redirect("/admin");
        } else {
            res.send("Cancel error!");
        }
    }
    else {
        next("route");
    }
});

router.get('/manageCustomer', async (req, res) => {
    result = await dbHandler.getAll("Users");
    const arr = result.filter((element) => {
        return element.role === 'Customer'
    });
    arr.forEach((element, index) => {
        element.index = index+1;
        delete element.password;
        delete element.role;
    })
    res.render('adminPage', { Customer: arr})
    
})

router.get('/deleteCustomer/:id', async(req, res) => {
    console.log(req.params.id)
    await dbHandler.deleteDocumentById('Users', req.params.id);
    res.redirect('/admin/manageCustomer')
    
})
router.get('/deleteCustomer', async(req, res) => {
    res.send("deleteCustomer")
})



//view profile
exports.getProfile = async (req, res) => {
    let aTrainee = await trainee.findOne({ email: req.session.email })
    res.render('traineeProfileUpdate', { aTrainee: aTrainee, loginName: req.session.email });
}

//update profile
exports.updateProfile = async (req, res) => {
    let id = req.body.id;
    let aTrainee = await trainee.findById(id);
    if (req.file) {
        aTrainee.img = req.file.filename;
    }
    aTrainee.dateOfBirth = new Date(req.body.date);
    aTrainee.education = req.body.education;
    aTrainee = await aTrainee.save();
    res.redirect('/trainee');
}

module.exports = router;