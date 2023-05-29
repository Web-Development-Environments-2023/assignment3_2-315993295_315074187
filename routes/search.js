var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const recipes_utils = require("../routes/utils/recipes_utils");

router.post("/search", function (req, res) {
    // const user_id = req.session.user_id;
    const search_body = req.body;

    const search_text = search_body.search_text;
    const search_num = search_body.search_num
    const search_filter1 = search_body.search_filter1
    const search_filter2 = search_body.search_filter2
    

    // Check correct values

    return recipes_utils.search_recipes(search_text, search_num, search_filter1, search_filter2)

  });