import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

export async function uploadBufferToCloudinary(buffer: Buffer, folder = "aieyecare") {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}
