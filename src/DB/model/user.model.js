import { model, Schema } from 'mongoose';

const schema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        email: {
            type: String,
            required: function () {
                if (this.phoneNumber) {return false;}
                return true;
            },
            // unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: function () {
                if (this.userAgent === "google") {
                    return false;
                }else {
                    return true;
                }
            }

        },

        phoneNumber: {
            type: String,
            required: function () {
                if (this.email) {return false;}
                return true;
            },
            // unique: true,
        },
        isVerified:{
            type: Boolean,
            default: false
        },
        dob: {
            type: Date,
        },
        otp:{
            type: Number
        },
        otpExpire:{
            type: Date
        },
        userAgent:{
            type: String ,
            enum: ["local", "google"],
            default: "local"
        },profilePic: {
            // type: String, // Path to the profile picture
            secure_url: String,
            public_id: String}
    },
    {
        timestamps: true, 
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

// 🔹 Virtual: Full Name
schema
    .virtual("fullName")
    .get(function () {
        return `${this.firstName} ${this.lastName}`;
    })
    .set(function (value) {
        const [firstName, lastName] = value.split(" ");
        this.firstName = firstName;
        this.lastName = lastName;
    });

// 🔹 Virtual: Age
schema.virtual("age").get(function () {
    return new Date().getFullYear() - new Date(this.dob).getFullYear();
});

export const User = model("User", schema);  