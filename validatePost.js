const Room = require('./models/room');

const validatePost = (data) => {
  const testData = new Room(data);
  const errors = testData.validateSync();
  if (errors) {
    return Object.values(errors.errors).map((err) => err.message);
  } else {
    return errors;
  }
};

module.exports = validatePost;