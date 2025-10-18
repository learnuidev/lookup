import { useMutation } from "@tanstack/react-query";
import { generateLUT } from "@/lib/generate-lut";
import { type LUT, type LUTGenerationInput, saveLUT } from "@/lib/storage";

export function useGenerateLUTMutation() {
	return useMutation({
		mutationFn: async (input: LUTGenerationInput): Promise<LUT> => {
			const steps: any[] = [];

			const lutResult = await generateLUT({
				beforeImage: input.beforeImage,
				afterImage: input.afterImage,
				onStep: (step) => {
					steps.push(step);
				},
			});

			const lut: LUT = {
				id: `lut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				name: input.name || `LUT_${new Date().toISOString().slice(0, 10)}`,
				description: input.description,
				lutData: lutResult.lutData,
				format: lutResult.format,
				steps: lutResult.steps,
				metadata: lutResult.metadata,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Save to storage
			await saveLUT(lut);

			return lut;
		},
		onError: (error) => {
			console.error("LUT generation failed:", error);
		},
	});
}
