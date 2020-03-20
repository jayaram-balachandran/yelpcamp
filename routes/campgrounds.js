
var express = require("express");
var router  = express.Router();

var Campground = require("../models/campground");
var Comment = require("../models/comment");




///////////
//Routes
///////////

router.get("/campgrounds", function(req,res){
	//Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user});
		}
	})
});

router.post("/campgrounds", isloggedIn, function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author= {
		id:req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, image: image, description: desc, author:author}
	// campgrounds.push(newcampground);
   // 	Create new campground and save it to DB 
	Campground.create(newCampground, function(err,newlyCreated){
		if(err){
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
	
});

router.get("/campgrounds/new", isloggedIn, function(req,res){
	res.render("campgrounds/new");
	});

//show more into about 1 campground
router.get("/campgrounds/:id", function(req,res){
	//find the campground with search id
	Campground.findById(req.params.id).populate("comments").exec( function(err, foundCampground){
				if(err)		{
					console.log("bad");
						} else {
							console.log(foundCampground)
							//render the corresponding info
							res.render("campgrounds/show",{campground: foundCampground});
						}
						});
	
	
})


//Edit campground Routes

router.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	}); 
});


//Update Campground Route

router.put("/campgrounds/:id", checkCampgroundOwnership, function(req, res){
	//find and update the correct campground
	var data = {}
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash("error", "Couldn't Update !");
			//redirect 
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//Destroy campground

router.delete("/campgrounds/:id", checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});





//Middleware

function isloggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please Log in first !");
	res.redirect("/login");
}


function checkCampgroundOwnership(req, res, next){
	if(req.isAuthenticated()){
			Campground.findById(req.params.id, function(err, foundCampground){
			if(err){
					req.flash("error", "Campgrounds not found !");
					console.log(err);
					res.redirect("back");
				} else {
					if(foundCampground.author.id.equals(req.user._id)) {
						next();
					} else {
						req.flash("error", "Permission Denied !!!");
						res.redirect("back");
					}	
					}
			});
	} else {
		req.flash("error", "Please Log in first !");
		res.redirect("back");
	}
}

module.exports = router;
