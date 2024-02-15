const Product = require('../models/ProductModel');
const Request = require('../models/requestModel');

// Generate stock report
exports.getReport = async (req, res) => {
  
    try {
        const products = await Product.find();
        // You can format the data as needed for the report
        const reportData = products.map(product => ({
            productName: product.productName,
            description: product.description,
            quantity: product.quantity,
            pricePerUnit: product.pricePerUnit,
            // totalPrice: product.quantity * product.pricePerUnit,
        }));

        // Send the report as JSON
        res.status(200).json({ message: "Product report generated successfully", reportData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Generate the report for the requested product
exports.getReports = async (req, res) => {
    try {
        const productRequestReport = await Request.find();
        const requestData = productRequestReport.map(request => ({
            product: request.product,
            productName: request.productName,
            quantityRequested: request.quantityRequested,
            status: request.status,
            description: request.description
        }));

        // Send the report as JSON
        res.status(200).json({ message: "Request report generated successfully", requestData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Generate finance report

exports.generateFinancialReport = async (req, res) => {
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
