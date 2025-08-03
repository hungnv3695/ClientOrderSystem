// Có thể dùng ORM hoặc gọi DB trực tiếp
exports.getAllUsers = async () => {
  return [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
};

exports.createUser = async (data) => {
  return { id: 3, ...data };
};
