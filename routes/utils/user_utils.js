const DButils = require("./DButils");



class Stack {
    /**
     * Creates a new Stack instance.
     * @param {Array} items - The initial items in the stack.
     */
    constructor(items) {
      this.items = items;
    }
  
    /**
     * Pushes an element onto the stack.
     * @param {*} element - The element to be pushed.
     */
    push(element) {
      this.removeByItem(element);
      this.items.push(element);
    }
  
    /**
     * Removes an element from the stack by its value.
     * @param {*} element - The element to be removed.
     */
    removeByItem(element) {
      const index = Number(this.includes(element));
      if (index !== -1) {
        this.items.splice(index, 1);
      }
    }
  
    /**
     * Checks if the stack includes the specified element and returns its index.
     * @param {*} element - The element to search for.
     * @returns {number} The index of the element if found, or -1 if not found.
     */
    includes(element) {
      for (let i = 0; i < this.items.length; i++) {
        if (String(this.items[i]) === element) {
          return i;
        }
      }
      return -1;
    }
  }
  


/**
 * Marks a recipe as a favorite for the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @param {string} recipe_id - The ID of the recipe to mark as favorite.
 */
async function markAsFavorite(user_id, recipe_id) {
    // TODO: Check if I need to add this test to other functions that add to the DB.

    // Check if the record already exists
    const existingRecord = await DButils.execQuery(
        `SELECT * FROM users_fav WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`
    );

    if (existingRecord.length > 0) {
        return;
    }

    // Insert the record if it doesn't already exist
    await DButils.execQuery(`INSERT INTO users_fav VALUES ('${user_id}', '${recipe_id}')`);
}


/**
 * Retrieves the favorite recipes of the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getFavoriteRecipes(user_id) {
    const recipes_id = await DButils.execQuery(`select recipe_id from users_fav where user_id='${user_id}'`);
    return recipes_id;
}


/**
 * Retrieves the recipes created by the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getCreatedRecipes(user_id) {
    const recipes_id = await DButils.execQuery(`select recipe_id from users_createdrecipes where user_id='${user_id}'`);
    return recipes_id;
}


/**
 * Retrieves the family recipes associated with the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getFamilyRecipes(user_id) {
    const recipe_id = await DButils.execQuery(`SELECT recipe_id FROM users_familyrecipes WHERE user_id='${user_id}'`);
    const recipeIds = recipe_id.map((row) => row.recipe_id).join(","); // Extract recipe IDs and create a comma-separated string
    const family_details = await DButils.execQuery(`SELECT belongs_to, prepared_in FROM users_familyrecipes WHERE user_id='${user_id}' AND recipe_id IN (${recipeIds})`);

    const result = [recipe_id, family_details];
    return result;
}


/**
 * Marks a recipe as a family recipe for the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @param {string} recipe_id - The ID of the recipe to mark as family recipe.
 */
async function markAsFamily(user_id, recipe_id) {
    const check = await DButils.execQuery(
        `SELECT id FROM recipes WHERE user_id = '${user_id}' AND id = '${recipe_id}'`
    );

    if (check.length === 0) {
        throw { status: 403, message: "Recipe doesn't exist in local database, or does not belong to this user." }
    }
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
    const sqlresult = await DButils.execQuery(`SELECT watched FROM users WHERE user_id = '${user_id}';`);
    let currentWatched = sqlresult[0].watched ? sqlresult[0].watched : [];
    currentWatched = Array.isArray(currentWatched) ? currentWatched : [currentWatched];
    const stack = new Stack(currentWatched);
    stack.push(recipe_id);

    // Update DB.
    const updateQuery = `
    UPDATE users
    SET watched = '[${stack.items}]'
    WHERE user_id = '${user_id}';
    `;

    await DButils.execQuery(updateQuery);
    return;
}


/**
 * Retrieves the watched recipes for the specified user.
 *
 * @param {string} user_id - The ID of the user.
 * @returns {Array} - An array containing the IDs of the watched recipes in the order [watched_1, watched_2, watched_3].
 */
async function getWatched(user_id) {
    const query = `SELECT watched FROM users WHERE user_id='${user_id}'`;
    let result = await DButils.execQuery(query);
    result = result[0].watched;
    return result;
}


exports.getWatched = getWatched;
exports.markAsFamily = markAsFamily;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getCreatedRecipes = getCreatedRecipes;;
exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
