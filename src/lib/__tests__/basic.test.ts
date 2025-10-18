import { describe, expect, it } from "vitest";

describe("Basic functionality", () => {
	it("should run a basic test", () => {
		expect(1 + 1).toBe(2);
	});

	it("should handle file creation", () => {
		const file = new File(["test content"], "test.jpg", { type: "image/jpeg" });
		expect(file.name).toBe("test.jpg");
		expect(file.type).toBe("image/jpeg");
		expect(file.size).toBe(12); // 'test content' length
	});
});
