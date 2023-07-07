const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";
const cuisine = ["African", "Asian", "American", "British", "Cajun", "Caribbean", "Chinese", "Eastern European", "European",
    "French", "German", "Greek", "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean", "Latin American", "Mediterranean",
    "Mexican", "Middle Eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"]
const diet = ["Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian", "Ovo-Vegetarian", "Vegan", "Pescetarian", "Paleo",
    "Primal", "Low FODMAP", "Whole30"]
const intolerance = ["Dairy", "Egg", "Gluten", "Grain", "Peanut", "Seafood", "Sesame", "Shellfish", "Soy", "Sulfite", "Tree Nut", "Wheat"]

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    try {
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
    } catch (error) {
        throw { status: 404, message: `Error retreiving recipe information: ${error}` }
    }
}


/**
 * Retrieves preview information for a list of recipes.
 *
 * @param {string} recipe_ids - A string representing a single ID or multiple IDs separated by commas.
 * @param {boolean} [local=false] - Flag indicating whether to retrieve recipe information locally or from the online database.
 * @param {boolean} [full=false] - Flag indicating whether to retrieve full recipe information or just the preview information.
 * @returns {Array<Object>} An array of recipe preview objects.
 */
async function getRecipePreview(recipe_ids, local = false, full = false) {
    // Convert recipe_ids to an array if it's multiple ids
    if (typeof recipe_ids === 'string') {
        recipe_ids = recipe_ids.split(',').map(Number);
    }
    const results = [];
    for (const recipe_id of recipe_ids) {
        let recipe_info;
        if (local) {
            recipe_info = await DButils.execQuery(`SELECT * FROM recipes WHERE id = ${recipe_id};`);
            recipe_info = recipe_info[0];
            results.push({
                image: recipe_info.image,
                title: recipe_info.title,
                readyInMinutes: recipe_info.readyInMinutes,
                popularity: recipe_info.aggregateLikes,
                vegan: recipe_info.vegan,
                glutenFree: recipe_info.glutenFree,
                ingredients: recipe_info.extendedIngredients,
                preperation_steps: recipe_info.instructions,
                num_of_servings: recipe_info.servings
            });
        }
        else {

            recipe_info = await getRecipeInformation(recipe_id);

            let { id, title, readyInMinutes, image, aggregateLikes, vegan, glutenFree, extendedIngredients, instructions, servings } = recipe_info.data;

            if (!full)
                results.push({
                    id: id,
                    image: image,
                    title: title,
                    readyInMinutes: readyInMinutes,
                    popularity: aggregateLikes,
                    vegan: vegan,
                    glutenFree: glutenFree,
                });
            else
                results.push({
                    id: id,
                    image: image,
                    title: title,
                    readyInMinutes: readyInMinutes,
                    popularity: aggregateLikes,
                    vegan: vegan,
                    glutenFree: glutenFree,
                    ingredients: extendedIngredients,
                    preperation_steps: instructions,
                    num_of_servings: servings
                });
        }
    }
    return results;
}



/**
 * Performs a search for recipes based on the provided search parameters and returns the extracted recipe data.
*
* @param {string} Search_text - The text to search for in recipe names and descriptions.
* @param {number} Num_of_results - The maximum number of search results to retrieve.
* @param {string[]} cuisines - The cuisines for which the recipes must be suitable.
* @param {string[]} diets - The diets for which the recipes must be suitable.
* @param {string[]} intolerances - The intolerances for which the recipes must be suitable.
* @returns {Array} - An array of recipes with the extracted data.
*/

async function searchResult(Search_text, Num_of_results, cuisines, diets, intolerances) {

    let result = await axios.get(`${api_domain}/complexSearch`,
        {
            params:
            {
                query: String(Search_text),
                number: Number(Num_of_results),
                cuisine: cuisines,
                diet: diets,
                intolerances: intolerances,
                apiKey: process.env.spooncular_apiKey,
                addRecipeInformation: true
            }
        });

    result = result.data["results"];
    return extractData(result);
}


/**
 * Retrieves a specified number of random recipes and returns the extracted recipe data.
 *
 * @returns {Array} - An array of recipes with the extracted data.
 */
async function getRandomRecipes() {
    let result = await axios.get(`${api_domain}/random`,
        {
            params:
            {
                number: Number(3),
                apiKey: process.env.spooncular_apiKey,
            }
        });

    result = result.data["recipes"];
    return extractData(result);
}


/**
 * Extracts relevant data from a given result and returns an array of recipes.
 *
 * @param {Array} result - The result array containing recipe objects.
 * @returns {Array} - An array of recipes with extracted data.
 */
async function extractData(result) {
    let recipes = [];

    result.forEach((recipe) => {
        recipes.push({
            id: recipe.id,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            image: recipe.image,
            aggregateLikes: recipe.aggregateLikes,
            vegan: recipe.vegan,
            glutenFree: recipe.glutenFree
        })
    });

    return recipes;
}


exports.getRandomRecipes = getRandomRecipes;
exports.getRecipePreview = getRecipePreview;
exports.searchResult = searchResult;
