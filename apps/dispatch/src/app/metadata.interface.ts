export interface MetadataValue {
  label: string | null;
  uri: string | null;  
}

export interface CustomMetadata {
  attribute: MetadataValue;
  value: MetadataValue;
}

export interface CombineArchiveElementMetadata {
  uri: string;
  title: string;
  abstract: string;
  keywords: string[];
  description: string;
  thumbnails: string[];
  taxa: MetadataValue[];
  encodes: MetadataValue[];
  sources: MetadataValue[];
  predecessors: MetadataValue[];
  successors: MetadataValue[];
  seeAlso: MetadataValue[];
  other: CustomMetadata[];
  creators: MetadataValue[];
  contributors: MetadataValue[];
  identifiers: MetadataValue[];
  citations: MetadataValue[];
  license: MetadataValue;
  funders: MetadataValue[];
  created: string;
  modified: string[];
  click?: () => void;
}
