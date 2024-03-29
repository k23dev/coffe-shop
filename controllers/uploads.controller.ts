import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { response } from 'express';

import UserModel from '../models/user.model';
import ProductModel from '../models/product.model';

import Cloudinary from 'cloudinary';

dotenv.config();
Cloudinary.config(process.env.CLOUDINARY_URL);


class UploadsController{

    constructor() {}

    public async put(req,res=response):any{

        const {id, collection}= req.params;
        try {
            
                let model: any;
                let fullPath:string;
                switch (collection) {
                    case 'users':
                            
                            model=await UserModel.findById(id);
                            
                            if(!model){
                                return res.status(400).json({
                                    msg:'No existe un usuario con ese ID'
                                });
                            }

                            if(model.img){
                                deleteImgIfExist(model.img);
                            }
                                                    
                            model.img=await uploadFile2Cloudinary(req.files.fileUp);
                            if(model) await model.save();

                        break;
                    case 'products':

                        model=await ProductModel.findById(id);
                        
                        if(!model){
                            return res.status(400).json({
                                msg:'No existe un producto con ese ID'
                            });
                        }

                        if(model.img){
                            deleteImgIfExist(model.img);
                        }
                                                
                        model.img=await uploadFile2Cloudinary(req.files.fileUp);
                        if(model) await model.save();

                    break;
                    default:
                        break;
                }

                return res.status(400).json({
                    collection:model,
                });

        } catch (error) {

            res.status(400).json({
                error
            });
            
        }

        return true;
    }

    public async get(req,res=response):any{

        const {id, collection}= req.params;
        let img:string='';
        try {
            
                let model: any;
                switch (collection) {
                    case 'users':
                            
                            model=await UserModel.findById(id);
                            
                            if(!model){
                                return res.status(400).json({
                                    msg:'No existe un usuario con ese ID'
                                });
                            }
                                img=getImagePath(model.img);
                                return res.status(200).json({
                                    img
                                });
                            
                            break;
                            case 'products':
                                
                                model=await ProductModel.findById(id);
                                
                                if(!model){
                                    return res.status(400).json({
                                        msg:'No existe un producto con ese ID'
                                    });
                                }
                                
                                img=getImagePath(model.img);
                                return res.status(200).json({
                                    img
                                });

                    break;
                }

        } catch (error) {
            res.status(400).json({
                error
            });
            
        }

        return true;
    }


}

const defaultImg='https://res.cloudinary.com/dec1fgp2b/image/upload/v1658632064/no-image_x5xkv5.jpg';

const getImagePath=(img:string)=>{
    
    console.log(img);

    const imgPath:string= (img)?? defaultImg;
    
    return imgPath;
}

const getCloudinaryImgId=(img:string)=>{
    return img.substring(img.lastIndexOf('/')+1,img.lastIndexOf('.'));
}

const deleteImgIfExist= async (img:string):boolean =>{
    if(img){
        
        Cloudinary.v2.uploader.destroy(getCloudinaryImgId(img));
        return true;

    }
    return false;
}

const uploadFile2Cloudinary=async (file:any)=>{

    try {
        const {secure_url} = await Cloudinary.v2.uploader.upload(file.tempFilePath);
        return secure_url
    } catch (error) {
        console.log(error);
        return false;
    }

}


export default UploadsController;