import multer, { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import fs from 'fs';

export function fileUpload( {folder , allowedType = ["image/png", "image/jpg" ,"image/jpeg"]} = {}) {
    
    const storage = diskStorage({
        destination: (req, file , cb) => {
            let dest = `uploads/${req.user._id}/${folder}`;

            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }

            cb(null, dest);
        },
        filename:  (req, file, cb) =>{
            console.log({file});
            cb( null, nanoid(5) + "-" + file.originalname.replace(/\s/g, "_"))  },
    });

    const fileFilter = (req,file,cb) => {
        if ( allowedType.includes(file.mimetype)){
            cb(null,true)
        }
        else{
            cb(new Error("invalid file type",{cause: 400}),false)
        }
    }

    return multer({ fileFilter , storage });
}

