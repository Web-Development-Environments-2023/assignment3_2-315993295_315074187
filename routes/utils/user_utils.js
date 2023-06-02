const DButils = require("./DButils");


/**
 * Marks a recipe as a favorite for the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @param {string} recipe_id - The ID of the recipe to mark as favorite.
 */
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into users_fav values ('${user_id}','${recipe_id}')`);
}


/**
 * Retrieves the favorite recipes of the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from users_fav where user_id='${user_id}'`);
    return recipes_id;
}


/**
 * Retrieves the recipes created by the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getCreatedRecipes(user_id){
  const recipes_id = await DButils.execQuery(`select recipe_id from users_createdrecipes where user_id='${user_id}'`);
  return recipes_id;
}


/**
 * Retrieves the family recipes associated with the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getFamilyRecipes(user_id){
  const recipes_id = await DButils.execQuery(`select recipe_id from users_familyrecipes where user_id='${user_id}'`);
  return recipes_id;
}


/**
 * Marks a recipe as a family recipe for the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @param {string} recipe_id - The ID of the recipe to mark as family recipe.
 */
async function markAsFamily(user_id, recipe_id){
  await DButils.execQuery(`insert into users_familyrecipes values ('${user_id}','${recipe_id}')`);
}

/**
 * Marks a recipe as watched by the specified user.
 * Specfically, pushes the given recipe into a "queue" ran in the SQL database.
 *
 * @param {string} user_id - The ID of the user.
 * @param {string} recipe_id - The ID of the recipe to mark as watched.
 */
async function markAsWatched(user_id, recipe_id) {  
  const [currentWatched] = await DButils.execQuery(`SELECT watched_1, watched_2, watched_3 FROM users WHERE user_id = '${user_id}';`);
  const watchedArray = [currentWatched.watched_1, currentWatched.watched_2, currentWatched.watched_3];

  
  // Swaps the order if already in watched.
  if (watchedArray[0] == recipe_id)
    return;
  else if (watchedArray[1] == recipe_id){
    let temp = watchedArray[0];
    watchedArray[0] = watchedArray[1];
    watchedArray[1] = temp;
  }
  else if (watchedArray[2] == recipe_id){
    let temp = watchedArray[0];
    watchedArray[0] = watchedArray[2];
    watchedArray[2] = watchedArray[1];
    watchedArray[1] = temp;    
  }

  // Fill if any are null (-1).
  else if (watchedArray[0] == -1)
    watchedArray[0] = recipe_id;
  else if (watchedArray[1] == -1){
    watchedArray[1] = watchedArray[0];
    watchedArray[0] = recipe_id;
  }
  else if (watchedArray[2] == -1){
    watchedArray[2] = watchedArray[1];
    watchedArray[1] = watchedArray[0];
    watchedArray[0] = recipe_id;
  }
  
  // No nulls, but value isn't in watched.
  else{
    watchedArray[2] = watchedArray[1];
    watchedArray[1] = watchedArray[0];
    watchedArray[0] = recipe_id;
  }
  
  // Update DB.
  const updateQuery = `
    UPDATE users
    SET watched_1 = '${watchedArray[0]}', watched_2 = '${watchedArray[1]}', watched_3 = '${watchedArray[2]}'
    WHERE user_id = '${user_id}';
  `;

  await DButils.execQuery(updateQuery);
}

  
/**
 * Retrieves the watched recipes for the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Array} - An array containing the IDs of the watched recipes in the order [watched_1, watched_2, watched_3].
 */
async function getWatched(user_id) {
  const query = `SELECT watched_1, watched_2, watched_3 FROM users WHERE user_id='${user_id}'`;
  const result = await DButils.execQuery(query);

  const watched_1 = result[0].watched_1;
  const watched_2 = result[0].watched_2;
  const watched_3 = result[0].watched_3;
  return [watched_1, watched_2, watched_3];

}
  

exports.getWatched = getWatched;
exports.markAsFamily = markAsFamily;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getCreatedRecipes = getCreatedRecipes;;
exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
