/**
 * App Settings types for the Nube SDK
 *
 * These types represent the app settings values that are stored in the database
 * and can be retrieved by apps via the SDK.
 */

/**
 * The type of an app setting, as defined in the settings schema
 */
export type AppSettingType = "string" | "enrichedText" | "image" | "collection";

/**
 * Possible value types based on the app setting type:
 * - string: plain text value
 * - enrichedText: Markdown-formatted rich text
 * - image: URL to an image
 * - collection with itemType string/enrichedText/image: array of strings
 * - collection with itemType object: array of objects (shape defined by itemSchema)
 */
export type AppSettingValueData = string | string[] | Record<string, unknown>[];

/**
 * A single app setting value entry
 */
export interface AppSettingValue {
	/** The type of the app setting (matches the schema type) */
	type: AppSettingType;
	/** The actual value - type depends on the app setting type */
	value: AppSettingValueData;
}

/**
 * Represents the app settings values stored in the database.
 * Each key is an app setting identifier, and the value contains the type and actual value.
 */
export type AppSettingsValues = Record<string, AppSettingValue>;
