import type { LUT } from "@/types/lut";

const STORAGE_KEY = "lookup_luts";
const CLEANUP_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// In-memory storage for server-side
let memoryStorage: LUT[] = [];

function isClient(): boolean {
	return typeof window !== "undefined";
}

function getStorage(): LUT[] {
	if (isClient()) {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}
	return memoryStorage;
}

function setStorage(luts: LUT[]): void {
	if (isClient()) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(luts));
		} catch (error) {
			console.error("Failed to save to localStorage:", error);
		}
	} else {
		memoryStorage = luts;
	}
}

export async function saveLUT(lut: LUT): Promise<void> {
	const luts = getStorage();
	luts.push(lut);
	setStorage(luts);
}

export async function getLUTs(): Promise<LUT[]> {
	cleanupOldLUTs();
	return getStorage();
}

export async function getLUTById(id: string): Promise<LUT | null> {
	const luts = await getLUTs();
	return luts.find((lut) => lut.id === id) || null;
}

export async function deleteLUT(id: string): Promise<void> {
	const luts = getStorage();
	const filteredLUTs = luts.filter((lut) => lut.id !== id);
	setStorage(filteredLUTs);
}

export async function updateLUT(
	id: string,
	updates: Partial<LUT>,
): Promise<LUT | null> {
	const luts = getStorage();
	const index = luts.findIndex((lut) => lut.id === id);

	if (index === -1) return null;

	luts[index] = {
		...luts[index],
		...updates,
		updatedAt: new Date(),
	};

	setStorage(luts);
	return luts[index];
}

export async function searchLUTs(query: string): Promise<LUT[]> {
	const luts = await getLUTs();
	const lowercaseQuery = query.toLowerCase();

	return luts.filter(
		(lut) =>
			lut.name.toLowerCase().includes(lowercaseQuery) ||
			lut.description?.toLowerCase().includes(lowercaseQuery),
	);
}

function cleanupOldLUTs(): void {
	const luts = getStorage();
	const cutoffTime = Date.now() - CLEANUP_INTERVAL;
	const filteredLUTs = luts.filter(
		(lut) => new Date(lut.createdAt).getTime() > cutoffTime,
	);

	if (filteredLUTs.length !== luts.length) {
		setStorage(filteredLUTs);
	}
}

export async function getStorageStats(): Promise<{
	count: number;
	totalStorage: number;
}> {
	const luts = await getLUTs();
	const totalStorage = luts.reduce((total, lut) => {
		return total + JSON.stringify(lut).length;
	}, 0);

	return {
		count: luts.length,
		totalStorage,
	};
}

export async function exportLUT(
	lutId: string,
	format: "cube" | "3dl" = "cube",
): Promise<string | null> {
	const lut = await getLUTById(lutId);
	if (!lut) return null;

	if (format === "cube" || lut.format === "cube") {
		return lut.lutData;
	}

	// Convert to 3DL format if needed (simplified conversion)
	if (format === "3dl" && lut.format === "cube") {
		// Basic cube to 3dl conversion
		const lines = lut.lutData.split("\n");
		let cubeSize = 33;

		for (const line of lines) {
			if (line.startsWith("LUT_3D_SIZE")) {
				cubeSize = parseInt(line.split(" ")[1], 10);
				break;
			}
		}

		let threeDLContent = `3DMESH\n${cubeSize} ${cubeSize} ${cubeSize}\n`;

		// Extract the data values from cube format
		const dataStart = lines.findIndex(
			(line) => line.includes(".") && line.split(" ").length === 3,
		);

		if (dataStart !== -1) {
			for (let i = dataStart; i < lines.length; i++) {
				const line = lines[i].trim();
				if (line?.includes(".")) {
					const values = line.split(" ").map((v) => parseFloat(v));
					if (values.length === 3) {
						// Convert 0-1 range to 0-4095 for 3DL
						const r = Math.round(values[0] * 4095);
						const g = Math.round(values[1] * 4095);
						const b = Math.round(values[2] * 4095);
						threeDLContent += `${r} ${g} ${b}\n`;
					}
				}
			}
		}

		return threeDLContent;
	}

	return lut.lutData;
}
