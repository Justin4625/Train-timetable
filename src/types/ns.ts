export interface NSMessage {
    id?: string;
    message: string;           // De melding/waarschuwing
    type: 'CAUTION' | 'INFORMATION' | 'DISRUPTION'; // Type melding
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';  // Ernst van de melding
}

export interface NSArrival {
    origin: string;           // Waar komt de trein vandaan?
    name: string;             // Treinnummer/naam (bijv. Sprinter 4000)
    plannedDateTime: string;      // Geplande aankomsttijd (ISO string)
    actualDateTime: string;       // Werkelijke aankomsttijd (inclusief vertraging)
    plannedTrack?: string;    // Gepland spoor
    actualTrack?: string;     // Werkelijk spoor (kan afwijken!)
    trainCategory: string;    // Intercity, Sprinter, etc.
    cancelled: boolean;       // Is de trein uitgevallen?
    arrivalStatus: 'ON_TIME' | 'DELAYED' | 'CANCELLED'; // Status van de rit
    journeyDetailRef: string; // Link naar meer details over de reis
    messages?: NSMessage[];   // Meldingen/waarschuwingen voor deze trein
}


export interface NSArrivalsResponse {
    arrivals: NSArrival[];
    messages?: NSMessage[];   // Algemene meldingen
}