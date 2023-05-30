var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

router.post("/recipeCreation", async (req, res, next) => { // TODO: Check
  try {
    let recipe_details = {
      image: req.body.image,
      name: req.body.name,
      readyInMinutes: req.body.readyInMinutes,
      vegan: req.body.vegan,
      glutenfree: req.body.glutenfree,
      ingredients: req.body.ingredients,
      preperation_steps: req.body.preperation_steps,
      num_of_servings: req.body.num_of_servings
    }
    let userid = req.body.userid

    // Check if recipe name doesn't exist in the database
    let recipes = [];
    recipes = await DButils.execQuery("SELECT name from recipes");
    if (recipes.find((x) => x.name === recipe_details.name))
      throw { status: 409, message: "Recipe name taken" };
      
    // add to recipe database
    await DButils.execQuery(
      `INSERT INTO recipes ('image', 'name', 'readyInMinutes', 'vegan', 'glutenfree', 'ingredients', 'preperation_steps', 'num_of_servings') VALUES ('${recipe_details.image}', '${recipe_details.name}', '${recipe_details.readyInMinutes}', '${recipe_details.vegan}', '${recipe_details.glutenfree}', '${recipe_details.ingredients}', '${recipe_details.preperation_steps}', '${recipe_details.num_of_servings}')`
    )
    
    // add to user's favorites database
    let recipeid;
    recipeid = await DButils.execQuery(`SELECT recipe_id FROM recipes WHERE name = '${recipe_details.name}';`);
    await DButils.execQuery(
      `INSERT INTO users_createdrecipes VALUES ('${userid}', '${recipeid})`
    )
    } catch (error) {
      next(error);
    }
});

module.exports = router;
