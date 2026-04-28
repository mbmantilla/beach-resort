const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const itemController = require('./controllers/itemController');
const reservationController = require('./controllers/reservationController');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/items', itemController.getAllItems);
app.post('/reservations', reservationController.createReservation);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});