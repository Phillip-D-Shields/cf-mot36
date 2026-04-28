// Shared constants for the roster system

export const RANKS = [
	'Firefighter',
	'Senior Firefighter',
	'Qualified Firefighter',
	'Station Officer',
	'Senior Station Officer',
	'Chief Fire Officer'
] as const;

export const LICENSE_CLASSES = [
	'Learner',
	'Full',
	'Class 2 Learner',
	'Class 2',
	'Class 4 Learner',
	'Class 4'
] as const;

export const VEHICLE_TYPES = [
	'appliance',
	'tanker',
	'van',
	'support'
] as const;

export const LICENSE_REQUIRED_OPTIONS = [
	'Full',
	'Class 2',
	'Class 4'
] as const;

export type Rank = (typeof RANKS)[number];
export type LicenseClass = (typeof LICENSE_CLASSES)[number];
export type VehicleType = (typeof VEHICLE_TYPES)[number];