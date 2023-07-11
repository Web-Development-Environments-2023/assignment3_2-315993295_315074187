var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const DButils = require("../routes/utils/DButils");


router.get("/", (req, res) => res.send("im here"));


/**
 * Route handler for retrieving random recipes.
 */
router.get("/get_random_recipes", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRandomRecipes();
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


/**
 * Route handler for searching recipes based on various parameters.
 */
router.get("/search", async (req, res, next) => {
  try {
    let { Search_text, Num_of_results, cuisines, diets, intolerances } = req.query;

    cuisines = Array.isArray(cuisines) ? cuisines : cuisines ? [cuisines] : [];
    diets = Array.isArray(diets) ? diets : diets ? [diets] : [];
    intolerances = Array.isArray(intolerances) ? intolerances : intolerances ? [intolerances] : [];

    cuisines = cuisines.join(',');
    diets = diets.join(',');
    intolerances = intolerances.join(',');

    result = await recipes_utils.searchResult(Search_text, Num_of_results, cuisines, diets, intolerances);
    res.send(result);

  } catch (error) {
    next(error);
  }
});


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipePreview(req.params.recipeId, false, true);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
