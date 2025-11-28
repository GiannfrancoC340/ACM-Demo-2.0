const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

// Define environment parameters
const twilioSid = defineString('TWILIO_SID');
const twilioToken = defineString('TWILIO_TOKEN');
const twilioWhatsappNumber = defineString('TWILIO_WHATSAPP_NUMBER');

/**
 * Triggered when a new audio recording is added to Firestore
 * Sends WhatsApp notifications to all subscribed users
 */
exports.notifyNewAudioRecording = onDocumentCreated(
  'audioRecordings/{recordingId}',
  async (event) => {
    const recording = event.data.data();
    const recordingId = event.params.recordingId;
    
    console.log('🎧 New audio recording detected:', recordingId);
    
    // Initialize Twilio client
    const client = twilio(twilioSid.value(), twilioToken.value());
    
    // Get all users with WhatsApp notifications enabled
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('whatsappNotificationsEnabled', '==', true)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('📭 No users subscribed to audio notifications');
      return null;
    }
    
    console.log(`📤 Sending to ${usersSnapshot.size} users`);
    
    // Build the notification message
    const message = buildAudioNotificationMessage(recording, recordingId);
    
    // Send to all subscribed users
    const promises = [];
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.whatsappNumber) {
        promises.push(
          sendWhatsAppMessage(client, user.whatsappNumber, message, twilioWhatsappNumber.value())
            .catch(error => {
              console.error(`Failed to send to ${user.whatsappNumber}:`, error.message);
            })
        );
      }
    });
    
    await Promise.allSettled(promises);
    console.log('✅ Notifications sent!');
    
    return null;
  }
);

/**
 * Build the WhatsApp message content
 */
function buildAudioNotificationMessage(recording, recordingId) {
  const date = recording.date || 'Unknown date';
  const time = recording.time || 'Unknown time';
  const frequency = recording.frequency || 'BCT Tower';
  const duration = recording.duration || 'Unknown';
  
  // Build the listening URL
  const baseUrl = 'https://acmappings.com'; // Update this with your actual domain
  const audioUrl = `${baseUrl}/audio?id=${recordingId}`;
  
  const message = 
    `🎧 New ATC Recording Available!\n\n` +
    `${frequency}\n` +
    `📅 ${date} - ${time}\n` +
    `⏱️ Duration: ${duration}\n\n` +
    `Listen now:\n${audioUrl}\n\n` +
    `Reply STOP to unsubscribe`;
  
  return message;
}

/**
 * Send WhatsApp message via Twilio
 */
async function sendWhatsAppMessage(client, phoneNumber, message, fromNumber) {
  try {
    const result = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${phoneNumber}`,
      body: message
    });
    
    console.log(`✅ Sent to ${phoneNumber}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send to ${phoneNumber}:`, error.message);
    throw error;
  }
}

/**
 * Callable function to send test notification
 * Call from your app to test WhatsApp notifications
 */
exports.sendTestWhatsAppNotification = onCall(async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const phoneNumber = request.data.phoneNumber;
  
  if (!phoneNumber) {
    throw new HttpsError('invalid-argument', 'Phone number required');
  }
  
  // Initialize Twilio client
  const client = twilio(twilioSid.value(), twilioToken.value());
  
  const testMessage = 
    `🎧 Test Notification from ACM Flight Tracking\n\n` +
    `This is a test message. You'll receive notifications like this when new ATC recordings are available.\n\n` +
    `✅ Your WhatsApp is connected!\n\n` +
    `Reply STOP to unsubscribe`;
  
  try {
    await sendWhatsAppMessage(client, phoneNumber, testMessage, twilioWhatsappNumber.value());
    return { success: true, message: 'Test notification sent!' };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});