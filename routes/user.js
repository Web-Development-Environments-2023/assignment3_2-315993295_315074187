var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(201).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);    
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array

    if (recipes_id_array.length == 0){
      res.status(200).send([]);
      return;
    }

    const results = await recipe_utils.getRecipePreview(recipes_id_array, true);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path gets body with recipeId and save this recipe in the family recipe list of the logged-in user
 */
router.post('/familyrecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFamily(user_id,recipe_id);
    res.status(201).send("The Recipe successfully saved as a family recipe.");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the family recipes that were saved by the logged-in user
 */
router.get('/familyrecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipes(user_id);    
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array

    if (recipes_id_array.length == 0){
      res.status(200).send([]);
      return;
    }

    const results = await recipe_utils.getRecipePreview(recipes_id_array, true);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path returns the created recipes of the logged-in user
 */
router.get('/created_recipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getCreatedRecipes(user_id);    
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array

    if (recipes_id_array.length == 0){
      res.status(200).send([]);
      return;
    }

    const results = await recipe_utils.getRecipePreview(recipes_id_array, true);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


/**
 * This path adds a recipe to a user's watched queue.
 */
router.post('/watched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsWatched(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved to watched queue.");
    } catch(error){
    next(error);
  }
})

/**
 * This path gets the watched recipes from the logged in user.
 */
router.get('/watched', async (req,res,next) => {
  try{

    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getWatched(user_id);
    const recipes_id_array = recipes_id.filter((element) => element !== -1).map((element) => element); // Filter null (-1) values, if exist.    

    if (recipes_id_array.length == 0){
      res.status(200).send([]);
      return;
    }

    const results = await recipe_utils.getRecipePreview(recipes_id_array, true); // TODO: Should possibly be changed from `true` to `false` depending on the frontend.
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});






module.exports = router;
