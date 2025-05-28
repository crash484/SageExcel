import mongoose from "mongoose";

const uploadedFileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    headers:{
        type: [String],
        required: true
    },
    size: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }
})

const UploadedFile = mongoose.model('UploadedFile',uploadedFileSchema);
export default UploadedFile;