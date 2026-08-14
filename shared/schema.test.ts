import { describe, expect, it } from "vitest";
import { insertArtworkSchema, insertUserSchema } from "./schema";

describe("insertUserSchema", () => {
  it("accepts a valid user payload", () => {
    const result = insertUserSchema.safeParse({
      username: "artlover",
      password: "hunter2",
      email: "artlover@example.com",
      fullName: "Art Lover",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const result = insertUserSchema.safeParse({
      password: "hunter2",
      email: "artlover@example.com",
      fullName: "Art Lover",
    });

    expect(result.success).toBe(false);
  });
});

describe("insertArtworkSchema", () => {
  it("accepts a valid artwork payload", () => {
    const result = insertArtworkSchema.safeParse({
      title: "Neon Spirits",
      price: 120,
      imageUrl: "https://example.com/artwork.png",
      artistId: 1,
      categoryId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const result = insertArtworkSchema.safeParse({
      price: 120,
      imageUrl: "https://example.com/artwork.png",
      artistId: 1,
      categoryId: 1,
    });

    expect(result.success).toBe(false);
  });
});
