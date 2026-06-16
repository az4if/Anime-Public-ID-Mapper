const { handleHealth, setCors } = require("../src/handler");

module.exports = (req, res) => {
  setCors(res);
  return handleHealth(req, res);
};
