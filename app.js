var express = require("express");
var app = express();
var bodyParser  = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");

var Campground = require("./models/campground");
var Comment   = require("./models/comment");
var User      = require("./models/user");
var seedDB     = require("./seeds");

var commentRoutes    = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes       = require("./routes/index");


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);

//mongoose.connect("mongodb://localhost/yelp_camp",{ useUnifiedTopology: true });
//mongodb+srv://jayaram:<password>@cluster0-jvxnu.mongodb.net/test?retryWrites=true&w=majority
//mongodb+srv://jayaram:<password>@cluster0-jvxnu.mongodb.net/test?retryWrites=true&w=majority

mongoose.connect("mongodb+srv://jayaram:password12345@cluster0-jvxnu.mongodb.net/test?retryWrites=true&w=majority",{ 
	useUnifiedTopology: true, 
    useCreateIndex: true,
	useNewUrlParser: true
}).then(() =>  {
	console.log("connected to DB");
}).catch(err => {
	console.log('error:' , err.message);
	console.log("db error");
});




app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(methodOverride("_method"));

app.use(flash());



//seed the DB:
//seedDB();

//Passport Config

app.use(require("express-session")({
	secret: "Passport - any dummy words",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error     = req.flash("error");
	res.locals.success     = req.flash("success");	
	next();
});


app.use(indexRoutes);
app.use(commentRoutes);
app.use(campgroundRoutes);



app.listen(process.env.PORT, function(){
	console.log("server started.");	
});



// app.listen(8080, function(){
// 	console.log("server started.");	
// });