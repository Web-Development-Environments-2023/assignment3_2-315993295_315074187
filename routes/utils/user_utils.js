const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into users_fav values ('${user_id}','${recipe_id}')`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from users_fav where user_id='${user_id}'`);
    return recipes_id;
}

async function getCreatedRecipes(user_id){
  const recipes_id = await DButils.execQuery(`select recipe_id from users_createdrecipes where user_id='${user_id}'`);
  return recipes_id;
}

async function getFamilyRecipes(user_id){
  const recipes_id = await DButils.execQuery(`select recipe_id from users_familyrecipes where user_id='${user_id}'`);
  return recipes_id;
}

async function markAsFamily(user_id, recipe_id){
  await DButils.execQuery(`insert into users_familyrecipes values ('${user_id}','${recipe_id}')`);
}


// TODO should watched_x be Foreign_KEY?
async function markAsWatched(user_id, recipe_id) {
    // Retrieve the current values of watched_1, watched_2, and watched_3 from the database
    const [currentWatched] = await DButils.execQuery(`SELECT watched_1, watched_2, watched_3 FROM users WHERE user_id = '${user_id}';`);
    const { watched_1, watched_2, watched_3 } = currentWatched;
  
    // Check if recipe_id is equal to watched_1
    if (recipe_id === watched_1) {
      return; // Do nothing if recipe_id is already watched_1
    }
  
    // Check if recipe_id doesn't match any of the three
    if (recipe_id !== watched_2 && recipe_id !== watched_3) {
      // Update the values of watched_1, watched_2, and watched_3
      await DButils.execQuery(`UPDATE users SET watched_3 = '${watched_2}', watched_2 = '${watched_1}', watched_1 = '${recipe_id}' WHERE user_id = '${user_id}';`);
    } else if (recipe_id === watched_2) {
      // Swap values between watched_1 and watched_2
      await DButils.execQuery(`UPDATE users SET watched_2 = '${watched_1}', watched_1 = '${watched_2}' WHERE user_id = '${user_id}';`);
    } else if (recipe_id === watched_3) {
      // Swap values between watched_1 and watched_3
      await DButils.execQuery(`UPDATE users SET watched_3 = '${watched_1}', watched_1 = '${watched_3}' WHERE user_id = '${user_id}';`);
    }
  }
  
  


async function getWatched(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from users_fav where user_id='${user_id}'`);
    return recipes_id;
}


exports.markAsFamily = markAsFamily;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getCreatedRecipes = getCreatedRecipes;;
exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
