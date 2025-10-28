import axios from "axios";

export const cloudinaryUpload = async (file, setImage, setProgress) => {
  const data = new FormData();
  data.append('file', image)
  data.append('upload_preset', 'yourAnimalSevak')

  await axios.post(
    "https://api.cloudinary.com/v1_1/dajux5nbc/image/upload",
    data,
    {
      onUploadProgress: (e) => {
        const progress = Math.round((e.loaded * 100) / e.total);
        setProgress(progress);
      },
    }
  )
  .then(res => setImage(res.data.secure_url))
  .catch(err => console.error(err));
};
