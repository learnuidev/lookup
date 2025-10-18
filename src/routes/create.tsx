import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { useGenerateLUTMutation } from "@/modules/generate-lut.mutation";

export const Route = createFileRoute("/create")({
	component: CreateLUTPage,
});

function CreateLUTPage() {
	const [beforeImage, setBeforeImage] = useState<File | null>(null);
	const [afterImage, setAfterImage] = useState<File | null>(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const generateLUTMutation = useGenerateLUTMutation();

	const validateFile = (file: File): string | null => {
		const validFormats = ["image/jpeg", "image/png", "image/webp"];
		const maxSize = 10 * 1024 * 1024; // 10MB

		if (!validFormats.includes(file.type)) {
			return `Unsupported file format: ${file.type}. Please use JPEG, PNG, or WebP.`;
		}

		if (file.size > maxSize) {
			return "File size exceeds 10MB limit.";
		}

		return null;
	};

	const handleFileChange = (file: File | null, type: "before" | "after") => {
		setErrors((prev) => ({ ...prev, [type]: "" }));

		if (!file) {
			if (type === "before") {
				setBeforeImage(null);
			} else {
				setAfterImage(null);
			}
			return;
		}

		const error = validateFile(file);
		if (error) {
			setErrors((prev) => ({ ...prev, [type]: error }));
			return;
		}

		if (type === "before") {
			setBeforeImage(file);
		} else {
			setAfterImage(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const newErrors: Record<string, string> = {};

		if (!beforeImage) {
			newErrors.before = "Before image is required";
		}

		if (!afterImage) {
			newErrors.after = "After image is required";
		}

		if (beforeImage && afterImage) {
			const beforeError = validateFile(beforeImage);
			const afterError = validateFile(afterImage);

			if (beforeError) newErrors.before = beforeError;
			if (afterError) newErrors.after = afterError;
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		if (!beforeImage || !afterImage) return;

		try {
			await generateLUTMutation.mutateAsync({
				beforeImage,
				afterImage,
				name: name.trim() || undefined,
				description: description.trim() || undefined,
			});
		} catch (error) {
			console.error("Failed to generate LUT:", error);
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const isProcessing = generateLUTMutation.isPending;

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<div className="container mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Link
						to="/"
						className="p-2 text-gray-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="w-6 h-6" />
					</Link>
					<div>
						<h1 className="text-3xl font-bold text-white">Create New LUT</h1>
						<p className="text-gray-400">
							Upload before and after images to generate a color lookup table
						</p>
					</div>
				</div>

				{/* Progress indicator */}
				{isProcessing && (
					<div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
						<div className="flex items-center gap-3">
							<Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
							<div>
								<div className="text-white font-medium">Generating LUT...</div>
								<div className="text-gray-400 text-sm">
									This may take up to 30 seconds
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Error display */}
				{generateLUTMutation.error && (
					<div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
						<div className="flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
							<div>
								<div className="text-white font-medium">Generation Failed</div>
								<div className="text-gray-300 text-sm">
									{generateLUTMutation.error instanceof Error
										? generateLUTMutation.error.message
										: "An unknown error occurred"}
								</div>
							</div>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
					{/* Image Upload Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						{/* Before Image */}
						<div>
							<label className="block text-white font-medium mb-3">
								Before Image
							</label>
							<div className="relative">
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp"
									onChange={(e) =>
										handleFileChange(e.target.files?.[0] || null, "before")
									}
									className="hidden"
									id="before-image"
									disabled={isProcessing}
								/>
								<label
									htmlFor="before-image"
									className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
										errors.before
											? "border-red-500 bg-red-900/10"
											: beforeImage
												? "border-cyan-500 bg-cyan-500/10"
												: "border-slate-600 hover:border-slate-500 bg-slate-800/50"
									} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									{beforeImage ? (
										<div className="space-y-4">
											<div className="text-cyan-400 font-medium">
												{beforeImage.name}
											</div>
											<div className="text-gray-400 text-sm">
												{formatFileSize(beforeImage.size)}
											</div>
											<button
												type="button"
												onClick={(e) => {
													e.preventDefault();
													handleFileChange(null, "before");
												}}
												className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
												disabled={isProcessing}
											>
												<X className="w-4 h-4" />
											</button>
										</div>
									) : (
										<div className="space-y-4">
											<Upload className="w-12 h-12 text-gray-400 mx-auto" />
											<div>
												<div className="text-white font-medium">
													Upload Before Image
												</div>
												<div className="text-gray-400 text-sm">
													JPEG, PNG, or WebP (max 10MB)
												</div>
											</div>
										</div>
									)}
								</label>
							</div>
							{errors.before && (
								<div className="mt-2 text-red-400 text-sm">{errors.before}</div>
							)}
						</div>

						{/* After Image */}
						<div>
							<label className="block text-white font-medium mb-3">
								After Image
							</label>
							<div className="relative">
								<input
									type="file"
									accept="image/jpeg,image/png,image/webp"
									onChange={(e) =>
										handleFileChange(e.target.files?.[0] || null, "after")
									}
									className="hidden"
									id="after-image"
									disabled={isProcessing}
								/>
								<label
									htmlFor="after-image"
									className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
										errors.after
											? "border-red-500 bg-red-900/10"
											: afterImage
												? "border-cyan-500 bg-cyan-500/10"
												: "border-slate-600 hover:border-slate-500 bg-slate-800/50"
									} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
								>
									{afterImage ? (
										<div className="space-y-4">
											<div className="text-cyan-400 font-medium">
												{afterImage.name}
											</div>
											<div className="text-gray-400 text-sm">
												{formatFileSize(afterImage.size)}
											</div>
											<button
												type="button"
												onClick={(e) => {
													e.preventDefault();
													handleFileChange(null, "after");
												}}
												className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
												disabled={isProcessing}
											>
												<X className="w-4 h-4" />
											</button>
										</div>
									) : (
										<div className="space-y-4">
											<Upload className="w-12 h-12 text-gray-400 mx-auto" />
											<div>
												<div className="text-white font-medium">
													Upload After Image
												</div>
												<div className="text-gray-400 text-sm">
													JPEG, PNG, or WebP (max 10MB)
												</div>
											</div>
										</div>
									)}
								</label>
							</div>
							{errors.after && (
								<div className="mt-2 text-red-400 text-sm">{errors.after}</div>
							)}
						</div>
					</div>

					{/* Optional Details */}
					<div className="space-y-6 mb-8">
						<div>
							<label
								htmlFor="name"
								className="block text-white font-medium mb-3"
							>
								LUT Name (Optional)
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="My Custom LUT"
								className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
								disabled={isProcessing}
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-white font-medium mb-3"
							>
								Description (Optional)
							</label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe the color grading style or purpose of this LUT..."
								rows={3}
								className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
								disabled={isProcessing}
							/>
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex justify-center">
						<button
							type="submit"
							disabled={!beforeImage || !afterImage || isProcessing}
							className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50 disabled:shadow-none flex items-center gap-3 min-w-[200px] justify-center"
						>
							{isProcessing ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Generating...
								</>
							) : (
								"Generate LUT"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
