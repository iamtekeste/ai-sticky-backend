import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/aws-lambda";
import { logger } from "hono/logger";

import { HumanMessage } from "@langchain/core/messages";
import { ChatAnthropic } from "@langchain/anthropic";

const app = new Hono();
app.use(logger());
app.use(
  cors({
    origin: "*", // allow all origins for now, but will be restricted later
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  })
);

app.post("/analyze", async (c) => {
  const body = await c.req.parseBody();
  const image = body["image"];

  if (!image || Array.isArray(image) || typeof image === "string") {
    return c.text("No image uploaded or invalid image", 400);
  }

  const imageData = await image.arrayBuffer();
  const imageUrl = `data:${image.type};base64,${Buffer.from(imageData).toString(
    "base64"
  )}`;

  const model = new ChatAnthropic({
    temperature: 0.9,
    model: "claude-3-sonnet-20240229",
  });

  const message = new HumanMessage({
    content: [
      {
        type: "text",
        text: `
            Extract all the text and color of each note in this image and return ONLY an array/json of objects that match this typescript type
            type Note = {
                color: string; // in hex code
                text: string;
            }
            `,
      },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  const res = await model.invoke([message]);
  const analysis = res.content;

  return c.text(analysis.toString(), 200);
});

export const handler = handle(app);
