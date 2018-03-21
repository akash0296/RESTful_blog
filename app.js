var bodyParser          =   require("body-parser"),
    mongoose            =   require("mongoose"),
    express             =   require("express"),
    expressSanitizer    =   require("express-sanitizer"),
    methodOverride      =   require("method-override"),
    app                 =   express();

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
        res.render("index", {allBlogs: allBlogs});
    }
});
});


//NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new")
});


//CREATE NEW BLOG POST.
app.post("/blogs", function(req, res){
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
app.get("/blogs/:id/edit", function(req, res){
    blog.findById(req.params.id, function(error, foundPost){
        if(error){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundPost});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function(error, updaedPost){
        if(error){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
});

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