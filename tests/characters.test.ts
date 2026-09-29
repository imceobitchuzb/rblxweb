import test from "node:test";
import assert from "node:assert";
import { INITIAL_CHARACTERS } from "../lib/mock-characters";
import { INITIAL_SCRIPTS } from "../lib/mock-scripts";
import {
  filterCharacters,
  validateCharacterForm,
  getScriptsUsingCharacter,
  resolveCharacter,
  resolveCharacterName,
} from "../lib/roster-script-utils";
import { Character } from "../lib/types";

test("Character search matches name, description, personality, and tags", () => {
  // Name search
  const sheriffResults = filterCharacters(INITIAL_CHARACTERS, { search: "Knox" });
  assert.strictEqual(sheriffResults.length, 1);
  assert.strictEqual(sheriffResults[0].id, "char-sheriff");

  // Personality search
  const cluelessResults = filterCharacters(INITIAL_CHARACTERS, { search: "clueless" });
  assert.ok(cluelessResults.length >= 1);
  assert.strictEqual(cluelessResults[0].id, "char-noob");

  // Tag search
  const parkourResults = filterCharacters(INITIAL_CHARACTERS, { search: "parkour" });
  assert.ok(parkourResults.length >= 1);
  assert.strictEqual(parkourResults[0].id, "char-ninja");
});

test("Character role filtering isolates specific roles", () => {
  const villainResults = filterCharacters(INITIAL_CHARACTERS, { role: "VILLAIN" });
  assert.ok(villainResults.length >= 2);
  for (const c of villainResults) {
    assert.strictEqual(c.role, "VILLAIN");
  }

  const mainResults = filterCharacters(INITIAL_CHARACTERS, { role: "MAIN" });
  assert.ok(mainResults.length >= 2);
  for (const c of mainResults) {
    assert.strictEqual(c.role, "MAIN");
  }
});

test("Character form validation enforces required fields", () => {
  // Empty name
  const res1 = validateCharacterForm({
    name: "",
    role: "MAIN",
    description: "Good detective",
  });
  assert.strictEqual(res1.isValid, false);
  assert.ok(res1.errors.name);

  // Missing description
  const res2 = validateCharacterForm({
    name: "Valid Name",
    role: "MAIN",
    description: "",
  });
  assert.strictEqual(res2.isValid, false);
  assert.ok(res2.errors.description);

  // Invalid role
  const res3 = validateCharacterForm({
    name: "Valid Name",
    role: "INVALID_ROLE",
    description: "Valid description",
  });
  assert.strictEqual(res3.isValid, false);
  assert.ok(res3.errors.role);

  // Valid
  const res4 = validateCharacterForm({
    name: "Valid Hero",
    role: "MAIN",
    description: "Valid description here",
  });
  assert.strictEqual(res4.isValid, true);
  assert.strictEqual(Object.keys(res4.errors).length, 0);
});

test("Character CRUD lifecycle works correctly", () => {
  let roster: Character[] = [...INITIAL_CHARACTERS];
  const initialLength = roster.length;

  // Create
  const newChar: Character = {
    id: "char-test-new",
    name: "Test Hacker",
    role: "SPECIAL_GUEST",
    description: "Test description",
    personality: "Enigmatic",
    outfit: "Cyber hoodie",
    avatar: "https://example.com/avatar.png",
    tags: ["Hacker", "Test"],
    notes: "Audio distorted voice",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  roster = [newChar, ...roster];
  assert.strictEqual(roster.length, initialLength + 1);
  assert.strictEqual(roster[0].id, "char-test-new");

  // Update
  roster = roster.map((c) =>
    c.id === "char-test-new" ? { ...c, name: "Renamed Hacker" } : c
  );
  assert.strictEqual(roster[0].name, "Renamed Hacker");

  // Delete
  roster = roster.filter((c) => c.id !== "char-test-new");
  assert.strictEqual(roster.length, initialLength);
  assert.strictEqual(roster.find((c) => c.id === "char-test-new"), undefined);
});

test("Cross-module character -> script lookup finds referenced scripts", () => {
  // Sheriff Knox is in script-1, script-2, script-5
  const knoxScripts = getScriptsUsingCharacter("char-sheriff", INITIAL_SCRIPTS);
  assert.ok(knoxScripts.length >= 2, "Sheriff should appear in multiple scripts");
  const knoxTitles = knoxScripts.map((s) => s.title);
  assert.ok(knoxTitles.includes("He Had ONE Job"));

  // Slick Blade (The Murderer) is in script-1, script-2, script-3
  const bladeScripts = getScriptsUsingCharacter("char-murderer", INITIAL_SCRIPTS);
  assert.ok(bladeScripts.length >= 2);
});

test("Character resolver maps IDs to character records and names", () => {
  const sheriff = resolveCharacter("char-sheriff", INITIAL_CHARACTERS);
  assert.ok(sheriff);
  assert.strictEqual(sheriff?.name, "Sheriff Knox");

  const name = resolveCharacterName("char-noob", INITIAL_CHARACTERS);
  assert.strictEqual(name, "Bacon Benny (The Noob)");

  const unknown = resolveCharacterName("non-existent-id", INITIAL_CHARACTERS);
  assert.strictEqual(unknown, "Unknown Character");
});
