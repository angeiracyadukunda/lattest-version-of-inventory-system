

const express = require("express")
const {getAll,updateStock,deleteStock,createStockItem}= require("./../controllers/stock.controller")


const router = express.Router()

router.get("/getAll",getAll)
router.patch("/:id",updateStock)
router.delete("/:id",deleteStock)
router.post("/createItem",createStockItem);

module.exports =  router
