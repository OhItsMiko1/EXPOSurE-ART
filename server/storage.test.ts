import { beforeEach, describe, expect, it } from "vitest";
import { MemStorage } from "./storage";

describe("MemStorage", () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  it("seeds the default categories on construction", async () => {
    const categories = await storage.getCategories();
    expect(categories.map((c) => c.name)).toEqual([
      "Digital",
      "Painting",
      "Illustration",
      "Photography",
      "Sculpture",
    ]);
  });

  it("creates a user and looks it up by username and email", async () => {
    const created = await storage.createUser({
      username: "artlover",
      password: "hunter2",
      email: "artlover@example.com",
      fullName: "Art Lover",
    });

    expect(created.id).toBeDefined();
    expect(await storage.getUserByUsername("artlover")).toMatchObject({ id: created.id });
    expect(await storage.getUserByEmail("artlover@example.com")).toMatchObject({ id: created.id });
  });

  it("creates artworks and filters them by artist", async () => {
    const artist = await storage.createUser({
      username: "artist1",
      password: "hunter2",
      email: "artist1@example.com",
      fullName: "Artist One",
      isArtist: true,
    });
    const otherArtist = await storage.createUser({
      username: "artist2",
      password: "hunter2",
      email: "artist2@example.com",
      fullName: "Artist Two",
      isArtist: true,
    });

    await storage.createArtwork({
      title: "Piece One",
      price: 50,
      imageUrl: "https://example.com/one.png",
      artistId: artist.id,
      categoryId: 1,
    });
    await storage.createArtwork({
      title: "Piece Two",
      price: 75,
      imageUrl: "https://example.com/two.png",
      artistId: otherArtist.id,
      categoryId: 1,
    });

    const artistWorks = await storage.getArtworksByArtist(artist.id);
    expect(artistWorks).toHaveLength(1);
    expect(artistWorks[0].title).toBe("Piece One");
  });

  it("updates and deletes an artwork", async () => {
    const artist = await storage.createUser({
      username: "artist1",
      password: "hunter2",
      email: "artist1@example.com",
      fullName: "Artist One",
      isArtist: true,
    });
    const artwork = await storage.createArtwork({
      title: "Original Title",
      price: 50,
      imageUrl: "https://example.com/one.png",
      artistId: artist.id,
      categoryId: 1,
    });

    const updated = await storage.updateArtwork(artwork.id, { title: "Updated Title" });
    expect(updated?.title).toBe("Updated Title");

    const deleted = await storage.deleteArtwork(artwork.id);
    expect(deleted).toBe(true);
    expect(await storage.getArtwork(artwork.id)).toBeUndefined();
  });
});
