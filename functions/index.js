const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
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
 * Triggered when a flight document is updated (when new audio is added)
 * Sends WhatsApp notifications to all subscribed users
 */
exports.notifyNewAudioRecording = onDocumentUpdated(
  'flights/{flightId}',
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    const flightId = event.params.flightId;
    
    // Check if audioRecordings array was updated
    const beforeAudioCount = beforeData.audioRecordings?.length || 0;
    const afterAudioCount = afterData.audioRecordings?.length || 0;
    
    // Only trigger if a new audio recording was added
    if (afterAudioCount <= beforeAudioCount) {
      console.log('No new audio recordings added, skipping notification');
      return null;
    }
    
    // Get the newly added audio recording (last item in array)
    const newAudio = afterData.audioRecordings[afterData.audioRecordings.length - 1];
    
    console.log('🎧 New audio recording detected:', newAudio.title || 'Untitled');
    console.log('Flight ID:', flightId);
    
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
    const message = buildAudioNotificationMessage(newAudio, afterData, flightId);
    
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
function buildAudioNotificationMessage(audio, flightData, flightId) {
  const title = audio.title || 'ATC Recording';
  const description = audio.description || '';
  const duration = audio.duration || 'Unknown';
  const timestamp = audio.timestamp || 'Unknown time';
  
  // Get flight details if available
  const callsign = flightData.callsign || flightData.flight_number || 'Unknown Flight';
  const departure = flightData.departure || '';
  const arrival = flightData.arrival || '';
  
  // Build the listening URL
  const baseUrl = 'https://acmappings.com'; // Update with your actual domain
  const audioUrl = audio.audioURL 
    ? `${baseUrl}${audio.audioURL}` 
    : `${baseUrl}/flights/${flightId}`;
  
  let message = `🎧 New ATC Recording Available!\n\n`;
  message += `${title}\n`;
  
  if (callsign) {
    message += `✈️ Flight: ${callsign}\n`;
  }
  
  if (departure && arrival) {
    message += `📍 ${departure} → ${arrival}\n`;
  }
  
  message += `⏱️ Duration: ${duration}\n`;
  message += `🕐 Recorded: ${timestamp}\n`;
  
  if (description) {
    message += `\n${description}\n`;
  }
  
  message += `\nListen now:\n${audioUrl}\n\n`;
  message += `Reply STOP to unsubscribe`;
  
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
 */
exports.sendTestWhatsAppNotification = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }
  
  const phoneNumber = request.data.phoneNumber;
  
  if (!phoneNumber) {
    throw new HttpsError('invalid-argument', 'Phone number required');
  }
  
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