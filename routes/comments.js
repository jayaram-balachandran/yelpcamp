
var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//=============
// Comment Routes
//==============

router.get("/campgrounds/:id/comments/new", isloggedIn, function(req,res){
	//Find Campground by findById
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else {
				res.render("comments/new", {campground : campground});
		}
	})
	
});


router.post("/campgrounds/:id/comments", isloggedIn, function(req,res){
	//lookup campground using id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else {
			Comment.create(req.body.comment, function(err,comment){
				if(err){
					console.log(err);
					req.flash("error", "Something went wrong !");
				} else {
					//add username and id to comment
					comment.author.id= req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "New Comment Added !");
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});	
});

//Edit Comment Route

router.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req,res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});	
});

//Update comment Route

router.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment, function(err, updatedComment){
		if(err){
			req.flash("error", "Something went wrong !");
			res.redirect("/back")
		} else {
		    res.redirect("/campgrounds/"+ req.params.id); 	
		}
	});
});


//Destroy Route

router.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			console.log(err);
			res.redirect("/campgrounds/"+ req.params.id);
		} else {
			res.redirect("/campgrounds/"+ req.params.id);
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



function checkCommentOwnership(req, res, next){
	if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
					console.log(err);
					res.redirect("back");
				} else {
					if(foundComment.author.id.equals(req.user._id)) {
						next();
					} else {
						req.flash("error", "Permission Denied !");
						res.redirect("back");
					}	
					}
			});
	} else {
		req.flash("error", "Please Log in !");
		res.redirect("back");
	}
}



module.exports = router;

