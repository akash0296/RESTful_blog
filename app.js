var bodyParser          =   require("body-parser"),
    mongoose            =   require("mongoose"),
    express             =   require("express"),
    expressSanitizer    =   require("express-sanitizer"),
    methodOverride      =   require("method-override"),
    app                 =   express(),
    currentUser;
    
var  passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

//APP CONFIG.
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

mongoose.connect("mongodb://odin:mindfreak2@ds121189.mlab.com:21189/blog_app");
// mongoose.connect("mongodb://localhost/restful_blog_app");
// mongodb://odin:mindfreak2@ds121189.mlab.com:21189/blog_app

//MONGOOSE/MODEL CONFIG.
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var blog = mongoose.model("Blog", blogSchema);

//AUTH SETUP
var userShema = new mongoose.Schema({
    username: String,
    password: String
});
userShema.plugin(passportLocalMongoose);
var User = mongoose.model("User", userShema);

app.use(require("express-session")({
    secret: "Secret is out",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//PASSING req.user TO ALL THE ROUTES/NAVBAR
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

//SHOW SIGNUP FORM
app.get("/register", function(req, res) {
    res.render("register");
});

//REGISTER ROUTE
app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
           return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/blogs");
        });
    });
});


//SHOW LOGIN FORM
app.get("/login", function(req, res) {
    res.render("login");
});

//LOGIN ROUTE
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/blogs",
        failureRedirect: "/login"
        
    }), function(req, res) {
});


//LOGOUT
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/blogs");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}



//RESTFUL ROUTES.
app.get("/", function(req, res){
    res.redirect("/blogs");
    
});


//INDEX RPUTE
app.get("/blogs", function(req, res){
    blog.find({}, function(error, allBlogs){
    if(error){
        console.log(error);
    }else{
        res.render("index", {allBlogs: allBlogs, currentUser: req.user});
    }
});
});


//NEW ROUTE
app.get("/blogs/new", isLoggedIn, function(req, res){
    res.render("new", {currentUser: req.user})
});


//CREATE NEW BLOG POST.
app.post("/blogs", isLoggedIn, function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.create(req.body.blog, function(error, newBlog){
        if(error){
            console.log(error);
        }else{
            console.log(newBlog);
            res.redirect("/blogs");
        }
    });
});

//SHOW MORE INFO.
app.get("/blogs/:id", function(req, res){
    blog.findById(req.params.id, function(error, foundBlog){
        if(error){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
    
});


//EDIT POST ROUTE
// app.get("/blogs/:id/edit", function(req, res){
//     blog.findById(req.params.id, function(error, foundPost){
//         if(error){
//             res.redirect("/blogs");
//         }else{
//             res.render("edit", {blog: foundPost});
//         }
//     });
// });

// //UPDATE ROUTE
// app.put("/blogs/:id", function(req, res){
//     req.body.blog.body = req.sanitize(req.body.blog.body);
//     blog.findByIdAndUpdate(req.params.id, req.body.blog, function(error, updaedPost){
//         if(error){
//             res.redirect("/blogs");
//         }else{
//             res.redirect("/blogs/" + req.params.id);
//         }
//     });
    
// });

// //DELETE ROUTE
// app.delete("/blogs/:id", function(req, res){
//     //DESTROY BLOGPOST
//     blog.findByIdAndRemove(req.params.id, function(error, blogRemoved){
//         if(error){
//             console.log(error);
//             res.redirect("/blogs");
//         }else{
//             res.redirect("/blogs");
//         }
//     })
    
// });


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("BLOG IS LIVE");
});