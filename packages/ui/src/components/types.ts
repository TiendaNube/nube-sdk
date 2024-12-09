export type SizeUnit = "em" | "rem" | "px" | "%";
export type Size = `${number}${SizeUnit}` | number | "auto";
export type SecurityURL = `https://${string}`;
export type FlexContent =
  | "start"
  | "center"
  | "space-between"
  | "space-arround"
  | "space-evenly";

export type FlexItems = "start" | "center" | "end" | "stretch";

export type NubeComponent = {
  type: string;
  [key: string]: unknown;
};

export type TxtModifier =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "lowercase"
  | "uppercase"
  | "capitalize";
