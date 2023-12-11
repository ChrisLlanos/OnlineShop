const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async(req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ["category_name"] },
        { model: Tag, attributes: ["tag_name"], through: ProductTag },
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async(req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ["category_name"] },
        { model: Tag, attributes: ["tag_name"], through: ProductTag },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json(error);
  }
});

// create new product
router.post('/', async(req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
    try {
      // Check if the required fields exist in the request body
      if (!req.body.product_name || !req.body.price) {
        return res
          .status(400)
          .json({ message: "product_name and price are required" });
      }
  
      const product = await Product.create({
        product_name: req.body.product_name,
        price: req.body.price,
        stock: req.body.stock || 0,
      });
  
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => ({
          product_id: product.id,
          tag_id,
        }));
        await ProductTag.bulkCreate(productTagIdArr);
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  });
  

  //update product by its id
  router.put("/:id", async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      await Product.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
  
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTags = await ProductTag.findAll({
          where: { product_id: req.params.id },
        });
  
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        
        //store tags to be made into new const
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => ({
            product_id: req.params.id,
            tag_id,
          }));
        //store tags to be replaced with new const
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
          
        //deliver both consts from above to both remove tags being replaced and bulk create the new tags
        await Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      }
      
      //repopulate updated product subdocuments in request and return it
      const updatedProduct = await Product.findByPk(req.params.id, {
        include: [
          { model: Category, attributes: ["category_name"] },
          { model: Tag, attributes: ["tag_name"], through: ProductTag },
        ],
      });
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(400).json(error);
    }
  });
  
  //remove a specific product by its id
  router.delete("/:id", async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      await ProductTag.destroy({
        where: {
          product_id: req.params.id,
        },
      });
  
      await Product.destroy({
        where: {
          id: req.params.id,
        },
      });
  
      res.status(200).json({ message: "Product deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  });
  
  module.exports = router;