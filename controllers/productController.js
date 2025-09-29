import { uploadOnCloudinary } from "../config/cloudinary.js";
import Product from "../model/productModel.js";




export const addProduct = async(req, res)=>{
    try {
        let {name, description, price, category, subCategory , sizes, bestSeller }= req.body;
        let image1 = await uploadOnCloudinary(req.files.image1[0]?.path)
        let image2 = await uploadOnCloudinary(req.files.image2[0]?.path)
        let image3 = await uploadOnCloudinary(req.files.image3[0]?.path)
        let image4 = await uploadOnCloudinary(req.files.image4[0]?.path)

    image1 = image1?.secure_url;
    image2 = image2?.secure_url;
    image3 = image3?.secure_url;
    image4 = image4?.secure_url;
        if (!image1 || !image2 || !image3 || !image4) {
      return res.status(400).json({ message: "Image upload failed." });
    }
        let productData = {
            name,
            description, 
            price :Number(price), 
            category, 
            subCategory , 
            sizes :JSON.parse(sizes), 
            bestSeller: bestSeller === "true",
            date :Date.now(), 
            image1, 
            image2, 
            image3, 
            image4,
        };
        
     const newProduct = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
    
    } catch (error) {
      
    console.error("Add product error:", error);
    return res.status(500).json({ message: "Add product error", error: error.message });

    }
}

export const listProduct = async(req,res)=>{
    try {
        const product = await Product.find({})
        return res.status(200).json(product)
    } catch (error) {
           console.error("Listproduct error:", error);
    return res.status(500).json({ message: "listproduct error", error: error.message });
    }
}

export const updateProduct = async (req, res) => {
  try {
    const { productId, price, sizes } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const updateFields = {};
    if (price !== undefined) updateFields.price = price;
    if (sizes !== undefined) updateFields.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const removeProduct  = async(req,res)=>{
    try{
        let {id} = req.params;
        const product = await Product.findByIdAndDelete(id)
           return res.status(200).json(product)
    }catch(error){
        console.error("Remove product error:", error);
    return res.status(500).json({ message: "Remove product error", error: error.message });
    };
    
}