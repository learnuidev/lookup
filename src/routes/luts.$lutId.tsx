import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	MiniMap,
	type Node,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import {
	AlertCircle,
	ArrowLeft,
	BarChart3,
	Clock,
	Download,
	Monitor,
	Palette,
} from "lucide-react";
import { getLUTById } from "@/lib/storage";
import "@xyflow/react/dist/style.css";

export const Route = createFileRoute("/luts/$lutId")({
	component: LUTDetailPage,
});

function LUTDetailPage() {
	const { lutId } = Route.useParams();

	const {
		data: lut,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["lut", lutId],
		queryFn: () => getLUTById(lutId),
		enabled: !!lutId,
	});

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
				<div className="text-white">Loading LUT details...</div>
			</div>
		);
	}

	if (error || !lut) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
					<div className="text-white text-xl mb-2">LUT Not Found</div>
					<div className="text-gray-400 mb-6">
						The LUT you're looking for doesn't exist or has been deleted.
					</div>
					<Link
						to="/"
						className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
					>
						Back to Home
					</Link>
				</div>
			</div>
		);
	}

	return <LUTDetail lut={lut} />;
}

function LUTDetail({ lut }: { lut: any }) {
	const { nodes: initialNodes, edges: initialEdges } = createWorkflowElements(
		lut.steps || [],
	);
	const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const nodeTypes = {
		custom: CustomNode,
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const getStepTypeColor = (type: string) => {
		switch (type) {
			case "analysis":
				return "bg-blue-500/20 border-blue-500 text-blue-400";
			case "transformation":
				return "bg-green-500/20 border-green-500 text-green-400";
			case "validation":
				return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
			case "export":
				return "bg-purple-500/20 border-purple-500 text-purple-400";
			default:
				return "bg-gray-500/20 border-gray-500 text-gray-400";
		}
	};

	const handleDownload = () => {
		const blob = new Blob([lut.lutData], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${lut.name}.${lut.format}`;
		a.click();
		URL.revokeObjectURL(url);
	};

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
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-white mb-1">{lut.name}</h1>
						{lut.description && (
							<p className="text-gray-400">{lut.description}</p>
						)}
					</div>
					<button
						onClick={handleDownload}
						className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
					>
						<Download className="w-4 h-4" />
						Download
					</button>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
						<div className="flex items-center gap-3 mb-2">
							<Clock className="w-5 h-5 text-cyan-400" />
							<div className="text-gray-400 text-sm">Processing Time</div>
						</div>
						<div className="text-2xl font-bold text-white">
							{lut.metadata.processingTime}ms
						</div>
					</div>

					<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
						<div className="flex items-center gap-3 mb-2">
							<Monitor className="w-5 h-5 text-cyan-400" />
							<div className="text-gray-400 text-sm">Resolution</div>
						</div>
						<div className="text-2xl font-bold text-white">
							{lut.metadata.imageSize.width}×{lut.metadata.imageSize.height}
						</div>
					</div>

					<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
						<div className="flex items-center gap-3 mb-2">
							<Palette className="w-5 h-5 text-cyan-400" />
							<div className="text-gray-400 text-sm">Color Space</div>
						</div>
						<div className="text-2xl font-bold text-white">
							{lut.metadata.colorSpace}
						</div>
					</div>

					<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
						<div className="flex items-center gap-3 mb-2">
							<BarChart3 className="w-5 h-5 text-cyan-400" />
							<div className="text-gray-400 text-sm">Steps</div>
						</div>
						<div className="text-2xl font-bold text-white">
							{lut.steps?.length || 0}
						</div>
					</div>
				</div>

				{/* Workflow Visualization */}
				<div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
					<h2 className="text-xl font-semibold text-white mb-6">
						Process Workflow
					</h2>
					<div className="h-96 border border-slate-600 rounded-lg bg-slate-900/50">
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesChange={onEdgesChange}
							nodeTypes={nodeTypes}
							fitView
							attributionPosition="bottom-left"
						>
							<Background
								variant={BackgroundVariant.dots}
								gap={16}
								size={1}
								color="#374151"
							/>
							<Controls />
							<MiniMap
								nodeColor={(node) => {
									const type = node.data.type;
									switch (type) {
										case "analysis":
											return "#3b82f6";
										case "transformation":
											return "#10b981";
										case "validation":
											return "#eab308";
										case "export":
											return "#a855f7";
										default:
											return "#6b7280";
									}
								}}
								position="top-right"
							/>
						</ReactFlow>
					</div>
				</div>

				{/* Process Steps Details */}
				<div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
					<h2 className="text-xl font-semibold text-white mb-6">
						Process Steps
					</h2>
					<div className="space-y-4">
						{lut.steps?.map((step: any, index: number) => (
							<div
								key={step.id}
								className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
											{index + 1}
										</div>
										<div>
											<h3 className="text-white font-medium">{step.name}</h3>
											<div className="flex items-center gap-4 mt-1">
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium border ${getStepTypeColor(step.type)}`}
												>
													{step.type}
												</span>
												<span className="text-gray-400 text-sm">
													{step.latency}ms
												</span>
												<span className="text-gray-400 text-sm">
													{new Date(step.timestamp).toLocaleTimeString()}
												</span>
											</div>
										</div>
									</div>
								</div>

								{step.metadata && (
									<div className="mt-3 space-y-2">
										{Object.entries(step.metadata).map(([key, value]) => (
											<div
												key={key}
												className="flex items-center gap-2 text-sm"
											>
												<span className="text-gray-500">{key}:</span>
												<span className="text-gray-300">
													{typeof value === "object"
														? JSON.stringify(value)
														: String(value)}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Metadata */}
				<div className="mt-8 text-center text-gray-400 text-sm">
					<div>Created: {formatDate(lut.createdAt)}</div>
					<div className="mt-1">Last Updated: {formatDate(lut.updatedAt)}</div>
				</div>
			</div>
		</div>
	);
}

function createWorkflowElements(steps: any[]) {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	const _nodeWidth = 200;
	const _nodeHeight = 120;
	const verticalGap = 150;
	const horizontalGap = 250;

	steps.forEach((step, index) => {
		const x = (index % 3) * horizontalGap + 50;
		const y = Math.floor(index / 3) * verticalGap + 50;

		nodes.push({
			id: step.id,
			type: "custom",
			position: { x, y },
			data: {
				step,
				type: step.type,
			},
		});

		// Create edge to next step
		if (index < steps.length - 1) {
			edges.push({
				id: `edge-${step.id}-${steps[index + 1].id}`,
				source: step.id,
				target: steps[index + 1].id,
				type: "smoothstep",
				animated: true,
				style: {
					stroke: "#06b6d4",
					strokeWidth: 2,
				},
			});
		}
	});

	return { nodes, edges };
}

function CustomNode({ data }: { data: any }) {
	const step = data.step;
	const getStepTypeColor = (type: string) => {
		switch (type) {
			case "analysis":
				return "bg-blue-500/20 border-blue-500 text-blue-400";
			case "transformation":
				return "bg-green-500/20 border-green-500 text-green-400";
			case "validation":
				return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
			case "export":
				return "bg-purple-500/20 border-purple-500 text-purple-400";
			default:
				return "bg-gray-500/20 border-gray-500 text-gray-400";
		}
	};

	return (
		<div
			className={`px-4 py-3 border rounded-lg backdrop-blur-sm min-w-[200px] ${getStepTypeColor(step.type)}`}
		>
			<div className="font-medium text-sm mb-1">{step.name}</div>
			<div className="text-xs opacity-75">{step.latency}ms</div>
			{step.metadata?.executionTime && (
				<div className="text-xs opacity-75 mt-1">
					Exec: {step.metadata.executionTime}ms
				</div>
			)}
		</div>
	);
}
