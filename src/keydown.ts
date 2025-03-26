import iohook from 'iohook';

iohook.on('keydown', event => {
    // Example: Check if the hotkey is 'Ctrl+H'
    if (event.ctrlKey && event.keycode === 35) { // 35 is the 'H' key
        console.log('Hello world');
    }
});

iohook.start();
