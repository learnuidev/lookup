import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Eye, Plus, Search } from "lucide-react";
import { useState } from "react";
import { getLUTs, getStorageStats } from "@/lib/storage";
import type { LUT } from "@/types/lut";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: luts = [], isLoading: lutsLoading } = useQuery({
		queryKey: ["luts"],
		queryFn: getLUTs,
	});

	const { data: stats } = useQuery({
		queryKey: ["storage-stats"],
		queryFn: getStorageStats,
	});

	const filteredLUTs = luts.filter(
		(lut) =>
			lut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			lut.description?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	console.log("LUTS", luts);

	if (lutsLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<div className="container mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
					<div>
						<h1 className="text-4xl font-bold text-white mb-2">Lookup</h1>
						<p className="text-gray-400">
							Generate and explore Color Lookup Tables (LUTs)
						</p>
					</div>
					<Link
						to="/create"
						className="mt-4 md:mt-0 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50 flex items-center gap-2"
					>
						<Plus className="w-5 h-5" />
						Create New LUT
					</Link>
				</div>

				{/* Stats */}
				{stats && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
							<div className="text-3xl font-bold text-white mb-2">
								{stats.count}
							</div>
							<div className="text-gray-400">Total LUTs</div>
						</div>
						<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
							<div className="text-3xl font-bold text-white mb-2">
								{formatFileSize(stats.totalStorage)}
							</div>
							<div className="text-gray-400">Storage Used</div>
						</div>
						<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
							<div className="text-3xl font-bold text-white mb-2">30 days</div>
							<div className="text-gray-400">Auto-cleanup Period</div>
						</div>
					</div>
				)}

				{/* Search */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search LUTs by name or description..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
						/>
					</div>
				</div>

				{/* LUTs Grid */}
				{filteredLUTs.length === 0 ? (
					<div className="text-center py-16">
						<div className="text-gray-400 mb-4">
							{searchQuery
								? "No LUTs found matching your search."
								: "No LUTs generated yet."}
						</div>
						{!searchQuery && (
							<Link
								to="/create"
								className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
							>
								<Plus className="w-5 h-5" />
								Create Your First LUT
							</Link>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredLUTs.map((lut: LUT) => (
							<div
								key={lut.id}
								className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
							>
								<div className="flex justify-between items-start mb-4">
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-white mb-1">
											{lut.name}
										</h3>
										{lut.description && (
											<p className="text-gray-400 text-sm mb-2">
												{lut.description}
											</p>
										)}
										<div className="text-xs text-gray-500">
											{formatDate(lut.createdAt)}
										</div>
									</div>
									<div className="flex gap-2">
										<Link
											to={`/luts/${lut.id}`}
											className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
											title="View details"
										>
											<Eye className="w-4 h-4" />
										</Link>
									</div>
								</div>

								<div className="flex items-center justify-between text-sm text-gray-400 mb-4">
									<span>{lut.format.toUpperCase()}</span>
									<span>{lut.steps?.length || 0} steps</span>
									<span>{lut.metadata?.processingTime || 0}ms</span>
								</div>

								<div className="text-xs text-gray-500 mb-4">
									{lut.metadata?.imageSize?.width || 0}×{lut.metadata?.imageSize?.height || 0}{" "}
									• {lut.metadata?.colorSpace || "Unknown"}
								</div>

								<div className="flex gap-2">
									<button
										className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
										onClick={() => {
											// TODO: Implement download functionality
											const blob = new Blob([lut.lutData], {
												type: "text/plain",
											});
											const url = URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = `${lut.name}.${lut.format}`;
											a.click();
											URL.revokeObjectURL(url);
										}}
									>
										<Download className="w-3 h-3" />
										Download
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
