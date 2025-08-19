const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans,
    getPlanById
} = require('../controllers/adminPlanController');
const {
    getAllUsersWithTokenBalances,
    getUserWithTokenBalanceById
} = require('../controllers/adminUserController');

const router = express.Router();
const {
    getAllPaymentHistory,
    getUserPaymentHistory
} = require('../controllers/adminPaymentController');

// All admin routes will be protected and require 'admin' role
router.use(protect);
router.use(authorize(['admin']));
// User management routes (Admin)
router.route('/users')
    .get(getAllUsersWithTokenBalances);

router.route('/users/:id')
    .get(getUserWithTokenBalanceById);

// Payment history routes (Admin)
router.route('/payments')
    .get(getAllPaymentHistory);

router.route('/users/:userId/payments')
    .get(getUserPaymentHistory);

// Plan management routes
router.route('/plans')
    .post(createPlan)
    .get(getAllPlans);

router.route('/plans/:id')
    .get(getPlanById)
    .put(updatePlan)
    .delete(deletePlan);

module.exports = router;