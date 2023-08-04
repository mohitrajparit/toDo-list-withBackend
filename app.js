//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to TO-Do list"
});
const item2 = new Item({
  name: "Hit the add (+) button to add to the list"
});
const item3 = new Item({
  name: "<-- hit the box to delete from list"
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



// Item.updateOne({_id:"64a902f1c7c36a23808bf027"},{name:"Hit the add (+) button to add to the listt"}).exec();

app.get("/", function (req, res) {

  Item.find().then(function (items) {

    if (items.length === 0) {
      Item.insertMany(defaultItems).then((err) => {

        console.log("Succesfully Inserted!");

      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  })
});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save()
          .then(function () {
            console.log("saved");
            res.redirect("/" + customListName); // Redirect after saving the new list
          });
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  }); console.log(listName, itemName)
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      console.log(foundList);
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName, checkedItemId);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function (foundItem) { Item.deleteOne({ _id: checkedItemId }) })

    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(function (foundList) {
      res.redirect("/" + listName);
    });
  }



});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
