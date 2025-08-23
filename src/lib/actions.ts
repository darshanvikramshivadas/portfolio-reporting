// lib/actions.ts
'use server';

import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendReportEmail = async (imageBase64: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Reporter <onboarding@resend.dev>', // Use a verified domain in production
      to: ['ayushi.singh.kvs.1903@gmail.com'],
      subject: 'Your Automated Portfolio Performance Report',
      html: `
        <h1>Portfolio Report</h1>
        <p>Please find your latest portfolio performance report attached to this email.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      `,
      attachments: [
        {
          filename: 'portfolio-report.png',
          content: imageBase64, // The Base64 string of the image
        },
      ],
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("Resend Success:", data);
    return { success: true, data };

  } catch (exception) {
    console.error("Email Sending Exception:", exception);
    return { success: false, error: "An unexpected error occurred." };
  }
};