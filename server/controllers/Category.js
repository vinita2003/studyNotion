const Category = require("../models/Category");

exports.createCategory = async(req, res) => {
    try{
       const {name, description} = req.body;
       if(!name){
        return res.status(400).json({
            success: false,
            message: 'ALL fields are required',
        })
       }

       const CategoryDetails = await Tag.create({
        name: name,
        description: description,
       });
       console.log(CategoryDetails);

       return res.status(200).json({
        success: true,
        message: "Category created Successfully",
       })


    }catch(error){
       return res.status(500).json({
        success: false,
        message: error.message,
       });
    }
};

exports.showAllCategories = async (req, res)=> {
    try{
        const allCategories = await Tag.find({}, {name: true, description: true});
        res.status(200).json({
            success: true,
            message: "All tags returned successfully",
            data: allCategories,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.categoryPageDetails = async(req, res) => {
    try{
     const {categoryId} = req.body;

     const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

     if(!selectedCategory) {
        return res.status(404).json({
            success: false,
            message: "Data Not Found",
        });
     }
     
     const differentCategories = await Category.find({
        _id: {$ne: categoryId},
     }).populate("courses").exec();

     //get top selling courses
     //HW - write it on your own

     return res.status(200).json({
        success: true,
        data: {
            selectedCategory,
            differentCategories,
        }
     })


    }catch(error){
       console.log(error);
       return res.status(500).json({
        success: false,
        message: error.message,
       });
    }
}