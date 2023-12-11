const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

//get all categories
router.get('/', async(req, res) => {
  Category.findAll().then((categoryData) => {
    res.json(categoryData);
  });
});

//get a single category by its id
router.get('/:id', (req, res) => {
  Category.findByPk(req.params.id).then((categoryData) => {
    res.json(categoryData);
  });
});


//create a new category with post request
router.post('/', async(req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category: category }); // Include the entire category object
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

//find a specific category by id and update it
router.put('/:id', async(req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update(req.body);

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

//delete a specific category by its id
router.delete('/:id', async(req, res) => {
  try {
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deletedCategory) {
      res.status(404).json("Category not found");
    } else {
      res.status(200).json("Category deleted");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;
