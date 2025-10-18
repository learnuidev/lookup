export interface ProcessStep {
	id: string;
	name: string;
	type: "analysis" | "transformation" | "validation" | "export";
	input?: any;
	output?: any;
	latency: number;
	timestamp: number;
	metadata?: Record<string, any>;
}

export interface LUTResult {
	lutData: string;
	format: "cube" | "3dl";
	steps: ProcessStep[];
	metadata: {
		generatedAt: number;
		processingTime: number;
		imageSize: { width: number; height: number };
		colorSpace: string;
	};
}

export interface LUT {
	id: string;
	name: string;
	description?: string;
	lutData: string;
	format: "cube" | "3dl";
	steps: ProcessStep[];
	metadata: {
		generatedAt: number;
		processingTime: number;
		imageSize: { width: number; height: number };
		colorSpace: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface LUTGenerationInput {
	beforeImage: File;
	afterImage: File;
	name?: string;
	description?: string;
}

export interface LUTStorage {
	luts: LUT[];
	totalStorage: number;
	lastCleanup: Date;
}
