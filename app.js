//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// let items =["Buy Food","Eat Food" ,"Cook Food"] ;
// let workItems = [];

app.listen(process.env.PORT || 3000, function() {
  console.log("server started on port 3000");
});

const uri = "mongodb+srv://admin-dylan:GmFXX9X2OLIoIrq5@cluster0.g5rba.mongodb.net/toDolistDB?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const items = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", items);

const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "Hit + button to add a new item"
});
const item3 = new Item({
  name: "Hit - button to delete a item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [items]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added default documents to todolistDB");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", {listTitle: "Today",newListItem: foundItems});
    }
  });
});

app.post("/", function(req, res) {

  let itemName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndDelete({_id:checkedItemId},function(err){
      if(!err){
        console.log("Successfully deleted entry");
      }
    });
    res.redirect("/");
  }

  else{

    List.findOne({name: listName},(err,doc) => {
      if (!err) {
        doc.items.pull({_id: checkedItemId});
        doc.save();
        res.redirect("/" + listName)
      }
    });

    }

});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          const list  = new List({
              name:customListName,
              items: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }
        else{
           res.render("list",{listTitle:foundList.name ,newListItem:foundList.items});
        }
      }
    });

});

app.get("/about", function(req, res) {
  res.render("about");

});
