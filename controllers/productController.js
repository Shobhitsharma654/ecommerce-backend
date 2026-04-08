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
    const { productId } = req.params;

    let {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestSeller
    } = req.body;

    // find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Update basic fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;

    // ✅ FIX bestSeller (important)
    if (bestSeller !== undefined) {
      product.bestSeller = bestSeller === "true";
    }

    // ✅ sizes
    if (sizes) {
      product.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
    }

    // 🔥 UPDATE IMAGES (Cloudinary)
    if (req.files) {
      if (req.files.image1) {
        const img = await uploadOnCloudinary(req.files.image1[0].path);
        product.image1 = img.secure_url;
      }

      if (req.files.image2) {
        const img = await uploadOnCloudinary(req.files.image2[0].path);
        product.image2 = img.secure_url;
      }

      if (req.files.image3) {
        const img = await uploadOnCloudinary(req.files.image3[0].path);
        product.image3 = img.secure_url;
      }

      if (req.files.image4) {
        const img = await uploadOnCloudinary(req.files.image4[0].path);
        product.image4 = img.secure_url;
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      message: "Update failed",
      error: error.message
    });
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