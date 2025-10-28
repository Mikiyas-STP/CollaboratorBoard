let actionHistory = [];
const getHistory = () => {
  return actionHistory;
};
const addToActionHistory = (action) => {
  actionHistory.push(action);
};
const clearHistory = () => {
  actionHistory = [];
};

module.exports = {
  getHistory,
  addToActionHistory,
  clearHistory,
};
