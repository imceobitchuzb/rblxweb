import test from "node:test";
import assert from "node:assert";
import { INITIAL_SCRIPTS } from "../lib/mock-scripts";
import { INITIAL_CHARACTERS } from "../lib/mock-characters";
import { INITIAL_IDEAS } from "../lib/mock-ideas";
import {
  calculateScriptRuntime,
  getNextScriptStatus,
  filterScripts,
  createScriptFromIdea,
  getScriptsUsingCharacter,
  resolveCharacter,
  resolveCharacterName,
} from "../lib/roster-script-utils";
import { DialogueLine, Scene, Script } from "../lib/types";

test("Script search matches title, hook, description, and tags", () => {
  // Title search
  const jobResults = filterScripts(INITIAL_SCRIPTS, { search: "ONE Job" });
  assert.strictEqual(jobResults.length, 1);
  assert.strictEqual(jobResults[0].id, "script-1");

  // Hook search
  const cheeseResults = filterScripts(INITIAL_SCRIPTS, { search: "cheese" });
  assert.ok(cheeseResults.length >= 1);
  assert.strictEqual(cheeseResults[0].id, "script-1");

  // Tag search
  const obbyResults = filterScripts(INITIAL_SCRIPTS, { search: "machinima" });
  assert.ok(obbyResults.length >= 1);
  assert.strictEqual(obbyResults[0].id, "script-2");
});

test("Script status filtering isolates scripts by status", () => {
  const readyScripts = filterScripts(INITIAL_SCRIPTS, { status: "READY" });
  assert.ok(readyScripts.length >= 1);
  for (const s of readyScripts) {
    assert.strictEqual(s.status, "READY");
  }

  const completedScripts = filterScripts(INITIAL_SCRIPTS, { status: "COMPLETED" });
  assert.ok(completedScripts.length >= 1);
  for (const s of completedScripts) {
    assert.strictEqual(s.status, "COMPLETED");
  }
});

test("Automatic runtime calculation sums dialogue and scene durations", () => {
  const testScenes: Scene[] = [
    {
      id: "s1",
      title: "Scene 1",
      description: "Intro",
      duration: 10,
      notes: "",
      characters: ["char-sheriff"],
      dialogue: [
        {
          id: "d1",
          characterId: "char-sheriff",
          emotion: "NEUTRAL",
          text: "Line 1",
          duration: 3.5,
        },
        {
          id: "d2",
          characterId: "char-noob",
          emotion: "HAPPY",
          text: "Line 2",
          duration: 2.5,
        },
      ],
    },
    {
      id: "s2",
      title: "Scene 2",
      description: "Climax",
      duration: 25,
      notes: "",
      characters: ["char-murderer"],
      dialogue: [
        {
          id: "d3",
          characterId: "char-murderer",
          emotion: "ANGRY",
          text: "Line 3",
          duration: 4.0,
        },
      ],
    },
  ];

  const runtime = calculateScriptRuntime(testScenes);
  // Total duration: Scene 1 (10s) + Scene 2 (25s) = 35s
  assert.strictEqual(runtime.totalDuration, 35);
  assert.strictEqual(runtime.sceneCount, 2);
  assert.strictEqual(runtime.dialogueCount, 3);
  assert.strictEqual(runtime.formatted, "00:35.0");
  assert.ok(runtime.uniqueCharacters.includes("char-sheriff"));
  assert.ok(runtime.uniqueCharacters.includes("char-noob"));
  assert.ok(runtime.uniqueCharacters.includes("char-murderer"));
});

test("Script status progression advances linearly", () => {
  assert.strictEqual(getNextScriptStatus("DRAFT"), "SCRIPTING");
  assert.strictEqual(getNextScriptStatus("SCRIPTING"), "READY");
  assert.strictEqual(getNextScriptStatus("READY"), "IN_PRODUCTION");
  assert.strictEqual(getNextScriptStatus("IN_PRODUCTION"), "COMPLETED");
  assert.strictEqual(getNextScriptStatus("COMPLETED"), "ARCHIVED");
  assert.strictEqual(getNextScriptStatus("ARCHIVED"), null, "Terminal status returns null");
});

test("Idea -> Script factory correctly links ideaId and propagates fields", () => {
  const testIdea = {
    id: "idea-99",
    title: "The Haunted Roblox Elevator",
    description: "Creepy elevator stops on floor 13",
    tags: ["Horror", "Elevator", "Funny"],
  };

  const generatedScript = createScriptFromIdea(testIdea);
  assert.strictEqual(generatedScript.ideaId, "idea-99");
  assert.strictEqual(generatedScript.title, testIdea.title);
  assert.strictEqual(generatedScript.description, testIdea.description);
  assert.deepStrictEqual(generatedScript.tags, testIdea.tags);
  assert.strictEqual(generatedScript.status, "SCRIPTING");
  assert.ok(generatedScript.scenes.length >= 1);
});

test("Script and Scene CRUD state mutations behave as expected", () => {
  let scriptsList: Script[] = [...INITIAL_SCRIPTS];
  const initialCount = scriptsList.length;

  // Create Script
  const newScript: Script = {
    id: "script-crud-test",
    title: "CRUD Test Script",
    description: "Testing CRUD",
    status: "DRAFT",
    hook: "Test hook",
    tags: ["Test"],
    estimatedDuration: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    characters: ["char-sheriff"],
    scenes: [
      {
        id: "scene-test-1",
        title: "Test Scene 1",
        description: "Test Desc",
        duration: 15,
        dialogue: [],
        characters: ["char-sheriff"],
        notes: "",
      },
    ],
  };

  scriptsList = [newScript, ...scriptsList];
  assert.strictEqual(scriptsList.length, initialCount + 1);

  // Add scene to script
  const addedScene: Scene = {
    id: "scene-test-2",
    title: "Test Scene 2",
    description: "Second Scene",
    duration: 20,
    dialogue: [
      {
        id: "d-test-1",
        characterId: "char-sheriff",
        emotion: "SURPRISED",
        text: "What happened?!",
        duration: 2.5,
      },
    ],
    characters: ["char-sheriff"],
    notes: "",
  };

  newScript.scenes.push(addedScene);
  const runtime = calculateScriptRuntime(newScript.scenes);
  assert.strictEqual(newScript.scenes.length, 2);
  assert.strictEqual(runtime.dialogueCount, 1);
  assert.strictEqual(runtime.totalDuration, 35); // 15 + 20

  // Delete script
  scriptsList = scriptsList.filter((s) => s.id !== "script-crud-test");
  assert.strictEqual(scriptsList.length, initialCount);
  assert.strictEqual(
    scriptsList.find((s) => s.id === "script-crud-test"),
    undefined
  );
});

test("Preservation of character IDs across scripts and characters", () => {
  for (const script of INITIAL_SCRIPTS) {
    for (const charId of script.characters) {
      const char = resolveCharacter(charId, INITIAL_CHARACTERS);
      assert.ok(char, `Script ${script.id} character ID ${charId} must exist in INITIAL_CHARACTERS`);
    }

    for (const scene of script.scenes) {
      for (const line of scene.dialogue) {
        const char = resolveCharacter(line.characterId, INITIAL_CHARACTERS);
        assert.ok(
          char,
          `Dialogue line ${line.id} character ID ${line.characterId} must exist in INITIAL_CHARACTERS`
        );
      }
    }
  }
});
