export interface Masjid {
    $id: string;
    Name: string;
    Location: string;
    Count: number;
    LogoID: string;
    Goal: number;
    Description: string;
}

export interface Activity {
    $id: string;
    Count: number;
    masjid: Masjid["$id"] | Masjid;
    $createdAt?: string;
}