import fs from "node:fs";
import { fileTypeFromBuffer } from "file-type";

export const fileValidationMiddleware = (
    allowedTypes = ["image/png", "image/jpg" ,"image/jpeg"]
    ) => {
        return async ( req, res ,next ) =>{
            if (!req.file) {
                return next(new Error("File upload failed", { cause: 400 }));
            }
            const filePath = req.file.path;
            
            const buffer = fs.readFileSync(filePath);
            const type = await fileTypeFromBuffer(buffer)   

            if (!type || !allowedTypes.includes(type.mime)){
                return next( new Error("Invalid file type", { cause: 400 }) )
            }
            return next();
        }
    
}