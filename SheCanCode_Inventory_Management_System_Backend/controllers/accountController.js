const Account = require("../models/Account");

const addBalance = async (req, res) => {
  try {
    const amount = req.body.balance;
    let existingBalance = await Account.findOne(
      {},
      {},
      { sort: { _id: -1 } }
    );
    if (!existingBalance) {
      existingBalance = { balance: 0 };
    }
    await Account.create({
      balance: existingBalance.balance  + amount,
      name: req.user.email,
      description: "Add Amount to our account",
    });
    res
      .status(200)
      .json({ message: "Balance added Successfully", existingBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getBalance = async (req, res) => {
  try {
    const data = await Account.find();
    return res.status(200).json({ data: data });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};
const updateBalance = async (req, res) => {
  try {
    const newBalance = parseFloat(req.body.newBalance) || 0;

    let existingAccount = await Account.findOne();

    if (!existingAccount) {
      existingAccount = new Account();
    }

    existingAccount.balance = newBalance;
    await existingAccount.save();

    res
      .status(200)
      .json({ message: "Balance updated successfully", newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { addBalance, updateBalance, getBalance };
