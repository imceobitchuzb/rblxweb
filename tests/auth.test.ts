import { describe, it } from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { createSessionToken, verifySessionToken } from "../lib/auth/session";
import { validateLoginInput, validateRegisterInput } from "../lib/server/validation";
import { loginAction, registerAction, logoutAction } from "../app/actions/auth";

describe("Phase 7 - Authentication System", () => {
  it("Auth - 1. Password hashing and verification", async () => {
    const password = "SuperSecretPassword2026!";
    const hash = await hashPassword(password);

    assert.ok(hash && hash.length > 20, "Hash should be generated");
    assert.notStrictEqual(hash, password, "Hash must not equal plaintext password");

    const match = await verifyPassword(password, hash);
    assert.strictEqual(match, true, "Matching password should verify successfully");

    const mismatch = await verifyPassword("WrongPassword123", hash);
    assert.strictEqual(mismatch, false, "Wrong password should fail verification");
  });

  it("Auth - 2. Signed JWT Session token lifecycle", async () => {
    const payload = {
      sub: "user-test-uuid",
      email: "testcreator@roxiehub.gg",
      workspaceId: "workspace-test-uuid",
      role: "OWNER" as const,
      name: "Test Creator",
    };

    const token = await createSessionToken(payload);
    assert.ok(token && typeof token === "string", "JWT token string should be created");

    const verified = await verifySessionToken(token);
    assert.ok(verified, "Session token should be verified");
    assert.strictEqual(verified.sub, payload.sub);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.workspaceId, payload.workspaceId);
    assert.strictEqual(verified.role, "OWNER");

    // Invalid token verification
    const invalid = await verifySessionToken("invalid.jwt.token");
    assert.strictEqual(invalid, null, "Invalid token should decode to null");
  });

  it("Auth - 3. Registration input validation", () => {
    // Valid input
    const valid = validateRegisterInput({
      name: "Roxie",
      email: "roxie@example.com",
      password: "password123",
    });
    assert.strictEqual(valid.valid, true);

    // Short password
    const shortPass = validateRegisterInput({
      name: "Roxie",
      email: "roxie@example.com",
      password: "short",
    });
    assert.strictEqual(shortPass.valid, false);
    assert.ok(shortPass.errors.password);

    // Invalid email
    const invalidEmail = validateRegisterInput({
      name: "Roxie",
      email: "invalid-email",
      password: "password123",
    });
    assert.strictEqual(invalidEmail.valid, false);
    assert.ok(invalidEmail.errors.email);

    // Empty name
    const emptyName = validateRegisterInput({
      name: "",
      email: "roxie@example.com",
      password: "password123",
    });
    assert.strictEqual(emptyName.valid, false);
    assert.ok(emptyName.errors.name);
  });

  it("Auth - 4. Login input validation", () => {
    const valid = validateLoginInput({
      email: "creator@roxie.gg",
      password: "password123",
    });
    assert.strictEqual(valid.valid, true);

    const missingPass = validateLoginInput({
      email: "creator@roxie.gg",
      password: "",
    });
    assert.strictEqual(missingPass.valid, false);
    assert.ok(missingPass.errors.password);

    const invalidEmail = validateLoginInput({
      email: "bad-email",
      password: "password123",
    });
    assert.strictEqual(invalidEmail.valid, false);
    assert.ok(invalidEmail.errors.email);
  });

  it("Auth - 5. User registration creates account, workspace, and owner membership", async () => {
    const uniqueEmail = `creator-${Date.now()}@test.gg`;
    const regRes = await registerAction({
      name: "New Creator",
      email: uniqueEmail,
      password: "SecurePassword2026!",
      workspaceName: "Genesis Gaming Studio",
    });

    assert.strictEqual(regRes.success, true, "Registration should succeed");
    if (regRes.success) {
      assert.strictEqual(regRes.data.user.email, uniqueEmail);
      assert.strictEqual(regRes.data.user.name, "New Creator");
      assert.strictEqual(regRes.data.workspace.name, "Genesis Gaming Studio");
      assert.strictEqual(regRes.data.role, "OWNER");
    }

    // Duplicate email registration should fail
    const duplicateRes = await registerAction({
      name: "Another Creator",
      email: uniqueEmail,
      password: "SecurePassword2026!",
    });
    assert.strictEqual(duplicateRes.success, false);
    assert.ok(duplicateRes.error?.includes("already exists"));
  });

  it("Auth - 6. User login with valid and invalid credentials", async () => {
    // 1. Valid login with demo user
    const loginRes = await loginAction({
      email: "roxie@bloxmedia.gg",
      password: "RoxieHub2026!",
    });

    assert.strictEqual(loginRes.success, true, "Demo login should succeed");
    if (loginRes.success) {
      assert.strictEqual(loginRes.data.user.email, "roxie@bloxmedia.gg");
      assert.strictEqual(loginRes.data.role, "OWNER");
    }

    // 2. Invalid password
    const badPassRes = await loginAction({
      email: "roxie@bloxmedia.gg",
      password: "WrongPassword!",
    });
    assert.strictEqual(badPassRes.success, false);
    assert.strictEqual(badPassRes.error, "Invalid email or password.");

    // 3. Unknown email
    const unknownRes = await loginAction({
      email: "nonexistent@bloxmedia.gg",
      password: "Password123!",
    });
    assert.strictEqual(unknownRes.success, false);
    assert.strictEqual(unknownRes.error, "Invalid email or password.");
  });

  it("Auth - 7. User logout cleans up session", async () => {
    const res = await logoutAction();
    assert.strictEqual(res.success, true);
  });
});
