import { Schema,model } from "mongoose"

const schema = new Schema(
    {
        token: String,
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        type:{
            type: String,
            enum:["access", "refresh"],
            default: "access"
        }
     },
     {tmestamps: true}
)

export const Token = model("Token", schema)