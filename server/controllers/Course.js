const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.createCourse = async(req, res) => {
    try{

        const userId = req.user.id;
        
        const{courseName, courseDescription, whatYouWillLearn, price, tag,  category,
            status,
            instructions,} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn  || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

       
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details :", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: 'Instructor details not found',
            });
        }

        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Category Details Not Found',
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.Floder_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: insrtructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            Category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        })

        await User.findByIdAndUpdate(
            {id: instructorDetails._id},
            {
                $push: {
                    course: newCourse._id,
                }
            },
            {new: true},
            
        )
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    course: newCourse._id,
                },
            },
            { new : true }
        );
        res.status(200).json({
            success: true,
            data: newCourse,
            message: "Course Created Successfully",
        });
    }
    catch(error){
console.log(error);
return res.status(500).json({
    success: false,
    message: 'Failed to create course',
    error: error.message,
})
    }
};

exports.getAllCourses = async (req, res) => {
    try{
        const allCourse = await Course.find({},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
        .populate("instructor")
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Data for all course fetched successfully',
            data: allCourse,
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Cannot Fetch course data',
            error: error.message,
        })
    }
};

exports.getCourseDetails = async(req, res) => {
    
        try {
            //get id
            const {courseId} = req.body;
            //find course details
            const courseDetails = await Course.find(
                {_id:courseId}
            )
            .populate(
                {
                    path: "instructor",
                    populate:{
                        path: "additionalDetails",
                    },
                }
            )
            .populate("category")
            // .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate:{
                    path: "subSection",
                },
            })
            .exec();
    
            //validation
            if(!courseDetails) {
                return res.status(400).json({
                    success: false,
                    message: `Could not find the course with ${courseId}`,
                });
                
            }
    
            //return response
            return res.status(200).json({
                success: true,
                message: "Course Details Fetched Successfully",
                data: courseDetails,
            });
    
        
    }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
}