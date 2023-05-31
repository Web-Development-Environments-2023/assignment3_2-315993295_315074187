const axios = require("axios");
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
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        glutenFree: glutenFree,        
    }
}

async function search_recipes(text, num_of_results, filter1, filter2){ // TODO:
    // ...
    await axios.get(`${api_domain}/recipes/complexSearch`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipePreview(recipe_ids) {
    const results = [];
  
    for (const recipe_id of recipe_ids) {
      let recipe_info = await getRecipeInformation(recipe_id);
      let { id, title, readyInMinutes, image, aggregateLikes, vegan, glutenFree } = recipe_info.data;
  
      results.push({
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        popularity: aggregateLikes,
        vegan: vegan,
        glutenFree: glutenFree,
      });
    }
    return results;
  }
  

exports.getRecipePreview = getRecipePreview;
exports.search_recipes = search_recipes;
exports.getRecipeDetails = getRecipeDetails;



