export type Avatar = { name: string; skin: string; hair: string; shirt: string; style: 'short' | 'long' | 'curly' };
export type Availability = 'available' | 'focus' | 'away';
export type Player = Avatar & { id: string; x: number; y: number; direction: 'up' | 'down' | 'left' | 'right'; moving: boolean; seated: boolean; seatId: string | null; hand: boolean; mic: boolean; camera: boolean; sharing: boolean; reaction: string; reactionAt: number; availability: Availability; statusText: string };
export type ChatMessage = { id: string; playerId: string; name: string; color: string; text: string; time: number; kind: 'message' | 'question'; recipientId?: string; zoneId?: string; replyTo?: string };
export type CampusEvent = { id: string; title: string; startAt: number; duration: number; zoneId: string; creatorId: string; creatorName: string };
export type MeetingNote = { id: string; text: string; zoneId: string; authorId: string; authorName: string; time: number };
export type Stroke = { id: string; color: string; width: number; points: [number, number][] };
export type PresentationSource = { kind: 'pdf' | 'image' | 'slides' | 'screen'; name: string; url: string; page: number; ownerId: string; ownerName: string; zoneId: string };
export type Room = { id: string; name: string; private: boolean };
export type JoinOptions = { profile: Avatar; roomId: string; password: string; create?: boolean; roomName?: string };
export type DeckElement = { type: 'text' | 'image' | 'shape'; x: number; y: number; w: number; h: number; text?: string; src?: string; color?: string; fill?: string; fontSize?: number; bold?: boolean };
export type Deck = { width: number; height: number; slides: DeckElement[][] };

export type WorldInteraction = { id:string; fixtureId:string; playerId:string; startedAt:number };
