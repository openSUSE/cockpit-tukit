// Copied and modified from https://github.com/matanshiloah/xml-parser/pull/42

declare module "react-xml-parser" {
	interface XMLElement {
		name: string;
		attributes: {
			[name: string]: string;
		};
		value: string;
		children: XMLElement[];
	}

	export default class XMLParser {
		constructor();
		public parseFromString(string: string): XMLParser;
		public toString(xml: XMLElement): string;
		public getElementsByTagName(tagName: string): XMLElement[];
	}
}
