const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser')

require('dotenv').config();

// support parsing of application/json type post data
app.use(bodyParser.json());

//ejs jade
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

const uri = process.env.mongoURI;
mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB Connected…')
    })
    .catch(err => console.log(err));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));

//Schema 
var Todo = new mongoose.Schema({
    name: String,
    priority: String
});
var Todo = mongoose.model("Todo", Todo);

//temporary for sending alert
message = false;

//Get method
app.get('/', (req, res, next) => {
    //Here fetch data using mongoose query like
    Todo.find({}, function(err, tasks) {
        if (err) throw err;
        // object of all the users
        res.render(__dirname + '/index.html', { Todo: tasks, idTask: '', message });
        message = false;
    });
});

// POST method route
app.post('/send', function(req, res) {
    const myData = new Todo(req.body);
    myData.save()
        .then(() => {
            message = true;
            res.redirect('/');
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

// render a updated to do page
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    Todo.find({}, (err, tasks) => {
        if (err) res.send('error');
        res.render(__dirname + '/index.html', { Todo: tasks, idTask: id, message });
    });
});
app.post('/edit/:id', (req, res) => {
    Todo.updateOne({ _id: req.params.id }, {
            name: req.body.name,
            priority: req.body.priority
        },
        (err, tasks) => {
            if (err) res.send('error cannot modify');
            else {
                message = true;
                res.redirect('/');
            }
        });
})

// delete a todo item
app.get('/remove/:id', function(req, res) {
    Todo.deleteOne({ _id: req.params.id },
        (err, tasks) => {
            if (err) throw err;
            else {
                message = true;
                res.redirect('/');
            }
        });
});