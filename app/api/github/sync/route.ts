import { NextRequest, NextResponse } from "next/server";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

function generateThreadMarkdown(thread: any, parts: any[]) {
  let md = `# 🎞️ ${thread.title || "Noir Chronicle"}\n\n`;
  md += `*Captured on the gritty streets of Pulp Noir*\n\n`;
  md += `**Thread ID:** \`${thread.id}\`  \n`;
  md += `**Created At:** ${new Date(thread.createdAt).toLocaleString()}  \n`;
  md += `**Last Updated:** ${new Date(thread.updatedAt || thread.createdAt).toLocaleString()}  \n\n`;
  md += `---\n\n`;

  // Sort parts by createdAt ascending
  const sortedParts = [...parts].sort((a, b) => a.createdAt - b.createdAt);

  sortedParts.forEach((part, idx) => {
    md += `### Chronicle Section #${idx + 1} (${(part.type || "text").toUpperCase()})\n\n`;

    // Check if there is an image or visual
    if (part.type === "image" || part.content?.startsWith("data:image") || part.content?.startsWith("http")) {
      if (part.content?.startsWith("http") || part.content?.startsWith("data:image")) {
        md += `![Pulp Illustration](${part.content})\n\n`;
      } else {
        md += `*${part.content}*\n\n`;
      }
    } else {
      // Standard text/pulp stories
      md += `${part.content}\n\n`;
    }

    // Choices
    if (part.choices && part.choices.length > 0) {
      md += `**Decisions faced:**\n`;
      part.choices.forEach((choice: string) => {
        const isSelected = part.selectedChoice === choice;
        md += `- [${isSelected ? "x" : " "}] ${choice}\n`;
      });
      md += `\n`;
    }

    // Audio/Music
    if (part.audioUrl || part.musicUrl) {
      md += `**Audio Records:**\n`;
      if (part.audioUrl) {
        md += `- [🎙️ Listen to Narration](${part.audioUrl})\n`;
      }
      if (part.musicUrl) {
        md += `- [🎵 Listen to Background Track](${part.musicUrl})\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

function generateReadmeMarkdown(repoName: string, threads: any[]) {
  let md = `# 🎞️ Pulp Noir Chronicles: ${repoName}\n\n`;
  md += `> "In this city, stories are the only currency that doesn't lose value overnight. But like everything else, they're written in blood, grit, and shadows."\n\n`;
  md += `Welcome to your personal archive of gritty noir tales, narrated cinemas, and back-alley item songs, automatically synced from **Pulp Noir: The Gritty Storyteller**.\n\n`;
  md += `## 📜 Synced Chronicles\n\n`;

  if (threads.length === 0) {
    md += `*No chronicles have been synced yet. Take to the streets and write your first tale!*\n`;
  } else {
    md += `| Title | Created Date | Link |\n`;
    md += `| :--- | :--- | :--- |\n`;
    threads.forEach((thread) => {
      const slug = slugify(thread.title || thread.id);
      md += `| **${thread.title || "Untitled Chronicle"}** | ${new Date(thread.createdAt).toLocaleDateString()} | [View Chronicle](./stories/${slug}.md) |\n`;
    });
  }

  md += `\n\n---\n*Created and maintained by Pulp Noir AI Storyteller.*`;
  return md;
}

async function getFileSha(owner: string, repo: string, path: string, token: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "pulp-noir-storyteller",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (res.status === 200) {
      const data = await res.json();
      return data.sha;
    }
  } catch (err) {
    console.error(`Error fetching SHA for ${path}:`, err);
  }
  return undefined;
}

async function writeGithubFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  commitMessage: string,
  token: string
) {
  const sha = await getFileSha(owner, repo, path, token);
  const base64Content = Buffer.from(content).toString("base64");

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "pulp-noir-storyteller",
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      sha,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to write file ${path}: ${errText}`);
  }
  return await res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { token, username, repoName, isPrivate, stories, threads } = await req.json();

    if (!token || !username || !repoName) {
      return NextResponse.json({ error: "Missing required parameters (token, username, repoName)." }, { status: 400 });
    }

    const cleanRepoName = slugify(repoName);

    // 1. Check if the repository exists, create it if not
    let repoExists = false;
    const checkRepoRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepoName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "pulp-noir-storyteller",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (checkRepoRes.status === 200) {
      repoExists = true;
    } else if (checkRepoRes.status === 404) {
      // Create repository
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "pulp-noir-storyteller",
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanRepoName,
          description: "My collection of gritty pulp noir visual stories, item songs, and narrated cinema chronicles. Synced from Pulp Noir: The Gritty Storyteller.",
          private: isPrivate ?? false,
          auto_init: true, // Auto init with empty README so we have a main branch
        }),
      });

      if (!createRepoRes.ok) {
        const errText = await createRepoRes.text();
        throw new Error(`Failed to create repository: ${errText}`);
      }
      repoExists = true;
      // Wait briefly for GitHub to initialize the repo
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else {
      const errText = await checkRepoRes.text();
      throw new Error(`Failed to check repository existence: ${errText}`);
    }

    // 2. Synchronize stories
    const syncedThreadsList: any[] = [];
    const validStories = Array.isArray(stories) ? stories : [];
    const validThreads = Array.isArray(threads) ? threads : [];

    // Group stories by threadId
    const storiesByThread: { [key: string]: any[] } = {};
    validStories.forEach((story) => {
      const threadId = story.threadId || "loose-logs";
      if (!storiesByThread[threadId]) {
        storiesByThread[threadId] = [];
      }
      storiesByThread[threadId].push(story);
    });

    // Write thread files
    for (const threadId of Object.keys(storiesByThread)) {
      let threadObj = validThreads.find((t) => t.id === threadId);
      if (!threadObj) {
        if (threadId === "loose-logs") {
          threadObj = { id: "loose-logs", title: "Loose Detective Logs", createdAt: Date.now() };
        } else {
          // Fallback thread object
          const parts = storiesByThread[threadId];
          const firstPart = parts[0];
          threadObj = {
            id: threadId,
            title: firstPart?.content?.substring(0, 30) + "..." || `Thread ${threadId}`,
            createdAt: firstPart?.createdAt || Date.now(),
          };
        }
      }

      const markdown = generateThreadMarkdown(threadObj, storiesByThread[threadId]);
      const fileSlug = slugify(threadObj.title || threadObj.id);
      const filePath = `stories/${fileSlug}.md`;

      await writeGithubFile(
        username,
        cleanRepoName,
        filePath,
        markdown,
        `Update chronicle: ${threadObj.title || threadObj.id}`,
        token
      );

      syncedThreadsList.push(threadObj);
    }

    // 3. Generate and write README.md
    const readmeContent = generateReadmeMarkdown(cleanRepoName, syncedThreadsList);
    await writeGithubFile(username, cleanRepoName, "README.md", readmeContent, "Update main archive index", token);

    const repoUrl = `https://github.com/` + username + `/` + cleanRepoName;

    return NextResponse.json({
      success: true,
      repoUrl,
      syncedThreadsCount: syncedThreadsList.length,
      syncedStoriesCount: validStories.length,
    });
  } catch (error: any) {
    console.error("GitHub Sync error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred during sync." }, { status: 500 });
  }
}
