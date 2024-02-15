const ProductModel = require('../models/ProductModel'); 
const financeAccountModel = require('../models/financeModel')

const generateFinancialReport = async (req, res) => {
  try {
    const allProductReports = await ProductModel.find();
    let Money_On_the_account = 0;
    let MoneyUsed = 0;

    allProductReports.forEach((report) => {
      Money_On_the_account -= report.totalPrice;
      MoneyUsed  += report.totalPrice;
    });

    const userProvidedRevenue = parseFloat(req.body.Money_On_the_account) || 0;

    Money_On_the_account += userProvidedRevenue;

    const remainingMoney = Money_On_the_account - MoneyUsed;
    const financialReport = {
      Money_On_the_account,
      MoneyUsed,
      remainingMoney,
      // productReports: allProductReports,
    };

    res.json({ message: "Finance report generated successfully", financialReport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


const createFinanceRequest = async (req, res, next) => {
  try {
    const { itemName, quantity, unitPrice, status } = req.body;
    const totalPrice = quantity * unitPrice;
    const requestOrder = await FinanceRequest.create({
      itemName,
      quantity,
      unitPrice,
      totalPrice,
      status,
    });

    res.status(200).json({
      message: "Finance request created successfully",
      data: requestOrder,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};



module.exports = { generateFinancialReport,createFinanceRequest};
