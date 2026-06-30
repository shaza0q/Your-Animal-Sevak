import { api } from "@/lib/api";

export interface AnimalPhotoResult {
  id: string;
  photoUrl: string | null;
}

export const uploadAnimalPhoto = async (
  animalId: string,
  file: File,
): Promise<AnimalPhotoResult> => {
  const formData = new FormData();
  formData.append("photo", file);

  const res = await api.post<{ success: boolean; data: AnimalPhotoResult }>(
    `/animal/${animalId}/photo`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
};
