import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/scan';

import 'rxjs/add/operator/do';

/**
 * Provides an Observable of all currently available media devices.
 */
export class ReactiveMediaDevices {

    private static instance: ReactiveMediaDevices;

    public allDevices$: Observable<MediaDeviceInfo[]>;

    static getInstance() {

        if ( !ReactiveMediaDevices.instance ) {
            ReactiveMediaDevices.instance = new ReactiveMediaDevices();
        }

        return ReactiveMediaDevices.instance;
    }

    private constructor() {

        // observable of all available devices
        this.allDevices$ = Observable.timer( 0, 3000 )
            .flatMap( this.getAvailableDevices )
            .distinctUntilChanged( null, this.deviceListToString )
            .share();

    }

    /**
     * Gets all available media devices
     */
    getAvailableDevices(): Observable<MediaDeviceInfo[]> {
        return Observable.fromPromise( navigator.mediaDevices.enumerateDevices() );
    }

    /**
     * Reduces a list of MediaDeviceInfo objects to a
     * string of their deviceIds separated by commas
     */
    deviceListToString( devices ) {

        const toDeviceIdString = ( deviceString, currentDevice ) => {
            return deviceString + currentDevice.deviceId + ', ';
        };

        return devices.reduce( toDeviceIdString, '' );
    }

}
