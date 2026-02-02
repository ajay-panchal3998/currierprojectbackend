const { pool } = require("../database/db");

function genOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
async function genUserId() {
    let userid, exists;
    do {
        userid = `user_${Math.floor(1000000 + Math.random() * 9000000)}`;
        const [rows] = await pool.query('SELECT 1 FROM users WHERE userid=?', [userid]);
        exists = rows.length > 0;
    } while (exists);
    return userid;
}
async function genCategoryId() {
    let category_id, exists;
    do {
        category_id = `category_${Math.floor(1000000 + Math.random() * 9000000)}`;
        const [rows] = await pool.query('SELECT 1 FROM product_category WHERE category_id=?', [category_id]);
        exists = rows.length > 0;
    } while (exists);
    return category_id;
}
async function genSubCategoryId() {
    let sub_category_id, exists;
    do {
        sub_category_id = `sub_category_${Math.floor(100000000 + Math.random() * 900000000)}`;
        const [rows] = await pool.query('SELECT 1 FROM sub_product_category WHERE sub_category_id =?', [sub_category_id]);
        exists = rows.length > 0;
    } while (exists);
    return sub_category_id;
}
async function genProductId() {
    let product_id, exists;
    do {
        product_id = `product_${Math.floor(10000000000 + Math.random() * 90000000000)}`;
        const [rows] = await pool.query('SELECT 1 FROM ecommerce_products WHERE product_id =?', [product_id]);
        exists = rows.length > 0;
    } while (exists);
    return product_id;
}
async function genvariantId() {
    let variant_id, exists;
    do {
        variant_id = `variant_${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;
        const [rows] = await pool.query('SELECT 1 FROM product_variants WHERE variant_id =?', [variant_id]);
        exists = rows.length > 0;
    } while (exists);
    return variant_id;
}
async function genBannerId() {
    let banner_id, exists;
    do {
        banner_id = `banner_${Math.floor(100000 + Math.random() * 900000)}`;
        const [rows] = await pool.query('SELECT 1 FROM banners WHERE banner_id =?', [banner_id]);
        exists = rows.length > 0;
    } while (exists);
    return banner_id;
}
async function genAdminId() {
    let admin_id, exists;
    do {
        admin_id = `Admin${Math.floor(1000000 + Math.random() * 9000000)}1000`;
        const [rows] = await pool.query('SELECT 1 FROM admin WHERE admin_id = ?', [admin_id]);
        exists = rows.length > 0;
    } while (exists);
    return admin_id;
};
async function genCouponId() {
    let coupon_id, exists;
    do {
        coupon_id = `coupon_${Math.floor(10000 + Math.random() * 90000)}`;
        const [rows] = await pool.query('SELECT 1 FROM coupons WHERE coupon_id = ?', [coupon_id]);
        exists = rows.length > 0;
    } while (exists);
    return coupon_id;
};


module.exports = {
    genOTP,
    genUserId,
    genCategoryId,
    genSubCategoryId,
    genAdminId,
    genProductId,
    genvariantId,
    genBannerId,
    genCouponId
}