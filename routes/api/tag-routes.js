const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

//get all tags at once
router.get('/', (req, res) => {
  Tag.findAll().then((tagData) => {
    res.json(tagData);
  });
});

// get a specific tag by its id
router.get('/:id', (req, res) => {
  Tag.findByPk(req.params.id).then((tagData) => {
    res.json(tagData);
  });
});


//create a new tag with post request
router.post('/', async(req, res) => {
  try {
    const tagData = await Tag.create({
      tag_name: req.body.tag_name,
    });
    res.status(201).json(tagData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

//update a tag by its id
router.put('/:id', async(req, res) => {
  try {
    const [updatedCount, updatedTag] = await Tag.update(
      {
        tag_name: req.body.tag_name,
      },
      {
        where: {
          id: req.params.id,
        },
        returning: true,
      }
    );

    if (updatedCount === 0) {
      res.status(404).json({ message: "Tag not found" });
    } else {
      res.status(200).json(updatedTag[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


//remove a specific tag by its id
router.delete('/:id', async(req, res) => {
  try {
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedTag) {
      res.status(404).json("Tag not found");
    } else {
      res.status(200).json("Tag deleted");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
