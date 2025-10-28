    // This file will hold all the complex logic for
    // 1. Getting microphone permissions
    // 2. Starting/Stopping the audio stream
    // 3. Connecting to the WebSocket
    // 4. Sending audio data
    // 5. Receiving transcript/validation messages

    // We can't build this until the backend is working.
    // But this is where the code will live.

    export const startRecording = (patientId, token) => {
      console.log('TODO: Start recording for ' + patientId);
      // 1. Ask for mic permission
      // 2. Connect to WebSocket
      // 3. Start streaming audio
    };

    export const stopRecording = () => {
      console.log('TODO: Stop recording');
      // 1. Send "stop" message
      // 2. Close WebSocket
      // 3. Stop audio stream
    };
    
