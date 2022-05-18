import axios, { AxiosResponse } from 'axios';
import { Vector3 } from 'three';

export type IssLocation = {
    longitude: number;
    latitude: number;
}

type IssLocationDTO = {
    name: string,
    id: number,
    latitude: number,
    longitude: number,
    altitude: number,
    velocity: number,
    visibility: string,
    footprint: number,
    timestamp: number,
    daynum: number,
    solar_lat: number,
    solar_lon: number,
    units: string
}

export const getIssLocation = async (): Promise<IssLocation> => {
    return axios.get('https://api.wheretheiss.at/v1/satellites/25544')
        .then(({ data }: AxiosResponse<IssLocationDTO>) => {
            return {
                longitude: data.longitude,
                latitude: data.latitude
            };
        })
        .catch((e) => {
            throw `An error occured while trying to get the current ISS location: ${e}`
        })
}

export const mapCoordsToVec3 = (location: IssLocation): Vector3 => {
    var phi = (90 - location.latitude) * (Math.PI / 180);
    var theta = (location.longitude + 180) * (Math.PI / 180);
    let radius = 1.1;

    let x = -(radius * Math.sin(phi) * Math.cos(theta));
    let z = (radius * Math.sin(phi) * Math.sin(theta));
    let y = (radius * Math.cos(phi));

    return new Vector3(x, y, z);
}
