# reactive-user-media

Provides a reactive API for working with media devices such as microphone, camera and speakers.

## Installation

Install with npm:

```
npm i reactive-user-media --save
```


## Basic Usage

Create a device manager for each device type you want to use.

```
let microphoneManager = new ReactiveDeviceManager('audioinput');

```

The available device types are: 

- audioinput
- audiooutput
- videoinput


## Available Devices

Get the list of available devices by subscribing to `availableDevices$`:

```
microphoneManager.availableDevices$
    .subscribe( devices => console.log('microphones:', devices) );
```

This subscription will trigger every time a user adds or removes a microphone.


## Selected Device

Get the currently selected device by subscribing to `selectedDevice$`:

```
microphoneManager.selectedDevice$
    .subscribe( selectedDevice => console.log('selected microphone:', selectedDevice) );
```

This subscription will trigger once when the manager automatically selects the default device.

It will also trigger each time the selected device is updated.


## Selecting a Device

Set the selected device by calling `setSelectedDevice`:

```
microphoneManager.setSelectedDevice( device );
```

