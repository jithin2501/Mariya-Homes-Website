const Contact = require('../models/Contact');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// POST: Contact Form
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Save to MongoDB (for admin panel)
    const newMessage = new Contact({ name, email, phone, message });
    await newMessage.save();

    // Send email via Resend
    await resend.emails.send({
      from: 'Mariya Homes <onboarding@resend.dev>', // Change to your verified domain e.g: noreply@mariyahomes.com
      to: process.env.ADMIN_EMAIL,                  // Your admin email address
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="font-family: Arial, sans-serif; font-size: 15px; border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 8px;">${name}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Phone:</td>
            <td style="padding: 8px;">${phone || 'Not provided'}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 8px; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <p style="font-family: Arial, sans-serif; font-size: 13px; color: #888; margin-top: 24px;">
          This message was sent from the contact form on mariyahomes.com
        </p>
      `,
    });

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET: Admin - All Messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// DELETE: Admin - Delete Message
exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted permanently' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};