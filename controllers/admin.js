const express = require('express')
const { insertObject, getAll,SortdownPrice, deleteDocumentById, getDocumentById, updateDocument, } = require('../databaseHandler')
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
})


router.get('/deleteCustomer/:id', async(req, res) => {
    console.log(req.params.id)
    await dbHandler.deleteDocumentById('Users', req.params.id);
    res.redirect('/admin/manageCustomer')
    
})
router.get('/deleteCustomer', async(req, res) => {
    res.send("deleteCustomer")
})


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
//add category
router.get('/addcategory',async (req, res)=>{
    res.render("AddCategory")
})
router.post('/addcategory', async (req, res) => {
    const nameInput = req.body.txtName
    const newCategory = {name:nameInput}
    await dbHandler.insertObject("Category", newCategory)
    res.redirect('/admin/category')
})
router.get('/category', async (req, res) => {
    const category = await dbHandler.getAll("Category")

    res.render("Admin_Category", {category:category})
    
});
// edit category
router.get('/updatecategory', async (req, res) => {
    const id = req.query.id
    const result = await getDocumentById(id,"Category")
    
    res.render('updatecategory', {category:result})
})
router.post('/updatecategory', async (req, res) => {
    const nameInput = req.body.txtName
    const id = req.body.txtid
    const UpdateName = {$set: {name:nameInput}}

    await dbHandler.updateDocument(id, UpdateName,"Category")
    res.redirect('/admin/category')
})

//delete category
router.get('/deletecategory', async (req, res) => {
    const id = req.query.id
    console.log(id)
    await dbHandler.deleteDocumentById("Category", id)
    res.redirect('/admin/category')
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

router.get('/sapxeptang',async (req,res)=> {
    const sapxep = await dbHandler.SortupPrice("Book")
    res.render('Admin_Product',{book: sapxep})
})
router.get('/sapxepgiam',async (req,res)=>{
    const sapxep= await dbHandler.SortdownPrice("Book")
    res.render('Admin_Product',{book: sapxep})
})
router.get('/deleteCustomer/:id', async(req, res) => {
    console.log(req.params.id)
    await dbHandler.deleteDocumentById('Users', req.params.id);
    res.redirect('/admin/manageCustomer')
    
})
router.post('/search', async (req, res) => {
    const searchText =req.body.txtName;
    const result = await dbHandler.dosearch(searchText,"Book")
    res.render('Admin_Product',{book:result})
})

module.exports = router;