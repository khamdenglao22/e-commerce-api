const WalletCusModel = require('../../models/models-cus/wallet-cus-model')
const { QueryTypes } = require('sequelize');
const sequelize = require("../../config");

exports.findCustomerWallet = async (req, res) => {
    const { cus_id } = req.customer
    try {
        // const result = await WalletCusModel.findAll({ where: { customer_id: cus_id } });
        // console.log(result)

        const result = await sequelize.query(`SELECT
        SUM(bonus) AS total_bonus,
        SUM(CASE WHEN wallet_type = 'in' THEN balance ELSE 0 END) AS total_deposit,
        SUM(CASE WHEN wallet_type = 'out' THEN balance ELSE 0 END) AS total_sell,
        SUM(CASE WHEN wallet_type = 'in' THEN balance ELSE 0 END) -
        SUM(CASE WHEN wallet_type = 'out' THEN balance ELSE 0 END) AS total_balance
    FROM wallet_customer
    WHERE customer_id = :cus_id`, {
                replacements: { cus_id: cus_id },
                type: QueryTypes.SELECT,
            });

        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({
            status: 400,
            msg: `error = ${error}`
        })
    }
};
