import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReactiveMediaDevices } from './reactive-media-devices';
import 'rxjs/add/operator/filter';

export class ReactiveDeviceManager {

    public availableDevices$: Observable<MediaDeviceInfo[]>;
    public defaultDevice$: Observable<MediaDeviceInfo>;
    public selectedDevice$: Subject<MediaDeviceInfo>;

    private deviceType: string;
    private mediaDeviceService: ReactiveMediaDevices;
    private rawDeviceList$: Observable<MediaDeviceInfo[]>;

    constructor( deviceType: string = undefined ) {

        this.deviceType = deviceType;

        this.selectedDevice$ = new Subject();
        this.mediaDeviceService = ReactiveMediaDevices.getInstance();

        this.initialiseObservableStreams();
    }

    /**
     * Sets up the observable streams used for the lifetime of this device manager.
     */
    initialiseObservableStreams() {

        // all devices of the requested type
        this.rawDeviceList$ = this.mediaDeviceService.allDevices$
            .map( devices => this.filterDevicesByType(devices) )
            .share();

        // observable of the array of suitable devices
        this.availableDevices$ = this.rawDeviceList$
            .map( devices => devices.filter(this.excludeDefaultDevice) )
            .share();

        // observable of the default device, if any
        this.defaultDevice$ = this.rawDeviceList$
            .flatMap( this.arrayToDevices )
            .scan( this.defaultOrFirstDevice )
            .filter( this.excludeDefaultDevice )
            .share();

        // combine the device list and default device
        // to get the default selection
        Observable.combineLatest( this.availableDevices$, this.defaultDevice$, this.findDefaultInDevices )
            .subscribe( selected => this.setSelectedDevice(selected) );

    }

    /**
     * This filter returns false for any default device
     */
    excludeDefaultDevice( device ) {
        return device.deviceId !== 'default';
    }


    /**
     * Filters a device array for only the required type of device
     */
    filterDevicesByType( devices ) {
        return devices.filter( device => device.kind === this.deviceType );
    }

    /**
     * Splits an array of MediaDevices into individual devices
     */
    arrayToDevices( deviceArray ): Observable<MediaDeviceInfo> {
        return Observable.from( deviceArray );
    }

    /**
     * Selects the first device, which will be the default if there is one.
     * Replaces when it finds the matching actual device, if any.
     * @param deviceToSelect (accumulator) previously identified "default"
     * @param curr 
     */
    defaultOrFirstDevice( deviceToSelect, currentDevice ) {

        if ( !deviceToSelect ) {
            return currentDevice;
        }

        if ( currentDevice.groupId === deviceToSelect.groupId ) {
            deviceToSelect = currentDevice;
        }

        return deviceToSelect;

    }

    /**
     * Filter array to include only the default device,
     * or otherwise select the first alternate option
     */
    findDefaultInDevices(devices, defaultDevice) {

        let selected;

        if ( defaultDevice ) {
            selected = devices.find( device => device.groupId === defaultDevice.groupId);
        }

        if ( !selected && devices.length > 0 ) {
            selected = devices[0];
        }

        return selected;
    }

    public setSelectedDevice(device) {
        console.log('selected %s: %s (%s)', this.deviceType, device.label, device.deviceId);
        this.selectedDevice$.next( device );
    }


}
