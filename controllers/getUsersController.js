async function getAllUsers(req, res) {
  const users = await db.collection("users").find().toArray();
  res.send({
    status: "success",
    data: users,
  });
}

module.exports = {
    getAllUsers
}