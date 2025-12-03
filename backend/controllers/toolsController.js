const getLightningToolsData = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [
        { name: 'Channel Analyzer', description: 'Monitor liquidity and routing reliability.', status: 'online' },
        { name: 'Fee Optimizer', description: 'Suggest balanced fees for your node channels.', status: 'beta' },
      ],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLightningToolsData };
