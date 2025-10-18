import { useMutation } from "@tanstack/react-query";

import { pinata } from "@/utils/config";

export function useUploadJsonMutation() {
  return useMutation({
    mutationFn: async (data: JSON) => {
      return await pinata.upload.public.json(data);
    },
  });
}

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const url = await pinata.upload.public.createSignedURL({
        expires: 60 * 60 * 24 * 90, // 3 mos
      });
      return await pinata.upload.public.file(file).url(url);
    },
  });
}
