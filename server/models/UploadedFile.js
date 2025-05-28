import mongoose from "mongoose";
import Upload from "../../src/pages/Upload";

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
})

const UploadedFile = mongoose.model('UploadedFile',uploadedFileSchema);
export default UploadedFile;