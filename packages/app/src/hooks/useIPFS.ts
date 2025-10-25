import { useMutation, useQuery } from "@tanstack/react-query";

import { pinata } from "@/utils/config";

export function useUploadJsonMutation() {
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ipfs/upload-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to upload JSON to IPFS");
      }

      return await response.json();
    },
  });
}

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ipfs/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file to IPFS");
      }

      return await response.json();
    },
  });
}

export function useFetchMetadataQuery(cid: string) {
  return useQuery({
    queryKey: ["metadata", cid],
    queryFn: async () => await pinata.gateways.public.get(cid),
    enabled: cid !== "",
  });
}
