import { PrismaClient } from "@prisma/client";
import { INITIAL_IDEAS } from "../lib/mock-ideas";
import { INITIAL_CHARACTERS } from "../lib/mock-characters";
import { INITIAL_SCRIPTS } from "../lib/mock-scripts";
import { INITIAL_VIDEOS } from "../lib/mock-videos";
import { INITIAL_CALENDAR_EVENTS } from "../lib/mock-calendar";
import { DEMO_CREATOR_TAG, DEMO_USER_EMAIL, DEMO_USER_ID, DEMO_USER_NAME } from "../lib/server/user-context";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ROXIE HUB Database Seed...");

  // 1. Seed Demo User / Workspace
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      creatorTag: DEMO_CREATOR_TAG,
    },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      creatorTag: DEMO_CREATOR_TAG,
      bio: "Lead Roblox content creator, animator & studio director. Producing weekly MM2 mysteries and obby machinimas.",
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200",
    },
  });
  console.log(`✓ User verified: ${user.name} (${user.id})`);

  // 2. Seed User Settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: "dark",
      emailNotifications: true,
      browserNotifications: true,
      defaultPlatform: "YOUTUBE",
      connectedYoutube: false,
      connectedTiktok: false,
    },
  });
  console.log("✓ UserSettings configured");

  // 3. Seed Characters (~10 characters)
  for (const char of INITIAL_CHARACTERS) {
    await prisma.character.upsert({
      where: { id: char.id },
      update: {
        name: char.name,
        role: char.role as never,
        description: char.description,
        personality: char.personality,
        outfit: char.outfit,
        avatar: char.avatar,
        avatarUrl: char.avatar,
        notes: char.notes,
        tags: char.tags,
      },
      create: {
        id: char.id,
        userId: user.id,
        name: char.name,
        role: char.role as never,
        description: char.description,
        personality: char.personality,
        outfit: char.outfit,
        avatar: char.avatar,
        avatarUrl: char.avatar,
        notes: char.notes,
        tags: char.tags,
        createdAt: new Date(char.createdAt),
        updatedAt: new Date(char.updatedAt),
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_CHARACTERS.length} Roblox Characters`);

  // 4. Seed Ideas (~18 ideas)
  for (const idea of INITIAL_IDEAS) {
    await prisma.idea.upsert({
      where: { id: idea.id },
      update: {
        title: idea.title,
        description: idea.description,
        category: idea.category as never,
        status: idea.status as never,
        priority: idea.priority as never,
        tags: idea.tags,
        potentialScore: idea.potentialScore,
      },
      create: {
        id: idea.id,
        userId: user.id,
        title: idea.title,
        description: idea.description,
        category: idea.category as never,
        status: idea.status as never,
        priority: idea.priority as never,
        tags: idea.tags,
        potentialScore: idea.potentialScore,
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt),
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_IDEAS.length} Ideas`);

  // 5. Seed Scripts with Scenes and DialogueLines (~5 scripts)
  for (const script of INITIAL_SCRIPTS) {
    // Check if linked idea exists
    const validIdeaId =
      script.ideaId && INITIAL_IDEAS.some((i) => i.id === script.ideaId)
        ? script.ideaId
        : null;

    // Delete existing scenes and script characters for clean re-seed
    await prisma.scriptCharacter.deleteMany({ where: { scriptId: script.id } });
    await prisma.scene.deleteMany({ where: { scriptId: script.id } });

    await prisma.script.upsert({
      where: { id: script.id },
      update: {
        ideaId: validIdeaId,
        title: script.title,
        description: script.description,
        status: script.status as never,
        hook: script.hook,
        tags: script.tags,
        estimatedDuration: script.estimatedDuration,
      },
      create: {
        id: script.id,
        userId: user.id,
        ideaId: validIdeaId,
        title: script.title,
        description: script.description,
        status: script.status as never,
        hook: script.hook,
        tags: script.tags,
        estimatedDuration: script.estimatedDuration,
        createdAt: new Date(script.createdAt),
        updatedAt: new Date(script.updatedAt),
      },
    });

    // Link Script Characters
    for (const charId of script.characters) {
      if (INITIAL_CHARACTERS.some((c) => c.id === charId)) {
        await prisma.scriptCharacter.create({
          data: {
            scriptId: script.id,
            characterId: charId,
          },
        });
      }
    }

    // Insert Scenes and Dialogue Lines
    for (let sIdx = 0; sIdx < script.scenes.length; sIdx++) {
      const scene = script.scenes[sIdx];
      const createdScene = await prisma.scene.create({
        data: {
          id: scene.id,
          scriptId: script.id,
          orderIndex: sIdx,
          title: scene.title,
          description: scene.description,
          duration: scene.duration,
          notes: scene.notes,
          characters: scene.characters,
        },
      });

      for (let dIdx = 0; dIdx < scene.dialogue.length; dIdx++) {
        const d = scene.dialogue[dIdx];
        if (INITIAL_CHARACTERS.some((c) => c.id === d.characterId)) {
          await prisma.dialogueLine.create({
            data: {
              id: d.id,
              sceneId: createdScene.id,
              characterId: d.characterId,
              text: d.text,
              emotion: d.emotion as never,
              duration: d.duration,
              orderIndex: dIdx,
            },
          });
        }
      }
    }
  }
  console.log(`✓ Seeded ${INITIAL_SCRIPTS.length} Screenplays with Scenes & Dialogue Lines`);

  // 6. Seed Videos (~14 videos)
  for (const video of INITIAL_VIDEOS) {
    const validIdeaId =
      video.ideaId && INITIAL_IDEAS.some((i) => i.id === video.ideaId)
        ? video.ideaId
        : null;
    const validScriptId =
      video.scriptId && INITIAL_SCRIPTS.some((s) => s.id === video.scriptId)
        ? video.scriptId
        : null;

    await prisma.videoCharacter.deleteMany({ where: { videoId: video.id } });

    await prisma.video.upsert({
      where: { id: video.id },
      update: {
        ideaId: validIdeaId,
        scriptId: validScriptId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        platform: video.platform as never,
        status: video.status as never,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        tags: video.tags,
        url: video.url || null,
        scheduledAt: video.scheduledAt ? new Date(video.scheduledAt) : null,
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
      },
      create: {
        id: video.id,
        userId: user.id,
        ideaId: validIdeaId,
        scriptId: validScriptId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        platform: video.platform as never,
        status: video.status as never,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        tags: video.tags,
        url: video.url || null,
        scheduledAt: video.scheduledAt ? new Date(video.scheduledAt) : null,
        publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt),
      },
    });

    for (const charId of video.characterIds) {
      if (INITIAL_CHARACTERS.some((c) => c.id === charId)) {
        await prisma.videoCharacter.create({
          data: {
            videoId: video.id,
            characterId: charId,
          },
        });
      }
    }
  }
  console.log(`✓ Seeded ${INITIAL_VIDEOS.length} Video assets with cast associations`);

  // 7. Seed Calendar Events (~10 events)
  for (const evt of INITIAL_CALENDAR_EVENTS) {
    const validVideoId =
      evt.videoId && INITIAL_VIDEOS.some((v) => v.id === evt.videoId)
        ? evt.videoId
        : null;

    await prisma.calendarEvent.upsert({
      where: { id: evt.id },
      update: {
        videoId: validVideoId,
        title: evt.title,
        type: evt.type as never,
        platform: evt.platform as never,
        status: evt.status as never,
        scheduledAt: new Date(evt.scheduledAt),
        notes: evt.notes || null,
      },
      create: {
        id: evt.id,
        userId: user.id,
        videoId: validVideoId,
        title: evt.title,
        type: evt.type as never,
        platform: evt.platform as never,
        status: evt.status as never,
        scheduledAt: new Date(evt.scheduledAt),
        notes: evt.notes || null,
        createdAt: new Date(evt.createdAt),
        updatedAt: new Date(evt.updatedAt),
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_CALENDAR_EVENTS.length} Content Calendar drops`);

  console.log("🎉 ROXIE HUB Database Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
