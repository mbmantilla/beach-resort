const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const reservationController = require('../controllers/reservationController');

// Items (Public)
router.get('/items', itemController.getAllItems);

// Items (Admin)
router.get('/admin/items', itemController.getAllItemsAdmin);
router.get('/admin/items/:id', itemController.getItemById);
router.post('/admin/items', itemController.createItem);
router.put('/admin/items/:id', itemController.updateItem);
router.delete('/admin/items/:id', itemController.deleteItem);

// Reservations (Customer) - using JSON
router.post('/reservations', reservationController.createReservation);
router.get('/reservations/my', reservationController.getMyReservations);

// Admin - Dashboard Stats
router.get('/admin/stats', reservationController.getReservationStats);

// Admin - Reservations
router.get('/admin/reservations', reservationController.getAllReservations);
router.get('/admin/reservations/:id', reservationController.getReservationById);
router.put('/admin/reservations/:id', reservationController.updateStatus);
router.delete('/admin/reservations/:id', reservationController.deleteReservation);

// Admin - Customers
router.get('/admin/customers', reservationController.getCustomers);
router.get('/admin/customers/:id', reservationController.getCustomerById);

module.exports = router;
