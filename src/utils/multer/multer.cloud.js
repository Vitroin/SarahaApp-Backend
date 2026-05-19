import multer, { diskStorage } from 'multer';
;

export function fileUpload( {folder , allowedType = ["image/png", "image/jpg" ,"image/jpeg"]} = {}) {
    
    const storage = diskStorage({  });

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

