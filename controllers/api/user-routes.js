const router = require('express').Router();
const { User } = require('../../models');

// Get /api/users
router.get('/', (req, res) => {
  User.findAll({
    attributes: { exclude: ["password"] },
  })
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get /api/users/:id
// router.get('/:id', (req, res) => {
//   User.findOne ({
//     attributes: { exclude: ["password"] },
//     where: {
//       id: req.params.id,
//     },
//     include: [
//       {
//         model: Post
//       }
//     ]
//   })
  
// })