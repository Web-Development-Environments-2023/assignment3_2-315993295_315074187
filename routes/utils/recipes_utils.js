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
    try {
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
    } catch (error) {
        throw { status: 404, message: `Recipe ID "${recipe_id}" not in spoonacular DB.` }
    }
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


async function getRecipePreview(recipe_ids, local=false) {
    const results = [];
    for (const recipe_id of recipe_ids) {
        let recipe_info;
        if (local)
            recipe_info = await getRecipeInformation(recipe_id);
        else
            recipe_info = await DButils.execQuery(`SELECT * FROM your_table_name WHERE recipe_id = ${recipe_id};`);

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
  
async function searchResult(Search_text, Num_of_results, cuisines, diets, intolerances){

    let result = await axios.get(`${api_domain}/complexSearch`,
    {   
        params:
        {
            query:String(Search_text), 
            number:Number(Num_of_results), 
            cuisine:cuisines, 
            diet:diets,
            intolerances:intolerances, 
            apiKey:process.env.spooncular_apiKey,
            addRecipeInformation: true
        }
    });


    result = result.data["results"];
    let recipes = [];
    
    result.forEach((recipe) => {
        recipes.push ({
            // id:recipe.id, 
            title:recipe.title, 
            readyInMinutes:recipe.readyInMinutes, 
            image:recipe.image, 
            aggregateLikes:recipe.aggregateLikes, 
            vegan:recipe.vegan, 
            glutenFree:recipe.glutenFree 
        })
      });
    
    return recipes;
}

exports.getRecipePreview = getRecipePreview;
exports.searchResult = searchResult;
exports.getRecipeDetails = getRecipeDetails;



