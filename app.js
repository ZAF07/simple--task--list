const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const date = require(__dirname + '/date.js')

const app = express();

// const item = [];
// const workItems = [];

app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');
app.use(express.static('public'))

// MongoDB
mongoose.connect("mongodb+srv://admin-zaffere:test123@cluster0.zpvz9.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

 const itemSchema = new mongoose.Schema ({
   name: String
 });

 const Item = mongoose.model('Item', itemSchema);

 const apple = new Item ({
   name: 'Hit this to delete an item'
 });
 const orange = new Item ({
   name: 'Orange'
 });
 const banana = new Item ({
   name: 'Banana'
 });

const defaultItems = [apple,orange,banana];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);

// Home Route
app.get('/', (req, res) => {

  Item.find({},(err, results) => {
  if (results.length === 0) {
    Item.insertMany(defaultItems, (err) => {
      if (err) {
        console.log('SOME ERROR', err);
      } else {
        console.log('Successfully added new items');
      }
    })
    res.redirect('/');
  } else {
    res.render('list', {listTitle: 'Today', newListItem: results});
  }
  })
});

// DYNAMIC ROUTE
app.get('/:customListName', (req,res) => {
  const customListName = _.lowerCase(req.params.customListName);

  List.findOne({name: customListName}, (err,results) => {
    if (!results) {
      const list = new List ({
        name: customListName,
        items: defaultItems
      })

      list.save((err) => {
        if (err) {
          console.log('ERROR!! HERE: ', err);
        } else {
          console.log(`Added ${customListName} successfully!`);
        }
      });
      res.redirect('/' + customListName);
    } else {
      List.find({name: customListName}, (err,lists) => {
        if (err) {
          console.log(err);
        } else {
          res.render('list', {listTitle: results.name, newListItem: results.items})
        }
      })
    }
  });




});


// Home POST
app.post('/', (req, res,next) => {
  console.log(req.body);

  // if (req.body.list === 'Work List') {
  //   const item = req.body.newItem;
  //   workItems.push(item.charAt(0).toUpperCase() + item.slice(1));
  //   res.redirect('/work');
  // } else {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const format = itemName.charAt(0).toUpperCase() + itemName.slice(1);

    const addDB = new Item ({
      name: format
    });

    if (listName === 'Today') {
      addDB.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Added new item successfully');
        }
        res.redirect('/');
      })
    } else {
      List.findOne({name: listName}, (err,foundList) => {
        foundList.items.push(addDB);
        console.log('Ireally dont understang: ', foundList);
        foundList.save();
        res.redirect('/' + listName);
      })
    }


});

// DELETE
app.post('/delete', (req,res) => {
  console.log(req.body.checkbox);
  console.log(req.body.lName);
  const id = req.body.checkbox;
  const lName = (req.body.lName);

  if (lName === 'Today') {
    Item.findByIdAndRemove(id, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Deleted Successfully');
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({name: lName}, {$pull: {items: {_id: id}}}, (err,foundList) => {
      if (!err) {
        res.redirect('/' + lName);
      }
    })
  }
});

app.get('/about', (req, res) => {
  res.render('about')
})


app.listen(3000, (req, res) => {
  console.log('SERVER ACTIVE: http://localhost:3000');
  console.log(date.getDate());
})
