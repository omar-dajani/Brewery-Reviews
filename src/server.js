var express = require("express");
var axios = require("axios");
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const qs = require('query-string');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));

var pgp = require('pg-promise')();

const dotenv = require('dotenv');
dotenv.config();

const dev_dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
};

const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

if (isProduction) {
    pgp.pg.defaults.ssl = { rejectUnauthorized: false };
}

const db = pgp(dbConfig);

db.connect()
    .then(obj => {
        const serverVersion = obj.client.serverVersion;
        obj.done();
        console.log("CONNECTED");
    })

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', function (req, res) {
    res.render('pages/main', {
        'items': '',
        my_title:"Home",
    })
});

app.get('/search', function (req, res) {
    var breweryName = req.query.breweryname;
    if (breweryName) {
        axios({
            url: `https://api.openbrewerydb.org/breweries?by_name=${breweryName}`,
            method: 'GET',
            dataType: 'json',
        }).then(items => {
            res.render('pages/main', {
                items: items.data,
                my_title:"Home"
            })
        });
    } else {
        res.render('pages/main', {
            items: '',
            my_title:"Login Page"
        })
    }
});

app.get('/addreview', function (req, res) {
    var searchTitle = req.query.searchTerm;
    var query1 = "select * from reviews where tv_show = '" + searchTitle + "';";
    var query2 = "select * from reviews;";
    var chosenData;
    db.task('get-everything', task => {
        return task.batch([
            task.any(query1),
            task.any(query2),
        ]);
    })
        .then(info => {
            if (info[0].length == 0) {
                chosenData = info[1];
            } else {
                chosenData = info[0];
            }
            res.render('pages/reviews', {
                items: chosenData,
                my_title:"Reviews"
            })
        })
});

app.post('/addreview', function (req, res) {
    var breweryName = req.body.breweryname;
    var review = req.body.review;
    var time = new Date(Date.now()).toISOString().replace('T',' ').replace('Z','');
    var insert_statement = "INSERT INTO reviews (tv_show,review,review_date) VALUES ('" + breweryName + "','" + review + "','" + time + "');";

    db.task('get-everything', task => {
        return task.batch([
            task.any(insert_statement)
        ]);
    })
        .then(info => {
            res.render('pages/main', {
                items: '',
                my_title:"Home"
            })
        })
});

app.get('/reviews', function (req, res) {
    var searchTitle = req.query.searchTerm;
    var query1 = "select * from reviews where tv_show = '" + searchTitle + "';";
    var query2 = "select * from reviews;";
    var chosenData;
    db.task('get-everything', task => {
        return task.batch([
            task.any(query1),
            task.any(query2),
        ]);
    })
        .then(info => {
            if (info[0].length == 0) {
                chosenData = info[1];
            } else {
                chosenData = info[0];
            }
            res.render('pages/reviews', {
                items: chosenData,
                my_title:"Reviews"
            })
        })
});

module.exports = server