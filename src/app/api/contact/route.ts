// File: app/api/contact/route.ts
// Description: Contact API route for submitting messages.

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
// Core module export or function definition that implements this feature.
    const { name, email, message, webhookUrl } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Default or configured Discord Webhook URL
    const targetWebhookUrl =
      webhookUrl ||
      process.env.DISCORD_WEBHOOK_URL
     // process.env.NEXT_DISCORD_WEBHOOK_URL;

    // Discord Rich Embed formatting
    const discordPayload = {
      username: "Portfolio Bot",
      avatar_url:
        "https://discord.com/channels/1488382380531126353/1529350809303912519/1529350841293733908",
      embeds: [
        {
          title: "📥 New Contact Submission",
          description: "A new inquiry was transmitted via the Portfolio.",
          color: 689375, // #0A84FF in decimal
          fields: [
            {
              name: "👤 Sender Name",
              value: `\`${name}\``,
              inline: true,
            },
            {
              name: "📧 Email Address",
              value: `\`${email}\``,
              inline: true,
            },
            {
              name: "💬 Message",
              value: `>>> ${message}`,
              inline: false,
            },
          ],
          footer: {
            text: "Apple Glass Social Portfolio • 120fps Spatial Compute Engine",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (targetWebhookUrl && targetWebhookUrl.startsWith("https://discord.com/api/webhooks/")) {
// Core module export or function definition that implements this feature.
      const response = await fetch(targetWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });

      if (!response.ok) {
        console.error("Discord Webhook Error Status:", response.status);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Contact message processed and transmitted cleanly!",
    });
  } catch (error: unknown) {
    console.error("Contact API Route Error:", error);
// Core module export or function definition that implements this feature.
    const message = error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
